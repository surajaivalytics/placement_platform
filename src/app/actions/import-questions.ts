"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";
import { extractText } from "unpdf";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function importQuestionsFromContext(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) return { error: "No file provided" };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileType = file.name.split('.').pop()?.toLowerCase();

        let questions: any[] = [];

        if (fileType === 'json') {
            const text = buffer.toString('utf-8');
            questions = JSON.parse(text);
        } else if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            // Use the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Parsing with specific header fallback or defaults?
            // Just raw JSON is easiest if we assume headers exist
            const rows = XLSX.utils.sheet_to_json(sheet);

            questions = rows.map((row: any) => {
                let typeRaw = (row['Type'] || row['type'] || '').toLowerCase();

                // Heuristic: If Type is missing but coding columns exist, assume coding
                if (!typeRaw && (row['Input Format'] || row['Output Format'] || row['Constraints'] || row['Sample Input'] || row['Input Format (Coding)'])) {
                    typeRaw = 'coding';
                }

                if (!typeRaw) typeRaw = 'mcq';

                const type = (typeRaw.includes('code') || typeRaw.includes('coding')) ? 'coding' : 'mcq';
                const text = String(row['Question Text'] || row['Question'] || row['text'] || row['question'] || '');

                if (type === 'coding') {
                    // Coding Question Structure
                    const inputFormat = row['Input Format (Coding)'] || row['Input Format'] || '';
                    const outputFormat = row['Output Format (Coding)'] || row['Output Format'] || '';
                    const sampleInput = row['Sample Input'] || '';
                    const sampleOutput = row['Sample Output'] || '';

                    const metadata = JSON.stringify({
                        inputFormat,
                        outputFormat,
                        testCases: [{ input: sampleInput, output: sampleOutput }]
                    });

                    return {
                        text,
                        type: 'coding',
                        options: [], // Coding has no options usually
                        metadata,
                        difficulty: row['Difficulty'] || 'Medium',
                        category: row['Category'] || 'General'
                    };
                } else {
                    // MCQ Structure
                    return {
                        text,
                        type: 'mcq',
                        options: [
                            { text: String(row['Option A'] || row['A'] || ''), isCorrect: (row['Correct Option (A/B/C/D)'] === 'A' || String(row['Answer']) === 'A' || String(row['Answer']) === String(row['Option A'])) },
                            { text: String(row['Option B'] || row['B'] || ''), isCorrect: (row['Correct Option (A/B/C/D)'] === 'B' || String(row['Answer']) === 'B' || String(row['Answer']) === String(row['Option B'])) },
                            { text: String(row['Option C'] || row['C'] || ''), isCorrect: (row['Correct Option (A/B/C/D)'] === 'C' || String(row['Answer']) === 'C' || String(row['Answer']) === String(row['Option C'])) },
                            { text: String(row['Option D'] || row['D'] || ''), isCorrect: (row['Correct Option (A/B/C/D)'] === 'D' || String(row['Answer']) === 'D' || String(row['Answer']) === String(row['Option D'])) },
                        ].filter((o: any) => o.text && o.text.trim() !== ''),
                        difficulty: row['Difficulty'] || 'Medium',
                        category: row['Category'] || 'General'
                    };
                }
            });
        } else if (fileType === 'pdf') {
            // PDF Parsing & AI Extraction
            const { text } = await extractText(arrayBuffer);
            const textContent = Array.isArray(text) ? text.join('\n') : text;

            // Use Gemini to extract structured data from unstructured text
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Extract multiple-choice questions from the following text. 
                Return ONLY a valid JSON array of objects.
                Each object must have:
                - text: The question text
                - type: "multiple-choice" or "coding"
                - options: Array of {text: string, isCorrect: boolean} (if MCQ)
                - difficulty: "Easy", "Medium", or "Hard"
                - category: The topic or subject (e.g. "Math", "Java")

                Text Content:
                ${textContent.substring(0, 30000)} 
            `;
            // Truncate to avoid context limit if file is huge, though 1.5 flash has large context.

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const aiText = response.text();

            try {
                // Sanitize JSON
                const jsonStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
                questions = JSON.parse(jsonStr);
            } catch (e) {
                console.error("AI Parse Error:", e);
                return { error: "Failed to parse questions from PDF via AI." };
            }
        } else {
            return { error: "Unsupported file type" };
        }

        return { questions };

    } catch (error) {
        console.error("Import Error:", error);
        return { error: "Failed to process file" };
    }
}
