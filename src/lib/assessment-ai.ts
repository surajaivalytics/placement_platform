import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface AssessmentEvaluation {
    scores: {
        programmingFundamentals: number;
        oopConcepts: number;
        dsaBasics: number;
        sdlc?: number;
        appDev?: number;
        debugging?: number;
        sqlBasics?: number;
        collaboration?: number;
    };
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    overallVerdict: "Hire" | "Maybe" | "Reject";
}

export async function generateMCQEvaluation(
    score: number,
    totalQuestions: number,
    categoryResults: Record<string, { correct: number; total: number }>,
    roundTitle: string
): Promise<AssessmentEvaluation> {
    if (!GEMINI_API_KEY) {
        return getFallbackMCQReport(score, totalQuestions, roundTitle);
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Evaluate the following MCQ assessment performance for the round: "${roundTitle}".
      
      Performance Summary:
      - Overall Score: ${score}% (${score / 100 * totalQuestions}/${totalQuestions} questions correct)
      - Category Performance: ${JSON.stringify(categoryResults)}
      
      Provide a professional performance report in the following JSON format:
      {
        "scores": {
          "programmingFundamentals": number (1-10),
          "oopConcepts": number (1-10),
          "dsaBasics": number (1-10)
        },
        "feedback": "A summary of their conceptual understanding based on the numbers.",
        "strengths": ["list of concepts they seem to master"],
        "weaknesses": ["list of concepts needing improvement"],
        "overallVerdict": "Hire" | "Maybe" | "Reject"
      }
      
      Output ONLY valid JSON. No markdown blocks.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini MCQ Eval Error:", error);
        return getFallbackMCQReport(score, totalQuestions, roundTitle);
    }
}

export async function generateCodingEvaluation(
    score: number,
    code: string,
    language: string,
    passedCases: number,
    totalCases: number,
    problemTitle: string,
    problemDescription: string
): Promise<AssessmentEvaluation> {
    if (!GEMINI_API_KEY) {
        return getFallbackCodingReport(score, passedCases, totalCases);
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Review the following coding assessment performance for the problem: "${problemTitle}".
      
      Problem Statement: ${problemDescription}
      
      Candidate's Work:
      - Language: ${language}
      - Code: \`\`\`${language}\n${code}\n\`\`\`
      - Test Results: ${passedCases}/${totalCases} test cases passed (${score}% score).
      
      Evaluation criteria: Logic accuracy, code cleanliness, time/space complexity awareness, and edge case handling.
      
      Provide a detailed report in the following JSON format:
      {
        "scores": {
          "programmingFundamentals": number (1-10),
          "oopConcepts": number (1-10),
          "dsaBasics": number (1-10),
          "debugging": number (1-10)
        },
        "feedback": "Strategic feedback on their coding style and logic.",
        "strengths": ["list of specific coding strengths"],
        "weaknesses": ["list of areas for improvement (e.g., big-O, naming, etc)"],
        "overallVerdict": "Hire" | "Maybe" | "Reject"
      }
      
      Output ONLY valid JSON. No markdown blocks.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Coding Eval Error:", error);
        return getFallbackCodingReport(score, passedCases, totalCases);
    }
}

function getFallbackMCQReport(score: number, total: number, title: string): AssessmentEvaluation {
    const normalized = score / 10;
    const passed = score >= 70;
    return {
        scores: {
            programmingFundamentals: Math.min(10, normalized + 1),
            oopConcepts: normalized,
            dsaBasics: Math.max(1, normalized - 1)
        },
        feedback: `Automated analysis for ${title} based on ${score}% score.`,
        strengths: passed ? ["Conceptual understanding"] : [],
        weaknesses: !passed ? ["Core fundamentals"] : [],
        overallVerdict: passed ? "Hire" : "Maybe"
    };
}

function getFallbackCodingReport(score: number, passed: number, total: number): AssessmentEvaluation {
    const normalized = score / 10;
    return {
        scores: {
            programmingFundamentals: normalized,
            oopConcepts: normalized,
            dsaBasics: normalized,
            debugging: (passed / total) * 10
        },
        feedback: `Code submission results: ${passed}/${total} test cases passed.`,
        strengths: passed === total ? ["Functional implementation"] : ["Basic attempt"],
        weaknesses: passed < total ? ["Logic refinement required"] : [],
        overallVerdict: passed === total ? "Hire" : "Maybe"
    };
}
