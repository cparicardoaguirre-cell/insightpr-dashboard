
import { spawn, exec } from 'child_process';
// Native fetch is available in Node.js 18+

import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001';
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'data');

// Ensure public data dir exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
    console.log('🚀 Starting local backend server...');
    const server = spawn('node', ['server/index.js'], {
        stdio: 'inherit',
        shell: true
    });

    // Wait for server to be ready
    let ready = false;
    let attempts = 0;
    while (!ready && attempts < 30) {
        try {
            await sleep(2000); // Wait 2s
            const res = await fetch(`${API_URL}/api/compliance-docs`, { timeout: 1000 }).catch(() => null);
            if (res && res.ok) {
                ready = true;
                console.log('✅ Server is ready!');
            } else {
                process.stdout.write('.');
            }
        } catch (e) {
            process.stdout.write('.');
        }
        attempts++;
    }

    if (!ready) {
        console.error('❌ Server failed to start.');
        server.kill();
        process.exit(1);
    }

    return server;
}

async function runUpdate() {
    const serverProcess = await startServer();

    try {
        // 1. Sync Ratios
        console.log('\n📊 Syncing Financial Ratios from Excel...');
        const ratiosRes = await fetch(`${API_URL}/api/financial-ratios/sync`);
        const ratiosData = await ratiosRes.json();

        if (ratiosData.success) {
            console.log('✅ Ratios synced successfully.');
            // Save to public static file
            fs.writeFileSync(path.join(PUBLIC_DIR, 'financial_ratios.json'), JSON.stringify(ratiosData.data, null, 2));
            console.log('💾 Saved to public/data/financial_ratios.json');
        } else {
            console.error('❌ Failed to sync ratios:', ratiosData.error);
        }

        // 2. Generate Executive Summary (Dual Language)
        const languages = ['es', 'en'];
        console.log('\n🤖 Generating AI Executive Summaries (this uses NotebookLM)...');

        for (const lang of languages) {
            console.log(`   📝 Generating for language: ${lang.toUpperCase()}...`);
            const summaryRes = await fetch(`${API_URL}/api/executive-summary/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: lang })
            });
            const summaryData = await summaryRes.json();

            if (summaryData.success) {
                const filename = `executive_summary_${lang}.json`;
                console.log(`   ✅ Summary generated (${summaryData.source}).`);
                fs.writeFileSync(path.join(PUBLIC_DIR, filename), JSON.stringify(summaryData, null, 2));
                console.log(`   💾 Saved to public/data/${filename}`);

                // Fallback/Default copy for 'es' (historical compatibility)
                if (lang === 'es') {
                    fs.writeFileSync(path.join(PUBLIC_DIR, 'executive_summary.json'), JSON.stringify(summaryData, null, 2));
                }
            } else {
                console.error(`   ❌ Failed to generate summary for ${lang}:`, summaryData.error);
            }
            // Small pause between requests
            await sleep(1000);
        }

        // 3. Generate Detailed Analysis (Dual Language)
        console.log('\n🤖 Generating Detailed Analysis (Markdown)...');
        for (const lang of languages) {
            console.log(`   📝 Generating Analysis for language: ${lang.toUpperCase()}...`);

            let prompt = "";
            let ratiosJson = "";
            try {
                // We need to pass the ratios as context because /api/chat is stateless w.r.t our latest file sync
                // However, /api/chat sends the query to the Notebook. The Notebook SHOULD have the sources.
                // But to be safe and match the frontend, we'll embed the data in the prompt or rely on the notebook having the source file.
                // Since we just synced ratios, the file is on disk. But NotebookLM needs to "read" it? 
                // Actually, the server/notebook integration relies on the notebook *already* having the source. 
                // Frontend logic (lines 328+ of FinancialAnalysis.tsx) sends "Based on the audited financial statements file...". 
                // We will use the exact same prompt strategy as the frontend.

                const langInstruction = lang === 'es'
                    ? 'IMPORTANTE: Responde COMPLETAMENTE en español. Todas las explicaciones, análisis e interpretaciones deben estar en español.\n\n'
                    : 'IMPORTANT: Respond COMPLETELY in English. All explanations, analysis, and interpretations must be in English.\n\n';

                prompt = langInstruction + `COMPREHENSIVE FINANCIAL RATIO ANALYSIS REQUEST(NLTS - PR FS 12 31 2024):

Based on the audited financial statements file "NLTS-PR FS 12 31 2024 Rev156-3", provide a complete financial ratio analysis.

EXTRACT AND CALCULATE THE FOLLOWING RATIOS:

1. LIQUIDITY RATIOS:
- Current Ratio(Current Assets / Current Liabilities)
- Quick Ratio((Current Assets - Inventory) / Current Liabilities)
- Cash Ratio(Cash & Equivalents / Current Liabilities)
- Working Capital(Current Assets - Current Liabilities)

2. PROFITABILITY RATIOS:
- Gross Profit Margin(Gross Profit / Revenue × 100)
- Operating Profit Margin(Operating Income / Revenue × 100)
- Net Profit Margin(Net Income / Revenue × 100)
- Return on Assets(ROA)(Net Income / Total Assets × 100)
- Return on Equity(ROE)(Net Income / Shareholders' Equity × 100)
- EBITDA Margin(EBITDA / Revenue × 100)

3. LEVERAGE / SOLVENCY RATIOS:
- Debt-to-Equity Ratio(Total Liabilities / Shareholders' Equity)
- Debt-to-Assets Ratio(Total Liabilities / Total Assets)
- Interest Coverage Ratio(EBIT / Interest Expense)
- Equity Multiplier(Total Assets / Shareholders' Equity)

4. EFFICIENCY RATIOS:
- Asset Turnover(Revenue / Average Total Assets)
- Inventory Turnover(COGS / Average Inventory)
- Days Sales Outstanding(Accounts Receivable / Revenue × 365)
- Days Payable Outstanding(Accounts Payable / COGS × 365)
- Accounts Receivable Turnover(Revenue / Average Accounts Receivable)

5. CASH FLOW RATIOS:
- Operating Cash Flow Ratio(Operating Cash Flow / Current Liabilities)
- Free Cash Flow(Operating Cash Flow - Capital Expenditures)
- Cash Flow to Debt Ratio(Operating Cash Flow / Total Debt)

For EACH RATIO provide:
- Calculated value for NLTS-PR
- Industry benchmark
- Variance percentage
- Status (above/below/at)
- Brief explanation

Return a JSON object with this EXACT structure:
{
    "companySnapshot": {
        "totalRevenue": number,
        "netIncome": number,
        "totalAssets": number,
        "totalEquity": number,
        "fiscalYear": "2024"
    },
    "ratioCategories": [
        {
            "category": "Liquidity Ratios",
            "description": "...",
            "ratios": [
                {
                    "name": "Current Ratio",
                    "formula": "...",
                    "value": number,
                    "industryBenchmark": number,
                    "variance": number,
                    "status": "above|below|at",
                    "interpretation": "..."
                }
            ]
        }
    ],
    "overallAnalysis": "..."
}`;
            } catch (e) { console.error(e); }

            const chatRes = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt })
            });

            const chatData = await chatRes.json();

            // Parse response similar to frontend
            let rawContent = chatData.content || "";
            let parsedData = {};

            try {
                const wrapperJson = JSON.parse(rawContent);
                if (wrapperJson.status === "success" && wrapperJson.answer) {
                    rawContent = wrapperJson.answer;
                }
            } catch (e) { }

            const jsonMatch = rawContent.match(/\{[\s\S]*"ratioCategories"[\s\S]*\}/) || rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsedData = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    parsedData = { rawAnswer: rawContent, error: "Parse failed" };
                }
            } else {
                parsedData = { rawAnswer: rawContent };
            }

            if (parsedData) {
                const filename = `detailed_analysis_${lang}.json`;
                console.log(`   ✅ Analysis generated.`);
                fs.writeFileSync(path.join(PUBLIC_DIR, filename), JSON.stringify(parsedData, null, 2));
                console.log(`   💾 Saved to public/data/${filename}`);
            } else {
                console.error(`   ❌ Failed to generate analysis for ${lang}`);
            }

            // Small pause
            await sleep(2000);
        }

        // 3. Scan Compliance Documents
        console.log('\n📂 Scanning Compliance Documents...');
        const docsRes = await fetch(`${API_URL}/api/compliance-docs`);
        const docsData = await docsRes.json();

        if (docsData.success) {
            console.log(`✅ Scanned ${docsData.totalFiles} documents.`);
            fs.writeFileSync(path.join(PUBLIC_DIR, 'compliance_docs.json'), JSON.stringify(docsData, null, 2));
            console.log('💾 Saved to public/data/compliance_docs.json');
        } else {
            console.error('❌ Failed to scan documents:', docsData.error);
        }

    } catch (e) {
        console.error('❌ Error during update:', e);
    } finally {
        console.log('\n🛑 Stopping server...');
        // On Windows, killing the node process might not kill spawned children (python), but usually it's okay for short scripts
        // on Windows, killing the node process might not kill spawned children (python), so we use taskkill /PID /T /F
        if (serverProcess && serverProcess.pid) {
            exec(`taskkill /PID ${serverProcess.pid} /T /F`, (err) => {
                if (err) console.log("Server stopped clean.");
            });
        }
        // We will continue to Git step if script survives or relies on batch
    }
}

// Check if running directly
if (process.argv[1] === import.meta.url || true) { // Always run
    runUpdate().then(() => {
        // Git operations moved to the batch file to avoid self-termination issues
        console.log('\n✨ Update sequence completed. Ready for deployment.');
    });
}
