
export interface Judge0Result {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    exit_code: number | null;
    time: string | null;
    memory: number | null;
    status: {
        id: number;
        description: string;
    };
}

export const executeCode = async (code: string, languageId: number, stdin: string): Promise<Judge0Result> => {
    const apiKey = process.env.RAPIDAPI_JUDGE0_KEY;
    const apiHost = process.env.RAPIDAPI_JUDGE0_HOST;

    if (!apiKey || !apiHost) {
        throw new Error('Judge0 API key or host not configured');
    }

    const response = await fetch(`https://${apiHost}/submissions?base64_encoded=true&wait=true`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost,
        },
        body: JSON.stringify({
            source_code: Buffer.from(code).toString('base64'),
            language_id: languageId,
            stdin: Buffer.from(stdin).toString('base64'),
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Judge0 API error: ${response.statusText} ${errorData.message || ''}`);
    }

    const result = await response.json();

    // Decode base64 outputs
    return {
        ...result,
        stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : null,
        stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null,
        compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : null,
        message: result.message ? Buffer.from(result.message, 'base64').toString() : null,
    };
};
