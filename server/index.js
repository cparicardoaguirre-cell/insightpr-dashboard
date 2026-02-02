
import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

console.log('Loading modules...');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const PYTHON_PATH = String.raw`C:\Users\cpari\.gemini\antigravity\GoogleNotebookLM\.venv\Scripts\python.exe`;
const MCP_MODULE = 'notebooklm_tools.mcp.server';

let pythonProcess = null;
let msgId = 0;
const pendingRequests = new Map();
let activeNotebookId = null;

function startProcess() {
    console.log('Function startProcess called.');
    console.log(`Spawning ${PYTHON_PATH} -m ${MCP_MODULE}`);

    try {
        pythonProcess = spawn(PYTHON_PATH, ['-m', MCP_MODULE], {
            stdio: ['pipe', 'pipe', process.stderr]
        });
        console.log('Spawn command executed.');
    } catch (e) {
        console.error('Spawn failed synchronously:', e);
        return;
    }

    let buffer = '';

    pythonProcess.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const json = JSON.parse(line);
                if (json.id && pendingRequests.has(json.id)) {
                    const { resolve, reject } = pendingRequests.get(json.id);
                    if (json.error) reject(json.error);
                    else resolve(json.result);
                    pendingRequests.delete(json.id);
                }
            } catch (e) {
                // ignore
            }
        }
    });

    pythonProcess.on('error', (err) => {
        console.error('Python process error:', err);
    });

    pythonProcess.on('exit', (code) => {
        console.log('Python process exited with code:', code);
    });

    // Initialize logic
    console.log('Triggering initializeMCP...');
    initializeMCP().catch(err => {
        console.error('Error in initializeMCP:', err);
    });
}

function sendRequest(method, params) {
    if (!pythonProcess) {
        startProcess();
    }

    return new Promise((resolve, reject) => {
        msgId++;
        const req = {
            jsonrpc: "2.0",
            id: msgId,
            method,
            params
        };
        pendingRequests.set(msgId, { resolve, reject });
        try {
            pythonProcess.stdin.write(JSON.stringify(req) + "\n");
        } catch (e) {
            reject(e);
        }
    });
}

async function initializeMCP() {
    console.log('Sending initialize request...');
    await sendRequest('initialize', {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "nlt-dashboard", version: "1.0" }
    });
    console.log('Initialize response received.');

    console.log('Sending initialized notification...');
    pythonProcess.stdin.write(JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {}
    }) + "\n");

    await discoverNotebook();
}

async function discoverNotebook() {
    console.log('Discovering notebooks...');
    try {
        const result = await sendRequest('tools/call', {
            name: "notebook_list",
            arguments: {}
        });
        console.log('Notebook list received.');

        if (result.content && result.content[0] && result.content[0].text) {
            const text = result.content[0].text;
            console.log('Parsing mode: trying JSON...');

            let notebooks = [];
            try {
                // The text might be just the JSON array/object
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) notebooks = parsed;
                else if (parsed.notebooks && Array.isArray(parsed.notebooks)) notebooks = parsed.notebooks;
                else if (parsed.id) notebooks = [parsed]; // Single notebook
            } catch (e) {
                console.log('Not valid JSON text.');
            }

            if (notebooks.length > 0) {
                console.log(`Found ${notebooks.length} notebooks via JSON.`);
                // Prefer "NLT" or "Dashboard"
                const target = notebooks.find(n => (n.title || "").toLowerCase().includes('nlt')) || notebooks[0];

                activeNotebookId = target.id || target.notebook_id;
                console.log(`Selected ID from JSON: ${activeNotebookId} (${target.title})`);
                return;
            }

            console.log('Fallback to regex parsing...');
            // UUID regex
            const uuidMatch = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                activeNotebookId = uuidMatch[0];
                console.log(`Auto-selected UUID: ${activeNotebookId}`);
                return;
            }

            // Last resort
            const match = text.match(/ID:\s*([^\s)]+)/);
            if (match) {
                activeNotebookId = match[1];
                console.log(`Auto-selected Pattern ID: ${activeNotebookId}`);
            } else {
                console.log("Could not auto-detect notebook ID.");
                console.log("Full text sample:", text.substring(0, 200));
            }
        }
    } catch (e) {
        console.error("Failed to list notebooks:", e);
    }
}

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!activeNotebookId) {
        console.log('Chat request received but no notebook ID. Retrying discovery...');
        await discoverNotebook().catch(() => { });
    }

    if (!activeNotebookId) {
        return res.json({
            role: 'system',
            content: "Error: Could not automatically find a Notebook ID. Check backend logs."
        });
    }

    try {
        const result = await sendRequest('tools/call', {
            name: "notebook_query",
            arguments: {
                notebook_id: activeNotebookId,
                query: message
            }
        });

        let textResponse = "No response content";
        if (result.content && result.content[0] && result.content[0].text) {
            textResponse = result.content[0].text;
        }

        res.json({
            role: 'system',
            content: textResponse
        });

    } catch (e) {
        console.error('Query failed:', e);
        res.status(500).json({ error: e.message || String(e) });
    }
});

// Compliance documents endpoint - scans real PDFs
const execAsync = promisify(exec);
const NLTS_PR_DIR = 'D:\\NLTS-PR';

