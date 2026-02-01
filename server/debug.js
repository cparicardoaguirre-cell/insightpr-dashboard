
import { spawn } from 'child_process';
import path from 'path';

const PYTHON_PATH = String.raw`C:\Users\cpari\.gemini\antigravity\GoogleNotebookLM\.venv\Scripts\python.exe`;
const MCP_MODULE = 'notebooklm_tools.mcp.server';

console.log('Testing spawn...');
try {
    const pythonProcess = spawn(PYTHON_PATH, ['-m', MCP_MODULE], {
        stdio: ['pipe', 'pipe', process.stderr]
    });

    pythonProcess.on('spawn', () => {
        console.log('Process spawned successfully');
        pythonProcess.kill();
    });

    pythonProcess.on('error', (err) => {
        console.error('Spawn error:', err);
    });

} catch (e) {
    console.error('Synchronous error:', e);
}
