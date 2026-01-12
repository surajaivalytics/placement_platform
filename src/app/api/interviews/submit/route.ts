import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInterviewEvaluation } from '@/lib/interview-ai';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { 
      interviewType, 
      companyType, 
      questions, 
      answers, 
      transcript,
      duration 
    } = body;

    if (!interviewType || !companyType || !Array.isArray(questions) || !Array.isArray(answers)) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Generate AI evaluation
    const evaluation = await generateInterviewEvaluation(
      interviewType,
      companyType,
      questions,
      answers,
      transcript || questions.map((q: string, i: number) => `${q}\n${answers[i] || ''}`).join('\n\n')
    );

    // Create interview session in database
    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        interviewType,
        companyType,
        startedAt: new Date(Date.now() - (duration || 0) * 1000), // Calculate start time
        endedAt: new Date(),
        scores: evaluation.scores,
        feedback: evaluation.feedback,
        overallVerdict: evaluation.overallVerdict,
        transcript: transcript,
        recordingUrl: null, // In a real implementation, this would come from the recording system
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        interviewSessionId: interviewSession.id,
        evaluation 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error submitting interview:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}