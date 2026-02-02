
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
        // Using taskkill to be sure
        exec('taskkill /F /IM node.exe /T', (err) => {
            // This might kill the script itself, but that's fine as we are done
        });
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
