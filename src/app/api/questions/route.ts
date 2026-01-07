import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createQuestion, getQuestions } from '@/lib/airtable';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const question = await createQuestion(body);
        return NextResponse.json(question);
    } catch {
        return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }
}

export async function GET(_req: Request) {
    // Optional: Add filtering logic here based on query params
    const questions = await getQuestions();
    return NextResponse.json(questions);
}
