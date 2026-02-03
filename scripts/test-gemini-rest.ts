const https = require('https');
const fs = require('fs');
const path = require('path');

// Regex to find GEMINI_API_KEY in .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY="?([^"\n]+)"?/);

if (!match) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const API_KEY = match[1];
console.log(`Using Key: ${API_KEY.substring(0, 4)}...`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Status Code:", res.statusCode);
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else {
                console.log("Models found:", json.models ? json.models.length : 0);
                if (json.models) {
                    json.models.forEach(m => console.log(`- ${m.name}`));
                }
            }
        } catch (e) {
            console.error("Failed to parse response:", data);
        }
    });
}).on('error', (err) => {
    console.error("Network Error:", err.message);
});
