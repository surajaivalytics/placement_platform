"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";

export async function parseResumeWithGemini(formData: FormData) {
    // 1. SECURITY CHECK
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { success: false, error: "Server Configuration Error: API Key missing." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        console.log(`Processing file: ${file.name} (${file.size} bytes)`);

        // 2. Extract Text
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resumeText = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser(null, true);
            pdfParser.on("pdfParser_dataError", (errData: any) =>
                reject(new Error(errData.parserError))
            );
            pdfParser.on("pdfParser_dataReady", () =>
                resolve(pdfParser.getRawTextContent())
            );
            pdfParser.parseBuffer(buffer);
        });

        console.log("Text extracted. Calling Gemini...");

        // 3. Gemini Call (WORKING MODEL)
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest"
        });

        const prompt = `
      You are an expert Resume Parser. 
      Analyze the following resume text and extract the information into a strict JSON format.
      
      Resume Text:
      """
      ${resumeText.slice(0, 30000)}
      """

      Return ONLY valid JSON matching this structure:
      {
        "personal": {
          "firstName": "string",
          "lastName": "string",
          "email": "string",
          "phone": "string",
          "city": "string",
          "country": "string",
          "linkedin": "string"
        },
        "summary": "string",
        "skills": ["string"],
        "education": [{ "school": "string", "degree": "string", "startDate": "string", "endDate": "string" }],
        "experience": [{ "company": "string", "position": "string", "startDate": "string", "endDate": "string", "description": "string" }]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini response received");

        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);

        // --- SAME RETURN FORMAT ---
        return { success: true, data: parsedData };

    } catch (error: any) {
        console.error("Parsing Error:", error.message);
        return { success: false, error: error.message || "Failed to parse resume" };
    }
}
