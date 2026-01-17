import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const companyType = searchParams.get('companyType') || null;
    const interviewType = searchParams.get('interviewType') || null;

    // Build where clause based on filters
    const whereClause: any = {
      userId: session.user.id,
    };

    if (companyType) {
      whereClause.companyType = companyType;
    }

    if (interviewType) {
      whereClause.interviewType = interviewType;
    }

    // Fetch interview sessions with pagination and filters
    const interviewSessions = await prisma.interviewSession.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.interviewSession.count({
      where: whereClause,
    });

    return new Response(
      JSON.stringify({ 
        interviews: interviewSessions,
        totalCount,
        limit,
        offset,
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching interview history:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}