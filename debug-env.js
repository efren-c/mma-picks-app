
const fs = require('fs');
const path = require('path');

function checkFile(filename) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
        console.log(`${filename}: Not found`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let found = false;
    for (const line of lines) {
        if (line.trim().startsWith('DATABASE_URL=')) {
            const value = line.split('=')[1].trim();
            // Remove check for quotes just in case, or handle them
            const cleanValue = value.replace(/^["']|["']$/g, '');
            const protocol = cleanValue.split(':')[0];
            console.log(`${filename}: DATABASE_URL protocol is "${protocol}"`);
            found = true;
        }
    }
    if (!found) {
        console.log(`${filename}: DATABASE_URL not found`);
    }
}

console.log('--- Checking Environment files ---');
checkFile('.env');
checkFile('.env.local');
