
import fs from 'fs';
import path from 'path';

async function fetchSummary() {
    console.log('Fetching summary...');
    try {
        const response = await fetch('http://localhost:3001/api/executive-summary/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: 'es' })
        });
        const data = await response.json();
        console.log('Summary fetched:', data.success);

        if (data.success) {
            fs.writeFileSync('public/data/executive_summary.json', JSON.stringify(data, null, 2));
            console.log('Saved to public/data/executive_summary.json');
        } else {
            console.error('Failed to generate summary:', data);
        }
    } catch (e) {
        console.error('Error fetching summary:', e);
    }
}

fetchSummary();
