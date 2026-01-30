
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Simple .env loader
try {
    const envFile = fs.readFileSync(path.resolve('.env'), 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log("No .env file found or failed to read.");
}

async function analyzeVoiceRecording(audioBuffer, mimeType = "audio/webm") {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    try {
        console.log(`Analyzing audio: ${audioBuffer.length} bytes, type: ${mimeType}`);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use 1.5-flash as it's more standard for audio

        const prompt = `
      Transcribe this audio message exactly. 
      Then, interpret the intent of the speaker.
      
      Return JSON:
      {
        "transcription": "string",
        "intent": "string",
        "analysis": "string"
      }
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: audioBuffer.toString("base64"),
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();
        return text;

    } catch (error) {
        console.error("Error analyzing voice with Gemini:", error);
        throw error;
    }
}

async function main() {
    const filePath = path.resolve("temp_audio_msg.webm");
    const buffer = fs.readFileSync(filePath);
    try {
        const result = await analyzeVoiceRecording(buffer, "audio/webm");
        console.log("ANALYSIS_RESULT:", result);
    } catch (error) {
        console.error("Analysis failed:", error);
    }
}

main();
