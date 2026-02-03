import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testConnection() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        process.exit(1);
    }

    console.log(`🔑 Using API Key: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);

    const genAI = new GoogleGenerativeAI(key);
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro-001"
    ];

    console.log("----------------------------------------");
    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello.");
            const response = await result.response;
            console.log(`✅ Success with ${modelName}!`);
            break;
        } catch (error: any) {
            console.log(`❌ Failed with ${modelName}:`);
            console.log(`   Error: ${error.message}`);
        }
        console.log("----------------------------------------");
    }
}

testConnection();
