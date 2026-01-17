import { GoogleGenerativeAI } from '@google/generative-ai';
import { INTERVIEW_TYPES, EVALUATION_CRITERIA } from './interview-constants';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface InterviewContext {
  interviewType: string;
  companyType: string;
  candidateName?: string;
  currentQuestionIndex: number;
  previousQuestions: string[];
  previousAnswers: string[];
  conversationHistory: Array<{ role: 'interviewer' | 'candidate' | 'user' | 'model'; content: string }>;
}

export interface AIResponse {
  question: string;
  followUp?: string;
  evaluation?: {
    score: number;
    feedback: string;
  };
}

export async function getAIInterviewResponse(context: InterviewContext): Promise<AIResponse> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Returning mock response.');
    return getMockInterviewResponse(context);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildInterviewPrompt(context);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract question and evaluation
    return parseAIResponse(text);
  } catch (error) {
    console.error('Error generating AI interview response:', error);
    return getFallbackResponse(context);
  }
}

function buildInterviewPrompt(context: InterviewContext): string {
  const systemPrompt = `
You are an AI-powered Virtual HR Interviewer designed to conduct professional, real-world placement interviews for engineering students.

Your personality:
- Gender: Female
- Role: Senior HR Manager / Technical Interviewer
- Nature: Calm, confident, soft-spoken, polite, professional
- Communication style: Clear English, slow-paced, reassuring, corporate tone
- Attitude: Encouraging but evaluative

Your appearance (for avatar reference):
- Looks like a real Indian HR manager
- Formal attire (blazer or professional kurti)
- Friendly facial expressions
- Maintains eye contact
- Subtle head nods while listening

Your responsibility:
1. Conduct structured interviews
2. Ask adaptive questions based on candidate answers
3. Evaluate technical knowledge, communication, confidence, and problem-solving
4. Maintain realistic interview flow
5. Never break character
6. Never mention that you are an AI

Interview types you conduct:
- Technical Interview
- Managerial Interview
- HR Interview
- Business Discussion (Tech + HR combined)

You must strictly behave like an interviewer from companies like TCS, Wipro, Capgemini, and Google.
`;

  const interviewInstructions = `
Based on the interview type "${context.interviewType}" for company "${context.companyType}", please provide:

1. A relevant interview question appropriate for this stage
2. If this is the first question, start with a welcome and ask them to introduce themselves
3. If there are previous answers, evaluate them briefly and ask follow-up questions if needed
4. Be adaptive - if the candidate seems to struggle with technical questions, ask simpler ones; if they excel, increase difficulty
5. Maintain a natural conversation flow

Previous questions asked: ${context.previousQuestions.join('; ') || 'None'}
Previous answers received: ${context.previousAnswers.join('; ') || 'None'}

Please respond with the next question in a conversational manner.
`;

  return `${systemPrompt}\n\n${interviewInstructions}`;
}

function parseAIResponse(response: string): AIResponse {
  // Simple parsing - in a real implementation, we'd have more robust parsing
  return {
    question: response.trim(),
  };
}

function getMockInterviewResponse(context: InterviewContext): AIResponse {
  if (context.currentQuestionIndex === 0) {
    if (context.interviewType === INTERVIEW_TYPES.HR) {
      return {
        question: "Hello! Welcome to your HR interview. Could you please introduce yourself and tell me about your background?",
      };
    } else if (context.interviewType === INTERVIEW_TYPES.TECHNICAL) {
      return {
        question: "Welcome to your technical interview. Let's start with a fundamental question. Can you explain the difference between a process and a thread?",
      };
    } else {
      return {
        question: "Welcome to your interview. Could you please introduce yourself?",
      };
    }
  } else {
    return {
      question: "That's interesting. Could you elaborate more on that?",
    };
  }
}

function getFallbackResponse(context: InterviewContext): AIResponse {
  return getMockInterviewResponse(context);
}

// Function to generate evaluation and feedback after interview completion
export async function generateInterviewEvaluation(
  interviewType: string,
  companyType: string,
  questions: string[],
  answers: string[],
  transcript: string
): Promise<{
  scores: Record<string, number>;
  feedback: string;
  overallVerdict: string;
}> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Returning mock evaluation.');
    return getMockEvaluation();
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Evaluate the following interview performance for a ${companyType} ${interviewType} interview.
      
      Questions asked:
      ${questions.join('\n- ')}
      
      Candidate answers:
      ${answers.join('\n- ')}
      
      Full transcript:
      ${transcript}
      
      Provide evaluation in the following JSON format:
      {
        "scores": {
          "technicalKnowledge": number (1-10),
          "communication": number (1-10),
          "confidence": number (1-10),
          "problemSolving": number (1-10),
          "projectUnderstanding": number (1-10),
          "overallHireability": number (1-10)
        },
        "feedback": "Constructive feedback about strengths and areas for improvement",
        "overallVerdict": "Hire / Maybe / Needs Improvement"
      }
      
      Be professional, encouraging but honest in your assessment.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      // If parsing fails, return a structured response based on the text
      return {
        scores: {
          technicalKnowledge: 7,
          communication: 7,
          confidence: 6,
          problemSolving: 7,
          projectUnderstanding: 6,
          overallHireability: 7,
        },
        feedback: text.substring(0, 500) + "...",
        overallVerdict: "Maybe",
      };
    }
  } catch (error) {
    console.error('Error generating interview evaluation:', error);
    return getMockEvaluation();
  }
}

function getMockEvaluation(): {
  scores: Record<string, number>;
  feedback: string;
  overallVerdict: string;
} {
  return {
    scores: {
      technicalKnowledge: 7,
      communication: 8,
      confidence: 6,
      problemSolving: 7,
      projectUnderstanding: 6,
      overallHireability: 7,
    },
    feedback: "Good performance overall. Your communication skills are strong and you demonstrated good problem-solving abilities. However, you could strengthen your technical fundamentals and show more confidence during the interview.",
    overallVerdict: "Maybe",
  };
}