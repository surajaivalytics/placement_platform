"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";
import { extractText } from "unpdf";
import mammoth from "mammoth";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function importQuestionsFromContext(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) return { error: "No file provided" };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = file.name.toLowerCase();
        const fileType = fileName.split('.').pop();

        let questions: any[] = [];
        let docText = "";

        if (fileType === 'json') {
            const text = buffer.toString('utf-8');
            questions = JSON.parse(text);
        } else if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            // Helper to find value from row with multiple possible header names
            const getValue = (row: any, keys: string[]) => {
                const normalizedRow: any = {};
                Object.keys(row).forEach(k => {
                    normalizedRow[k.toLowerCase().trim().replace(/[^a-z0-9]/g, '')] = row[k];
                });

                for (const key of keys) {
                    const normalizedKey = key.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
                    if (normalizedRow[normalizedKey] !== undefined && normalizedRow[normalizedKey] !== null) {
                        return normalizedRow[normalizedKey];
                    }
                }
                return null;
            };

            questions = rows.map((row: any) => {
                const typeRaw = String(getValue(row, ['Type', 'Question Type', 'Kind']) || '').toLowerCase();

                // Heuristic: If Type is missing but coding columns exist, assume coding
                const isCodingHeuristic = getValue(row, ['Input Format', 'Output Format', 'Constraints', 'Sample Input', 'Test Cases']) !== null;
                const type = (typeRaw.includes('code') || typeRaw.includes('coding') || isCodingHeuristic) ? 'coding' : 'mcq';

                const text = String(getValue(row, ['Question Text', 'Question', 'Text', 'Statement']) || '');
                const difficulty = String(getValue(row, ['Difficulty', 'Level']) || 'Medium');
                const category = String(getValue(row, ['Category', 'Topic', 'Subject']) || 'General');
                const points = parseInt(String(getValue(row, ['Points', 'Marks', 'Score']) || '1'));

                if (type === 'coding') {
                    const inputFormat = getValue(row, ['Input Format', 'InputFormat']) || '';
                    const outputFormat = getValue(row, ['Output Format', 'OutputFormat']) || '';
                    const constraints = getValue(row, ['Constraints']) || '';

                    // Support multiple sample inputs/outputs (Sample Input 1, Sample Input 2, etc.)
                    const testCases: { input: string; output: string; isHidden: boolean }[] = [];
                    for (let i = 1; i <= 5; i++) {
                        const input = getValue(row, [`Sample Input ${i}`, `SampleInput${i}`, i === 1 ? 'Sample Input' : '']);
                        const output = getValue(row, [`Sample Output ${i}`, `SampleOutput${i}`, i === 1 ? 'Sample Output' : '']);
                        if (input !== null && output !== null) {
                            testCases.push({ input: String(input), output: String(output), isHidden: false });
                        }
                    }

                    const metadata = JSON.stringify({
                        inputFormat,
                        outputFormat,
                        constraints,
                        testCases: testCases.length > 0 ? testCases : [{ input: '', output: '', isHidden: false }]
                    });

                    return {
                        text,
                        type: 'coding',
                        options: [],
                        metadata,
                        difficulty,
                        category,
                        points: isNaN(points) ? 1 : points
                    };
                } else {
                    // Extract options A, B, C, D... or 1, 2, 3, 4...
                    const options = [
                        { key: 'A', value: getValue(row, ['Option A', 'Option 1', 'A', '1']) },
                        { key: 'B', value: getValue(row, ['Option B', 'Option 2', 'B', '2']) },
                        { key: 'C', value: getValue(row, ['Option C', 'Option 3', 'C', '3']) },
                        { key: 'D', value: getValue(row, ['Option D', 'Option 4', 'D', '4']) },
                    ].filter(o => o.value !== null && String(o.value).trim() !== '');

                    const answerRaw = String(getValue(row, ['Correct Option', 'Answer', 'Correct Answer', 'Result', 'CorrectOption']) || '');

                    const parsedOptions = options.map(opt => {
                        const optText = String(opt.value);
                        // Check if answer matches the text or the key (A, B, C, D)
                        const isCorrect =
                            answerRaw.trim().toUpperCase() === opt.key ||
                            answerRaw.trim() === optText ||
                            answerRaw.trim() === String(opt.value);

                        return { text: optText, isCorrect };
                    });

                    // If no option marked as correct yet, try simple string matching for 'Correct Option (A/B/C/D)' style
                    if (!parsedOptions.some(o => o.isCorrect)) {
                        const letterMatch = answerRaw.match(/^[A-D]$/i);
                        if (letterMatch) {
                            const index = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
                            if (parsedOptions[index]) parsedOptions[index].isCorrect = true;
                        }
                    }

                    return {
                        text,
                        type: 'mcq',
                        options: parsedOptions,
                        difficulty,
                        category,
                        points: isNaN(points) ? 1 : points
                    };
                }
            });
        } else if (fileType === 'pdf' || fileType === 'docx' || fileType === 'doc') {
            if (fileType === 'pdf') {
                const { text } = await extractText(arrayBuffer);
                docText = Array.isArray(text) ? text.join('\n') : text;
            } else {
                // Word Document processing
                const result = await mammoth.extractRawText({ buffer });
                docText = result.value;
            }

            const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

            const prompt = `
                You are an expert examiner. Your task is to extract questions from the provided document text.
                The document might contain Multiple Choice Questions (MCQs) or Coding Questions.
                
                IMPORTANT:
                - Identify the CORRECT answer for each MCQ. Look for bolded text, asterisks (*), or an answer key at the end of the document.
                - For coding questions, extract the problem statement, input/output format, and sample cases.
                
                Return ONLY a valid JSON array of objects. Format:
                [{
                    "text": "The question text",
                    "type": "mcq" | "coding",
                    "options": [{"text": "Option text", "isCorrect": boolean}], // For MCQ
                    "metadata": "{'inputFormat': '...', 'outputFormat': '...', 'constraints': '...', 'testCases': [{'input': '...', 'output': '...', 'isHidden': boolean}]}", // For Coding
                    "difficulty": "Easy" | "Medium" | "Hard",
                    "category": "Topic",
                    "points": number
                }]
                
                IMPORTANT for Coding Questions:
                - The "metadata" field MUST be a stringified JSON object.
                - Include at least 2-3 public test cases (isHidden: false) and 2-3 hidden evaluation cases (isHidden: true) in the "testCases" array.

                Document Content:
                ${docText.substring(0, 50000)} 
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const aiText = response.text();

            try {
                // Sanitize AI response to ensure it's pure JSON
                const jsonStr = aiText.substring(aiText.indexOf('['), aiText.lastIndexOf(']') + 1);
                questions = JSON.parse(jsonStr);
            } catch (e) {
                console.error("AI Parse Error:", e);
                return { error: "Failed to parse questions from document via AI. Please ensure the document is clear." };
            }
        } else {
            return { error: "Unsupported file type: " + fileType };
        }

        return { questions };

    } catch (error) {
        console.error("Import Error:", error);
        return { error: "Failed to process file: " + (error instanceof Error ? error.message : "Unknown error") };
    }
}


