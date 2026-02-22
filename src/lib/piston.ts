
export interface PistonExecutionResult {
    language: string;
    version: string;
    run: {
        stdout: string;
        stderr: string;
        code: number;
        signal: string | null;
        output: string;
    };
    compile?: {
        stdout: string;
        stderr: string;
        code: number;
        signal: string | null;
        output: string;
    };
}

export const executeCode = async (code: string, language: string, stdin: string): Promise<PistonExecutionResult> => {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            language: language,
            version: '*',
            files: [
                {
                    content: code,
                },
            ],
            stdin: stdin,
        }),
    });

    if (!response.ok) {
        throw new Error(`Piston API error: ${response.statusText}`);
    }

    return await response.json();
};

export const mapPistonToStatus = (result: PistonExecutionResult) => {
    if (result.compile && result.compile.code !== 0) {
        return { id: 6, description: 'Compilation Error' };
    }
    if (result.run.code !== 0) {
        return { id: 11, description: 'Runtime Error' };
    }
    return { id: 3, description: 'Accepted' };
};
