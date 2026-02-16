
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

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

// Mapping Judge0 Language IDs to Piston Language Names
const LANGUAGE_MAPPING: Record<number | string, { name: string; version: string }> = {
    // Python
    71: { name: "python", version: "3.10.0" },
    "python": { name: "python", version: "3.10.0" },
    // JavaScript
    63: { name: "javascript", version: "18.15.0" },
    "javascript": { name: "javascript", version: "18.15.0" },
    // C++
    54: { name: "cpp", version: "10.2.0" },
    "cpp": { name: "cpp", version: "10.2.0" },
    "c++": { name: "cpp", version: "10.2.0" },
    // Java
    62: { name: "java", version: "15.0.2" },
    "java": { name: "java", version: "15.0.2" },
    // C
    50: { name: "c", version: "10.2.0" },
    "c": { name: "c", version: "10.2.0" },
    // TypeScript
    74: { name: "typescript", version: "5.0.3" },
    "typescript": { name: "typescript", version: "5.0.3" },
};

export async function executeCode(
    sourceCode: string,
    languageIdOrName: string | number,
    stdin: string = ""
): Promise<PistonExecutionResult> {
    const mapping = LANGUAGE_MAPPING[languageIdOrName];
    if (!mapping) {
        throw new Error(`Unsupported language: ${languageIdOrName}`);
    }

    const payload = {
        language: mapping.name,
        version: mapping.version,
        files: [
            {
                content: sourceCode,
            },
        ],
        stdin: stdin,
    };

    const response = await fetch(PISTON_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Piston API error (${response.status}): ${errorText}`);
    }

    return response.json();
}

/**
 * Maps Piston result back to Judge0-like status for UI compatibility
 * Judge0 Status IDs:
 * 3: Accepted
 * 4: Wrong Answer (mapped manually if needed)
 * 6: Compilation Error
 * 7: Runtime Error (SIGSEGV)
 * 8: Runtime Error (SIGXFSZ)
 * 9: Runtime Error (SIGFPE)
 * 10: Runtime Error (SIGABRT)
 * 11: Runtime Error (NZEC)
 * 12: Runtime Error (Other)
 * 13: Internal Error
 * 14: Exec Format Error
 */
export function mapPistonToStatus(result: PistonExecutionResult) {
    if (result.compile && result.compile.code !== 0) {
        return { id: 6, description: "Compilation Error" };
    }

    if (result.run.code !== 0) {
        // If it's a non-zero exit code, it's a runtime error
        return { id: 11, description: "Runtime Error (NZEC)" };
    }

    return { id: 3, description: "Accepted" };
}
