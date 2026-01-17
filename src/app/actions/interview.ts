'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface InterviewContext {
    interviewType: string;
    companyType: string;
    currentQuestionIndex: number;
    previousQuestions: string[];
    previousAnswers: string[];
    conversationHistory: Array<{ role: 'interviewer' | 'candidate' | 'user' | 'model'; content: string }>;
}

export interface AIResponse {
    question: string;
}

export async function generateQuestion(context: InterviewContext): Promise<AIResponse> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined');
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

        const systemPrompt = `
      You are an AI-powered Virtual HR Interviewer designed to conduct professional, real-world placement interviews for engineering students.
      
      **Role**: Senior HR Manager / Technical Interviewer at ${context.companyType}.
      **Interview Type**: ${context.interviewType}.
      
      **Goal**: Conduct a realistic interview. Ask ONE clear, relevant question at a time.
      
      **Instructions**:
      1.  If this is the FIRST question (index 0), welcome the candidate and ask them to introduce themselves.
      2.  For subsequent questions, acknowledge the previous answer briefly (e.g., "That's a good point," or "I see,") and then ask a NEW, DIFFERENT question.
      3.  DIVE DEEPER: If the previous answer was vague, ask a follow-up.
      4.  SHIFT TOPICS: If you've covered a topic enough, move to a new relevant area (Technical, Behavioral, Situational).
      5.  DO NOT REPEAT questions.
      6.  Keep the question concise (1-2 sentences).
      
      **Context**:
      - Previous Questions: ${context.previousQuestions.slice(-3).join(' | ')}
      - Previous Answers: ${context.previousAnswers.slice(-3).join(' | ')}
    `;

        const userPrompt = `
      Based on the history, generate the NEXT question.
      Last Answer: "${context.previousAnswers[context.previousAnswers.length - 1] || 'None'}"
    `;

        const result = await model.generateContent([systemPrompt, userPrompt]);
        const response = await result.response;
        const text = response.text();

        return {
            question: text.replace(/^"|"$/g, '').trim() // Clean quotes if any
        };

    } catch (error) {
        console.error('Error generating question:', error);
        return {
            question: "I apologize, I'm having trouble connecting. Could you tell me a bit more about your final year project?" // Failover question
        };
    }
}
