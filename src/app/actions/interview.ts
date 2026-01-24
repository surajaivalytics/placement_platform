'use server';

import { getAIInterviewResponse, InterviewContext } from '@/lib/interview-ai';

export async function generateQuestion(context: InterviewContext): Promise<{ question: string }> {
    try {
        const response = await getAIInterviewResponse(context);
        return { question: response.question };
    } catch (error) {
        console.error('Error generating question:', error);
        return {
            question: "I apologize, I'm having trouble connecting. Could you please check your internet connection?"
        };
    }
}
