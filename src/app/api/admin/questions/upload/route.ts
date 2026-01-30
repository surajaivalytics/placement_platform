import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const testId = formData.get('testId') as string;

        if (!file || !testId) {
            return NextResponse.json({ error: 'File and Test ID are required' }, { status: 400 });
        }

        const text = await file.text();
        const lines = text.split('\n').filter((line: string) => line.trim());

        if (lines.length < 2) {
            return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
        }

        // Parse header
        const rawHeaders = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
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
            'category': 'category'
        };

        const headers = rawHeaders.map((h: string) => headerMapping[h] || h);
        const requiredHeaders = ['question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_option'];
        const missingHeaders = requiredHeaders.filter((h: string) => !headers.includes(h));

        if (missingHeaders.length > 0) {
            return NextResponse.json({ error: `Missing required headers: ${missingHeaders.join(', ')}` }, { status: 400 });
        }

        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = parseCSVLine(lines[i]);
                if (values.length === 0) continue;

                const row: Record<string, string> = {};
                headers.forEach((header: string, index: number) => {
                    row[header] = values[index]?.trim() || '';
                });

                if (!row.question || !row.correct_option) {
                    errorCount++;
                    continue;
                }

                let correctIndex = -1;
                const co = row.correct_option.toUpperCase();
                if (co === 'A') correctIndex = 1;
                else if (co === 'B') correctIndex = 2;
                else if (co === 'C') correctIndex = 3;
                else if (co === 'D') correctIndex = 4;
                else correctIndex = parseInt(row.correct_option);

                if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) {
                    errorCount++;
                    continue;
                }

                const metadata = row.explanation ? JSON.stringify({ explanation: row.explanation }) : null;

                await prisma.question.create({
                    data: {
                        testId,
                        text: row.question,
                        type: 'multiple-choice',
                        category: row.category || 'General',
                        difficulty: row.difficulty || 'Medium',
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
                });
                successCount++;
            } catch (e) {
                errorCount++;
            }
        }

        return NextResponse.json({
            message: `Processed ${successCount} questions successfully. ${errorCount} errors.`,
            successCount,
            errorCount
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++;
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
    return result.map((v: string) => v.trim().replace(/^"|"$/g, ''));
}
