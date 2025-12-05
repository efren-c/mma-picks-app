
const { execSync } = require('child_process');
require('dotenv').config();

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
    console.log('DIRECT_URL missing, defaulting to DATABASE_URL for push...');
    process.env.DIRECT_URL = process.env.DATABASE_URL;
}

try {
    console.log('Running prisma db push...');
    // Use 'npx' with 'cmd /c' logic implicit if running in node execSync on windows?
    // Using 'npx' inside execSync might fail if paths are weird, but let's try.
    // Better: find prisma bin?
    // Let's try simple 'npx prisma db push' first.
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
    console.log('Push successful.');
} catch (e) {
    console.error('Push failed.');
    process.exit(1);
}