// Document type patterns to search for in PDF content
const DOCUMENT_PATTERNS = {
    'Financial Statements': ['balance sheet', 'income statement', 'statement of cash flows', 'estado de situacion', 'nlts-pr fs', 'financial report'],
    'Tax Returns': ['form 1120', 'form 480', 'contribucion sobre ingresos', 'hacienda', 'corporate income', 'income tax return', 'retorno', 'pr expenses', '480.6', '480.30', 'expenses.pdf', '2024 expenses', 'tax return', 'pr 2024', 'gastos corporativos', 'declaracion', 'suri', 'income tax', 'national lift'],
    'Municipal Taxes': ['planilla municipal', 'patente municipal', 'patente', 'municipal tax', 'impuesto municipal', 'arbitrio', 'volumen de negocios'],
    'Property Tax (CRIM)': ['planilla inmueble', 'crim', 'contribucion sobre propiedad', 'property tax', 'impuesto sobre propiedad', 'contribucion inmueble', 'bienes inmuebles'],
    'Sales Tax Reports': ['iva', 'impuesto sobre ventas', 'sales and use tax', 'form 480.7'],
    'Payroll Reports': ['form 499r', 'wage report', 'w-2', 'informe de salarios'],
    'Depreciation Schedule': ['depreciation', 'depreciacion', 'schedule e', 'anejo e', 'nlts-pr depreciation schedule'],
    'Audit Reports': ['independent auditor', 'audit report', 'opinion letter'],
    'Insurance Certificates': ['certificate of insurance', 'liability coverage', 'workers comp'],
    'Business Licenses': ['patente', 'registro de comerciante', 'business license'],
    'Engagement Letter': ['engagement letter', 'carta de compromiso', 'carta compromiso', 'engagement agreement', 'we are pleased to confirm our understanding'],
    'Representation Letter': ['representation letter', 'carta de representacion', 'management representation', 'carta representacion', 'we confirm to the best of our knowledge']
};

// Flag to indicate if a document type extracts dates from content (first paragraph) rather than filename
const CONTENT_DATE_DOCUMENTS = ['Engagement Letter', 'Representation Letter'];

// Function to extract text from first page of PDF using pdftotext (requires poppler)
async function extractPdfContent(filePath) {
    try {
        // Try pdftotext first (from poppler-utils)
        const { stdout } = await execAsync(`pdftotext -f 1 -l 1 "${filePath}" -`, { timeout: 5000 });
        return stdout.toLowerCase().substring(0, 2000); // First 2000 chars
    } catch (e) {
        // Fallback: just return filename
        return path.basename(filePath).toLowerCase();
    }
}

