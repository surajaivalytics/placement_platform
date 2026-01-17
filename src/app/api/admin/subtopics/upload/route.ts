import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CSVRow {
    question: string;
    option_1: string;
    option_2: string;
    option_3: string;
    option_4: string;
    correct_option: string;
    explanation?: string;
    difficulty?: string;
    category?: string;
    type?: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const testId = formData.get('testId') as string;
        const subtopicId = formData.get('subtopicId') as string;

        if (!file || !testId || !subtopicId) {
            return NextResponse.json(
                { error: 'File, testId, and subtopicId are required' },
                { status: 400 }
            );
        }

        // Verify test exists
        const test = await prisma.test.findUnique({
            where: { id: testId },
        });

        if (!test) {
            return NextResponse.json(
                { error: 'Invalid test ID' },
                { status: 400 }
            );
        }

        // Verify subtopic exists and belongs to the test
        const subtopic = await prisma.subtopic.findFirst({
            where: {
                id: subtopicId,
                testId: testId,
            },
        });

        if (!subtopic) {
            return NextResponse.json(
                { error: 'Invalid subtopic ID or subtopic does not belong to this test' },
                { status: 400 }
            );
        }

        // Read CSV file
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return NextResponse.json(
                { error: 'CSV file is empty or invalid' },
                { status: 400 }
            );
        }

        // Parse header
        const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Define mapping for flexible header names
        const headerMapping: Record<string, string> = {
            'id': 'id',
            'question': 'question',
            'text': 'question',
            'option_1': 'option_1',
            'option1': 'option_1',
            'option_2': 'option_2',
            'option2': 'option_2',
            'option_3': 'option_3',
            'option3': 'option_3',
            'option_4': 'option_4',
            'option4': 'option_4',
            'correct_option': 'correct_option',
            'correctoption': 'correct_option',
            'correct_index': 'correct_option',
            'explanation': 'explanation',
            'difficulty': 'difficulty',
            'category': 'category',
            'type': 'type'
        };

        const headers = rawHeaders.map(h => headerMapping[h] || h);

        // Validate required headers
        const requiredHeaders = ['question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_option'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return NextResponse.json(
                { error: `Missing required headers: ${missingHeaders.join(', ')}` },
                { status: 400 }
            );
        }

        const questionsCreated: Array<{ id: string; text: string }> = [];
        const errors: string[] = [];

        // Get the current max order for this test
        const maxOrderQuestion = await prisma.question.findFirst({
            where: { testId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        let currentOrder = (maxOrderQuestion?.order ?? -1) + 1;

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = parseCSVLine(lines[i]);
                if (values.length === 0) continue;

                const row: Record<string, string> = {};
                headers.forEach((header, index) => {
                    row[header] = values[index]?.trim() || '';
                });

                // Validate required fields
                if (!row.question || !row.correct_option) {
                    errors.push(`Row ${i + 1}: Missing question or correct_option`);
                    continue;
                }

                // Determine question type (default to multiple-choice if not specified)
                const questionType = row.type || 'multiple-choice';

                if (questionType === 'multiple-choice') {
                    // Convert correct_option (A, B, C, D or 1, 2, 3, 4) to index
                    let correctIndex = -1;
                    const co = row.correct_option.toUpperCase();
                    if (co === 'A') correctIndex = 1;
                    else if (co === 'B') correctIndex = 2;
                    else if (co === 'C') correctIndex = 3;
                    else if (co === 'D') correctIndex = 4;
                    else {
                        correctIndex = parseInt(row.correct_option);
                    }

                    if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) {
                        errors.push(`Row ${i + 1}: Invalid correct_option '${row.correct_option}'. Use A, B, C, D or 1-4`);
                        continue;
                    }

                    // Store explanation in metadata if it exists
                    const metadata = row.explanation ? JSON.stringify({ explanation: row.explanation }) : null;

                    const question = await prisma.question.create({
                        data: {
                            testId,
                            subtopicId, // Assign to subtopic
                            text: row.question,
                            type: 'multiple-choice',
                            category: row.category || 'General',
                            difficulty: row.difficulty || 'Medium',
                            order: currentOrder,
                            metadata,
                            options: {
                                create: [
                                    { text: row.option_1, isCorrect: correctIndex === 1 },
                                    { text: row.option_2, isCorrect: correctIndex === 2 },
                                    { text: row.option_3, isCorrect: correctIndex === 3 },
                                    { text: row.option_4, isCorrect: correctIndex === 4 },
                                ],
                            },
                        },
                        include: { options: true },
                    });

                    questionsCreated.push(question);
                    currentOrder++;
                } else {
                    errors.push(`Row ${i + 1}: Unsupported question type '${questionType}' in this upload format`);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Row ${i + 1}: ${message}`);
            }
        }

        // Update subtopic's totalQuestions count
        await prisma.subtopic.update({
            where: { id: subtopicId },
            data: {
                totalQuestions: {
                    increment: questionsCreated.length,
                },
            },
        });

        return NextResponse.json({
            message: `Successfully uploaded ${questionsCreated.length} questions to subtopic "${subtopic.name}"`,
            created: questionsCreated.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('Error uploading questions:', error);
        return NextResponse.json(
            { error: 'Failed to upload questions' },
            { status: 500 }
        );
    }
}

// Helper function to parse CSV line (handles quoted values and escaped quotes)
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            // Check for escaped quote (double double quote)
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // Skip the next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    // Remove potential carriage return and strip outer quotes
    return result.map(v => v.trim().replace(/^"|"$/g, ''));
}