// Extract document period date from filename or content
// Looks for date patterns like: "12 31 2024", "2024", "12-31-2024", etc.
function extractDocumentPeriodDate(filename, content) {
    const searchText = filename + ' ' + content;

    // Pattern 1: MM DD YYYY (space separated) - e.g., "12 31 2024"
    const pattern1 = /(\d{1,2})\s+(\d{1,2})\s+(20\d{2})/;
    let match = searchText.match(pattern1);
    if (match) {
        const [, month, day, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Pattern 2: MM-DD-YYYY or MM/DD/YYYY
    const pattern2 = /(\d{1,2})[-\/](\d{1,2})[-\/](20\d{2})/;
    match = searchText.match(pattern2);
    if (match) {
        const [, month, day, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Pattern 3: YYYY-MM-DD (ISO format)
    const pattern3 = /(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})/;
    match = searchText.match(pattern3);
    if (match) {
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Pattern 4: Just the year (e.g., "2024")
    const pattern4 = /\b(20\d{2})\b/;
    match = searchText.match(pattern4);
    if (match) {
        return new Date(parseInt(match[1]), 11, 31); // Assume Dec 31 of that year
    }

    return null; // No date found
}

// Extract date from letter content (first paragraph) - for Engagement and Representation letters
// These documents have their reporting date in the first paragraph of content, not in the filename
function extractLetterContentDate(content) {
    if (!content || content.length < 50) return null;

    // Get approximately the first paragraph (first 500 chars)
    const firstParagraph = content.substring(0, 500).toLowerCase();

    // Common date patterns in letter openings:
    // "January 15, 2024", "December 31, 2024", "15 de enero de 2024", etc.

    // Pattern 1: Month Day, Year (January 15, 2024)
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthNamesEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    for (let i = 0; i < monthNames.length; i++) {
        // English: "January 15, 2024" or "January 15 2024"
        const regexEn = new RegExp(monthNames[i] + '\\s+(\\d{1,2})[,]?\\s+(20\\d{2})', 'i');
        let match = firstParagraph.match(regexEn);
        if (match) {
            return new Date(parseInt(match[2]), i, parseInt(match[1]));
        }

        // Spanish: "15 de enero de 2024" or "15 de enero, 2024"
        const regexEs = new RegExp('(\\d{1,2})\\s+de\\s+' + monthNamesEs[i] + '[,]?\\s+(?:de\\s+)?(20\\d{2})', 'i');
        match = firstParagraph.match(regexEs);
        if (match) {
            return new Date(parseInt(match[2]), i, parseInt(match[1]));
        }
    }

    // Pattern 2: Numeric dates in first paragraph (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
    const numericPattern = /(\\d{1,2})[\\/\\-](\\d{1,2})[\\/\\-](20\\d{2})|(20\\d{2})[\\/\\-](\\d{1,2})[\\/\\-](\\d{1,2})/;
    const numMatch = firstParagraph.match(numericPattern);
    if (numMatch) {
        if (numMatch[4]) {
            // ISO format: YYYY-MM-DD
            return new Date(parseInt(numMatch[4]), parseInt(numMatch[5]) - 1, parseInt(numMatch[6]));
        } else {
            // MM/DD/YYYY (assume US format)
            return new Date(parseInt(numMatch[3]), parseInt(numMatch[1]) - 1, parseInt(numMatch[2]));
        }
    }

    return null;
}

// Identify document type based on content
function identifyDocumentType(content, filename) {
    const searchText = content + ' ' + filename.toLowerCase();

    for (const [docType, patterns] of Object.entries(DOCUMENT_PATTERNS)) {
        for (const pattern of patterns) {
            if (searchText.includes(pattern.toLowerCase())) {
                return docType;
            }
        }
    }
    return 'Other Document';
}

// Helper to recursively get files
function getFilesRecursively(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            // Recurse into subdirectories (like "Planillas")
            results = results.concat(getFilesRecursively(filePath));
        } else {
            results.push(filePath);
        }
    });
    return results;
}

app.get('/api/compliance-docs', async (req, res) => {
    try {
        // Recursively scan NLTS-PR directory
        const allFiles = getFilesRecursively(NLTS_PR_DIR);

        // Filter for relevant extensions
        const validExtensions = ['.pdf', '.gsheet', '.xls', '.xlsx', '.xlsm'];
        const files = allFiles.filter(filePath => {
            const ext = path.extname(filePath).toLowerCase();
            return validExtensions.includes(ext);
        });

        const documents = [];

        for (const filePath of files) {
            const filename = path.basename(filePath);
            const stats = fs.statSync(filePath);
            const ext = path.extname(filePath).toLowerCase();

            // Extract content to identify document type
            let content = "";
            if (ext === '.pdf') {
                content = await extractPdfContent(filePath);
            } else {
                // For spreadsheets, we rely on the filename for now
                // (Future: could use 'xlsx' package to read text)
                content = filename.toLowerCase();
            }

            const docType = identifyDocumentType(content, filename);

            // For letters (Engagement/Representation), extract date from content first paragraph
            // For other documents, use filename-based date extraction
            let periodDate;
            if (CONTENT_DATE_DOCUMENTS.includes(docType)) {
                // Letters: date is in the first paragraph of content
                periodDate = extractLetterContentDate(content);
                // Fallback to standard extraction if content parsing fails
                if (!periodDate) {
                    periodDate = extractDocumentPeriodDate(filename, content);
                }
            } else {
                periodDate = extractDocumentPeriodDate(filename, content);
            }

            // Special case logic for "Planillas" folder -> likely Tax Returns
            let finalDocType = docType;
            if (filePath.toLowerCase().includes('planillas') && finalDocType === 'Other Document') {
                finalDocType = 'Tax Returns';
            }

            documents.push({
                filename: filename,
                path: filePath, // Full path might be needed or just relative
                documentType: finalDocType,
                modifiedAt: stats.mtime.toISOString(),
                createdAt: stats.birthtime.toISOString(),
                size: stats.size,
                documentPeriodDate: periodDate ? periodDate.toISOString() : null,
                documentPeriodFormatted: periodDate ? periodDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Unknown period',
                lastModifiedFormatted: stats.mtime.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
        }

        // Group by document type
        const grouped = {};
        for (const doc of documents) {
            if (!grouped[doc.documentType]) {
                grouped[doc.documentType] = [];
            }
            grouped[doc.documentType].push(doc);
        }

        // Sort each group
        for (const type of Object.keys(grouped)) {
            grouped[type].sort((a, b) => {
                const aPeriod = a.documentPeriodDate ? new Date(a.documentPeriodDate).getTime() : 0;
                const bPeriod = b.documentPeriodDate ? new Date(b.documentPeriodDate).getTime() : 0;
                if (aPeriod !== bPeriod) return bPeriod - aPeriod;
                return new Date(b.modifiedAt) - new Date(a.modifiedAt);
            });
        }

        res.json({
            success: true,
            directory: NLTS_PR_DIR,
            totalFiles: documents.length,
            documentTypes: Object.keys(DOCUMENT_PATTERNS),
            documents: grouped
        });

    } catch (e) {
        console.error('Failed to scan compliance docs:', e);
        res.status(500).json({ error: e.message || String(e) });
    }
});

// =============================================
// DYNAMIC FINANCIAL DATA ENDPOINTS
// =============================================

// Sync ratios - dynamically extract from latest Excel file
app.get('/api/financial-ratios/sync', async (req, res) => {
    console.log('Syncing financial ratios from Excel...');
    try {
        // Run Python extraction script with stderr suppressed (warnings from openpyxl)
        const pythonScript = path.join(__dirname, 'extract_dynamic_ratios.py');

        let stdout, stderr;
        try {
            const result = await execAsync(`"${PYTHON_PATH}" "${pythonScript}" 2>&1`, { timeout: 120000 });
            stdout = result.stdout;
            stderr = result.stderr;
        } catch (cmdError) {
            // Even if command "fails" due to stderr, check if the file was created
            console.log('Python command completed with warnings:', cmdError.message);
            stdout = cmdError.stdout || '';
            stderr = cmdError.stderr || '';
        }

        console.log('Python extraction output:', stdout);
        if (stderr) console.log('Python stderr:', stderr);

        // Read the generated JSON - this is the real success indicator
        const ratiosPath = path.join(NLTS_PR_DIR, 'dynamic_ratios.json');
        if (!fs.existsSync(ratiosPath)) {
            throw new Error('Ratios file was not generated. Check if Excel file exists in D:\\NLTS-PR');
        }

        const ratiosData = JSON.parse(fs.readFileSync(ratiosPath, 'utf8'));

        res.json({
            success: true,
            message: 'Ratios synced from ' + ratiosData.source,
            extractedAt: ratiosData.extractedAt,
            data: ratiosData
        });

    } catch (e) {
        console.error('Failed to sync ratios:', e);
        res.status(500).json({
            success: false,
            error: e.message || String(e)
        });
    }
});

// Generate AI Executive Summary using NotebookLM
app.post('/api/executive-summary/generate', async (req, res) => {
    console.log('Generating AI Executive Summary...');
    const { language = 'en' } = req.body;

    try {
        // Read current ratios
        const ratiosPath = path.join(NLTS_PR_DIR, 'dynamic_ratios.json');
        let ratiosData = null;

        if (fs.existsSync(ratiosPath)) {
            ratiosData = JSON.parse(fs.readFileSync(ratiosPath, 'utf8'));
        }

        // Build context for AI
        const context = ratiosData ? `
Financial Ratios for ${ratiosData.company} as of ${ratiosData.asOf}:
Solvency: ${JSON.stringify(ratiosData.solvencyRatios)}
Safety: ${JSON.stringify(ratiosData.safetyRatios)}
Profitability: ${JSON.stringify(ratiosData.profitabilityRatios)}
Asset Management: ${JSON.stringify(ratiosData.assetManagementRatios)}
` : 'No ratio data available';

        const prompt = language === 'es'
            ? `[IDIOMA: ESPAÑOL] INSTRUCCIÓN CRÍTICA: TODA tu respuesta DEBE estar COMPLETAMENTE en ESPAÑOL. NO uses inglés bajo ninguna circunstancia.

Genera un Resumen Ejecutivo profesional para los siguientes datos financieros. Incluye: 1) Hallazgos Clave, 2) Análisis de Liquidez, 3) Estructura de Capital, 4) Eficiencia Operativa, 5) Conclusiones y Recomendaciones.

Datos: ${context}`
            : `[LANGUAGE: ENGLISH] CRITICAL INSTRUCTION: Your ENTIRE response MUST be COMPLETELY in ENGLISH. DO NOT use Spanish under any circumstances.

Generate a professional Executive Summary for the following financial data. Include: 1) Key Findings, 2) Liquidity Analysis, 3) Capital Structure, 4) Operational Efficiency, 5) Conclusions and Recommendations.

Data: ${context}`;


        // Ensure NotebookLM is connected
        if (!activeNotebookId) {
            await discoverNotebook().catch(() => { });
        }

        if (!activeNotebookId) {
            // Fallback: return a structured summary based on data
            const fallbackSummary = generateFallbackSummary(ratiosData, language);
            return res.json({
                success: true,
                generated: false,
                source: 'fallback',
                language,
                content: fallbackSummary
            });
        }

        // Query NotebookLM for AI-generated summary
        const result = await sendRequest('tools/call', {
            name: "notebook_query",
            arguments: {
                notebook_id: activeNotebookId,
                query: prompt
            }
        });

        let aiContent = "No response received";
        if (result.content && result.content[0] && result.content[0].text) {
            aiContent = result.content[0].text;

            // NotebookLM sometimes returns JSON-wrapped responses - try to extract the answer
            if (aiContent.startsWith('{')) {
                try {
                    const parsed = JSON.parse(aiContent);
                    if (parsed.answer) {
                        aiContent = parsed.answer;
                    } else if (parsed.text) {
                        aiContent = parsed.text;
                    } else if (parsed.content) {
                        aiContent = parsed.content;
                    }
                } catch (e) {
                    // Not valid JSON, use as-is
                    console.log('Response is not JSON, using raw content');
                }
            }
        }

        res.json({
            success: true,
            generated: true,
            source: 'notebooklm',
            language,
            content: aiContent,
            generatedAt: new Date().toISOString()
        });

    } catch (e) {
        console.error('Failed to generate executive summary:', e);
        res.status(500).json({
            success: false,
            error: e.message || String(e)
        });
    }
});

// Fallback summary generator when NotebookLM is unavailable
function generateFallbackSummary(ratiosData, language) {
    if (!ratiosData) {
        return language === 'es'
            ? '⚠️ No hay datos de ratios disponibles. Por favor, sincronice primero.'
            : '⚠️ No ratio data available. Please sync first.';
    }

    const { solvencyRatios, profitabilityRatios, safetyRatios, assetManagementRatios, leadingIndicators } = ratiosData;

    // Count statuses - handle optional leadingIndicators
    const allRatios = [
        ...(solvencyRatios || []),
        ...(profitabilityRatios || []),
        ...(safetyRatios || []),
        ...(assetManagementRatios || []),
        ...(leadingIndicators || [])
    ];
    const good = allRatios.filter(r => r.status === 'good' || r.status === 'excellent').length;
    const warning = allRatios.filter(r => r.status === 'warning').length;
    const danger = allRatios.filter(r => r.status === 'danger').length;
    const total = allRatios.length;

    if (language === 'es') {
        return `## 📊 Resumen Ejecutivo (${ratiosData.asOf})

### Estado General
- ✅ **${good}** ratios en buen estado
- ⚠️ **${warning}** ratios con advertencias  
- ❌ **${danger}** ratios críticos
- 📈 **${total}** ratios totales evaluados

### Análisis por Categoría
- **Solvencia:** ${(solvencyRatios || []).length} ratios evaluados
- **Seguridad:** ${(safetyRatios || []).length} ratios evaluados
- **Rentabilidad:** ${(profitabilityRatios || []).length} ratios evaluados
- **Gestión de Activos:** ${(assetManagementRatios || []).length} ratios evaluados
- **Indicadores Líderes:** ${(leadingIndicators || []).length} indicadores evaluados

*Generado automáticamente. Para un análisis más profundo, conecte NotebookLM.*`;
    }

    return `## 📊 Executive Summary (${ratiosData.asOf})

### Overall Status
- ✅ **${good}** ratios in good standing
- ⚠️ **${warning}** ratios with warnings
- ❌ **${danger}** critical ratios
- 📈 **${total}** total ratios evaluated

### Analysis by Category
- **Solvency:** ${(solvencyRatios || []).length} ratios evaluated
- **Safety:** ${(safetyRatios || []).length} ratios evaluated
- **Profitability:** ${(profitabilityRatios || []).length} ratios evaluated
- **Asset Management:** ${(assetManagementRatios || []).length} ratios evaluated
- **Leading Indicators:** ${(leadingIndicators || []).length} indicators evaluated

*Auto-generated. For deeper analysis, connect NotebookLM.*`;
}

// Financial Ratios endpoint - now reads from dynamic extraction or falls back to cache
app.get('/api/financial-ratios', (req, res) => {
    // Try to read dynamic ratios first
    const dynamicRatiosPath = path.join(NLTS_PR_DIR, 'dynamic_ratios.json');

    if (fs.existsSync(dynamicRatiosPath)) {
        try {
            const dynamicData = JSON.parse(fs.readFileSync(dynamicRatiosPath, 'utf8'));
            console.log('Returning dynamic ratios from file');
            return res.json({
                success: true,
                data: dynamicData
            });
        } catch (e) {
            console.error('Failed to read dynamic ratios, falling back to hardcoded:', e.message);
        }
    }

    // Fallback to hardcoded data (legacy)
    // Extracted from NLTS-PR FS 12 31 2024 Rev156-3.xlsm - Ratios sheet
    // Enhanced with explanations, recommendations, and stakeholder perspectives
    const ratios = {
        company: 'National Lift Truck Service of PR, Inc.',
        asOf: 'December 31, 2024',
        source: 'NLTS-PR FS 12 31 2024 Rev156-3.xlsm',
        solvencyRatios: [
            {
                name: 'Current Ratio',
                current: 1.1605,
                prior: 1.4122,
                unit: 'x',
                benchmark: '1.5 - 2.0',
                formula: 'Current Assets / Current Liabilities',
                explanation: 'Measures the company\'s ability to pay short-term obligations within one year. A ratio above 1 means the company has more current assets than current liabilities.',
                status: 'warning',
                recommendations: [
                    'Increase cash reserves by negotiating longer payment terms with suppliers',
                    'Accelerate collection of accounts receivable',
                    'Consider a short-term credit line as backup liquidity',
                    'Reduce inventory levels without affecting operations'
                ],
                perspectives: {
                    fiscal: 'Hacienda/IRS views a current ratio below 1.5 as potential cash flow stress. This may trigger scrutiny on estimated tax payments and ability to meet quarterly obligations. Example: With $100K in quarterly taxes due, a 1.16 ratio suggests tight cash to meet obligations without borrowing.',
                    bank: 'Banks typically require a minimum 1.25-1.5 current ratio for loan covenants. At 1.16, NLTS-PR is borderline. A bank reviewing a loan application would likely require additional collateral or personal guarantees. Example: For a $500K equipment loan, the bank may require 20% more collateral due to tight liquidity.',
                    manufacturer: 'Equipment manufacturers offering financing (Toyota, Hyster) view this as moderate risk. They may require larger down payments (30-40% vs standard 20%) or shorter terms. Example: A $200K forklift purchase may require $80K down instead of $40K.',
                    investor: 'Investors see a declining current ratio (1.41 → 1.16) as concerning. It signals the company is using working capital aggressively, which could limit growth opportunities. Example: A potential buyer valuing the company might discount enterprise value by 5-10% due to liquidity constraints.'
                }
            },
            {
                name: 'Quick Ratio',
                current: 0.7325,
                prior: 0.9884,
                unit: 'x',
                benchmark: '1.0 - 1.5',
                formula: '(Current Assets - Inventory) / Current Liabilities',
                explanation: 'Also called "acid test ratio". Measures ability to pay short-term debts using only liquid assets (excluding inventory). More conservative than current ratio.',
                status: 'danger',
                recommendations: [
                    'Build cash reserves to at least match current liabilities',
                    'Reduce reliance on inventory as a buffer for obligations',
                    'Negotiate extended credit terms with key suppliers',
                    'Consider factoring receivables for immediate cash'
                ],
                perspectives: {
                    fiscal: 'A quick ratio below 1.0 raises red flags for tax authorities. It suggests the company may struggle to pay taxes without selling inventory or borrowing. Example: If faced with a $50K unexpected tax assessment, NLTS-PR would need to liquidate inventory or seek financing.',
                    bank: 'Banks consider quick ratio critical for credit lines. At 0.73, most banks would decline unsecured revolving credit. Example: A request for a $200K line of credit would likely be denied or require full collateralization with equipment or real estate.',
                    manufacturer: 'OEM financing departments see this as high risk. They may require COD (cash on delivery) for parts orders or very short payment terms. Example: A $10K parts order that normally would be Net-30 may require payment upfront.',
                    investor: 'Private equity and strategic buyers view quick ratio below 1.0 as operational stress. This affects deal structure - they may propose earnouts instead of full cash payment. Example: In a $2M acquisition, buyers might offer $1.5M at closing with $500K contingent on working capital improvements.'
                }
            },
            {
                name: 'Working Capital to Total Assets',
                current: 0.0739,
                prior: 0.1732,
                unit: 'ratio',
                benchmark: '> 0.10',
                formula: '(Current Assets - Current Liabilities) / Total Assets',
                explanation: 'Shows what portion of total assets is funded by working capital. Higher ratios indicate more financial flexibility and lower risk.',
                status: 'warning',
                recommendations: [
                    'Retain more earnings instead of distributions',
                    'Refinance short-term debt to long-term',
                    'Increase profitability to build working capital organically',
                    'Evaluate asset efficiency - consider selling underutilized assets'
                ],
                perspectives: {
                    fiscal: 'Low working capital ratio combined with high debt may trigger IRS scrutiny on shareholder loans and distributions. Example: If owners took $100K in distributions while working capital declined, expect potential reclassification of distributions as salary.',
                    bank: 'This ratio directly impacts borrowing base calculations. Banks may reduce available credit on asset-based loans. Example: On a $1M ABL facility based on 80% of receivables and 50% of inventory, the bank might reduce advance rates by 10% due to working capital concerns.',
                    manufacturer: 'Dealers and manufacturers track this for credit decisions. A declining trend (17% → 7%) signals potential default risk on floor plan financing. Example: NLTS-PR might lose favorable floor plan terms for rental fleet inventory.',
                    investor: 'This metric is key in due diligence. A sharp decline suggests aggressive growth or hidden problems. Example: An investor might require a detailed working capital analysis before proceeding with investment discussions.'
                }
            }
        ],
        safetyRatios: [
            {
                name: 'Debt to Equity',
                current: 5.2916,
                prior: 14.8178,
                unit: 'x',
                benchmark: '< 2.0',
                formula: 'Total Liabilities / Shareholders\' Equity',
                explanation: 'Compares company debt to owner investment. Higher ratios mean more leverage and risk, but improved dramatically from 14.8x to 5.3x year-over-year.',
                status: 'danger',
                recommendations: [
                    'Continue aggressive debt paydown strategy',
                    'Retain earnings to build equity base',
                    'Consider equity injection from owners if growth capital needed',
                    'Avoid new debt unless absolutely necessary for growth'
                ],
                perspectives: {
                    fiscal: 'High D/E ratios attract IRS attention for thin capitalization rules. Interest deductions may be limited under Section 163(j). Example: At 5.29x D/E, the IRS may challenge whether some debt should be reclassified as equity, disallowing ~$30K in interest deductions annually.',
                    bank: 'Most banks have 3.0-4.0x D/E covenants. At 5.29x, NLTS-PR is in technical violation of standard covenants. Example: This could trigger loan acceleration, require a waiver fee ($5-10K), or force refinancing at higher rates (+1-2%).',
                    manufacturer: 'Heavy equipment lenders view D/E above 4.0x as very high risk. Credit insurance costs increase substantially. Example: Caterpillar Financial might require UCC filing on all equipment and monthly reporting as a condition of continued financing.',
                    investor: 'The improvement from 14.8x to 5.3x is impressive and shows deleveraging progress. Investors would want to understand the path to D/E below 3.0x. Example: A target D/E of 2.5x within 3 years would significantly increase company valuation.'
                }
            },
            {
                name: 'Debt Ratio',
                current: 0.8410,
                prior: 0.9368,
                unit: '%',
                benchmark: '< 50%',
                formula: 'Total Liabilities / Total Assets',
                explanation: 'Shows what percentage of assets are financed by debt. An 84% debt ratio means only 16% of assets are owned outright. Improved from 94% last year.',
                status: 'danger',
                recommendations: [
                    'Target debt ratio below 70% within 2 years',
                    'Prioritize paying down highest-interest debt first',
                    'Avoid asset purchases that increase leverage',
                    'Focus on profitable operations to build retained earnings'
                ],
                perspectives: {
                    fiscal: 'At 84% debt ratio, the IRS may scrutinize related-party transactions and whether debt is truly arm\'s length. Example: If $200K of debt is owed to shareholders, the IRS might impute higher interest rates or reclassify as equity contribution.',
                    bank: 'Standard bank covenants require debt ratio below 65-70%. At 84%, new financing is extremely difficult. Example: A bank would require additional collateral equal to 200-300% of any new loan amount, or cosigner guarantees.',
                    manufacturer: 'OEM credit departments will likely place the account on credit hold or require prepayment. Example: A $50K parts order from Toyota Forklift would require wire transfer before shipment.',
                    investor: 'The 10% improvement year-over-year is positive, but 84% is still very high. Buyers would likely structure deals with significant seller financing. Example: In a $3M acquisition, buyer might propose $1M cash, $1M bank debt, $1M seller note over 5 years.'
                }
            }
        ],
        profitabilityRatios: [
            {
                name: 'Gross Profit Margin',
                current: 0.1418,
                prior: 'N/A',
                unit: '%',
                benchmark: '25-35%',
                formula: '(Revenue - Cost of Goods Sold) / Revenue',
                explanation: 'Shows percentage of revenue remaining after direct costs. At 14.2%, NLTS-PR keeps $0.14 of every dollar after paying for parts, labor, and direct costs.',
                status: 'danger',
                recommendations: [
                    'Review pricing strategy - consider 10-15% price increase on services',
                    'Negotiate better terms with parts suppliers',
                    'Improve technician productivity and utilization rates',
                    'Focus on higher-margin services (PM contracts, training)'
                ],
                perspectives: {
                    fiscal: 'Low gross margins limit tax planning flexibility. Less operating leverage means fewer deductions can be utilized. Example: With $2M in revenue and 14% margin, only $280K gross profit limits ability to fund retirement plans, bonuses, or other deductible expenses.',
                    bank: 'Banks analyze gross margins for cash flow projections. At 14%, there\'s minimal cushion for unexpected expenses. Example: If a major equipment breakdown requires $50K in repairs, it consumes nearly 18% of annual gross profit.',
                    manufacturer: 'Dealers with higher margins (25%+) get better co-op advertising, training support, and favorable terms. Example: NLTS-PR may miss out on $10-20K annually in manufacturer support programs due to margin pressure.',
                    investor: 'Industry average for equipment service businesses is 25-30%. NLTS-PR\'s 14% suggests pricing power issues or cost structure problems. Example: A buyer would discount valuation significantly, perhaps offering 2-3x EBITDA versus 4-5x for peers with higher margins.'
                }
            },
            {
                name: 'Net Profit Margin',
                current: 0.0551,
                prior: 'N/A',
                unit: '%',
                benchmark: '5-10%',
                formula: 'Net Income / Revenue',
                explanation: 'The "bottom line" - shows what percentage of each revenue dollar becomes profit after all expenses. At 5.5%, this is within industry norms.',
                status: 'good',
                recommendations: [
                    'Maintain current expense discipline',
                    'Look for opportunities to increase revenue without proportional cost increases',
                    'Consider technology investments that improve efficiency',
                    'Review insurance and administrative costs for savings'
                ],
                perspectives: {
                    fiscal: 'A 5.5% net margin is respectable for tax planning. It allows for reasonable owner compensation and some retained earnings. Example: On $2M revenue, $110K net profit supports ~$80K owner salary plus $30K retained for growth - a reasonable structure for IRS purposes.',
                    bank: 'Adequate net margin supports debt service coverage. At 5.5%, the company can likely cover typical loan payments. Example: $110K in net profit can support roughly $80-100K in annual debt service at standard coverage ratios.',
                    manufacturer: '5.5% net margin is acceptable for dealer relationships. It shows the business is sustainable. Example: OEMs would consider this dealer viable for franchise agreements and territory expansion.',
                    investor: 'This is the minimum acceptable for a small business. Investors want to see path to 8-10%. Example: A buyer might offer 3-4x EBITDA ($750K-$1M) with earnouts tied to margin improvement.'
                }
            },
            {
                name: 'Return on Equity (ROE)',
                current: 0.2528,
                prior: 'N/A',
                unit: '%',
                benchmark: '15-20%',
                formula: 'Net Income / Shareholders\' Equity',
                explanation: 'Measures return generated on owner investment. Exceptionally high at 25.3%, but largely due to low equity base (high leverage). This is a leveraged return.',
                status: 'good',
                recommendations: [
                    'As debt pays down, ROE will naturally decline - this is healthy',
                    'Reinvest profits to grow equity base',
                    'Consider whether the high ROE justifies the risk level',
                    'Plan for normalized ROE of 15-18% as leverage decreases'
                ],
                perspectives: {
                    fiscal: 'High ROE with high leverage is a double-edged sword. The IRS may question if the capital structure is reasonable. Example: If shareholders have only $100K in equity but $500K in loans to the company, expect scrutiny on interest paid to related parties.',
                    bank: 'Banks recognize leveraged ROE is artificially high. They focus on return on assets instead. Example: A loan officer would note that 25% ROE drops to ~4% ROA, revealing the true asset productivity.',
                    manufacturer: 'OEMs want to see healthy dealer equity. High ROE from leverage is less impressive than high ROE from operations. Example: Franchise renewals may require minimum $200K+ in tangible equity.',
                    investor: 'Sophisticated buyers understand leveraged returns. The 25% ROE would be adjusted to 12-15% on a normalized capital structure. Example: Valuation models would use adjusted ROE assuming 50% debt ratio, not current 84%.'
                }
            },
            {
                name: 'EBITDA',
                current: 250178.28,
                prior: 'N/A',
                unit: '$',
                benchmark: 'N/A',
                formula: 'Earnings Before Interest, Taxes, Depreciation & Amortization',
                explanation: 'Key cash flow measure showing operational earnings power. $250K EBITDA represents strong cash generation before financing and non-cash charges.',
                status: 'good',
                recommendations: [
                    'Continue focusing on operational efficiency',
                    'Track EBITDA monthly as key performance indicator',
                    'Use EBITDA to support debt paydown strategy',
                    'Consider EBITDA-based bonus structure for management'
                ],
                perspectives: {
                    fiscal: '$250K EBITDA provides good tax planning flexibility. It supports reasonable owner compensation and retirement contributions. Example: Could fund $50K 401(k) contributions, $20K health insurance, while still showing appropriate taxable income.',
                    bank: 'EBITDA is the primary metric for debt service coverage. $250K supports roughly $150-175K in annual debt payments at 1.5x coverage. Example: This could service a $1.2-1.5M term loan over 10 years.',
                    manufacturer: 'Strong EBITDA supports equipment financing applications. Floor plan lenders look for minimum 2x coverage. Example: NLTS-PR could support $100-125K in floor plan exposure comfortably.',
                    investor: 'EBITDA is the basis for valuation. At 3-5x multiple typical for this industry, indicates enterprise value of $750K-$1.25M. Example: A strategic buyer might pay $1M for the business, with $250K earnout based on maintaining EBITDA.'
                }
            }
        ],
        assetManagementRatios: [
            {
                name: 'Inventory Turnover',
                current: 11.4960,
                prior: 0,
                unit: 'x',
                benchmark: '4-6',
                formula: 'Cost of Goods Sold / Average Inventory',
                explanation: 'Shows how many times inventory is sold and replaced during the year. At 11.5x, inventory turns very quickly - nearly once per month. Well above industry benchmarks.',
                status: 'excellent',
                recommendations: [
                    'Maintain strong inventory management practices',
                    'Consider if slightly higher inventory levels could capture more sales',
                    'Use just-in-time inventory systems effectively',
                    'Monitor for stockouts that might be costing revenue'
                ],
                perspectives: {
                    fiscal: 'High turnover is tax-efficient - less capital tied up in potentially obsolete inventory. Example: Lower inventory exposure reduces risk of write-offs that the IRS might scrutinize.',
                    bank: 'Excellent inventory velocity improves borrowing base on ABL facilities. Example: Banks might advance 65-70% on inventory instead of standard 50% due to rapid turnover.',
                    manufacturer: 'OEMs love dealers with high turnover - it means their products sell quickly. Example: NLTS-PR might qualify for fast-turn bonuses or first allocation of new models.',
                    investor: 'Indicates excellent operations and minimal obsolescence risk. Example: A buyer would pay premium for a business with proven inventory management, perhaps 0.5x higher EBITDA multiple.'
                }
            },
            {
                name: 'A/R Collection Days',
                current: 11.47,
                prior: 'N/A',
                unit: 'days',
                benchmark: '30-45',
                formula: '365 / Accounts Receivable Turnover',
                explanation: 'Average days to collect payment from customers. At 11.5 days, collections are exceptionally fast - customers pay in less than 2 weeks on average.',
                status: 'excellent',
                recommendations: [
                    'Maintain current collection practices',
                    'Document collection procedures for consistency',
                    'Consider offering small discounts for even faster payment',
                    'This is a competitive advantage - leverage in negotiations'
                ],
                perspectives: {
                    fiscal: 'Rapid collections maximize cash for estimated tax payments. Example: No need to borrow for quarterly tax deposits when customers pay in 11 days.',
                    bank: 'Excellent receivables velocity significantly improves ABL borrowing base. Example: Bank might advance 90% on A/R instead of standard 80%, adding ~$20-30K in available credit.',
                    manufacturer: 'Fast collection indicates quality customer base and strong credit controls. Example: OEMs would view NLTS-PR as low-risk for co-branded financing programs.',
                    investor: 'Best-in-class metric. Investors would pay premium for predictable cash flow. Example: Could add 0.5-1.0x to EBITDA valuation multiple.'
                }
            },
            {
                name: 'A/P Payment Days',
                current: 9.75,
                prior: 'N/A',
                unit: 'days',
                benchmark: '30-45',
                formula: '365 / Accounts Payable Turnover',
                explanation: 'Average days to pay suppliers. At 9.75 days, the company pays suppliers very quickly - faster than it collects from customers. This could be improved.',
                status: 'warning',
                recommendations: [
                    'Negotiate Net-30 or Net-45 terms with major suppliers',
                    'Take advantage of early payment discounts only if ROI exceeds 15%',
                    'Slow payments to preserve cash without damaging relationships',
                    'Review supplier contracts for better terms during renewal'
                ],
                perspectives: {
                    fiscal: 'Paying quickly reduces interest deductions since suppliers often include financing in pricing. Example: Negotiating Net-45 instead of COD could free $50K in working capital while maintaining supplier relationships.',
                    bank: 'Very fast payment may indicate weak negotiating position or lack of credit with suppliers. Example: A bank might question why established suppliers don\'t extend normal 30-day terms.',
                    manufacturer: 'Paying faster than necessary may indicate cash management issues or overly conservative approach. Example: OEM parts departments typically offer Net-30; not using this credit is leaving money on the table.',
                    investor: 'This represents a working capital optimization opportunity. Example: Moving from 10-day to 30-day payments could release $100K+ in cash for debt reduction or growth.'
                }
            }
        ]
    };

    res.json({
        success: true,
        data: ratios
    });
});

console.log(`Starting express server on ${PORT}...`);
startProcess();

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
