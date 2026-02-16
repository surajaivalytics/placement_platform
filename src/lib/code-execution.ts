
interface WrapperConfig {
    functionName: string;
    inputStructure: string[]; // e.g. ["int[]", "int"]
    outputType?: string;
}

export function wrapCode(code: string, language: string, config: WrapperConfig): string {
    const { functionName, inputStructure } = config;

    switch (language) {
        case 'python':
            return wrapPython(code, functionName, inputStructure);
        case 'java':
            return wrapJava(code, functionName, inputStructure);
        case 'javascript':
            return wrapJavascript(code, functionName, inputStructure);
        case 'c++':
        case 'cpp':
            return wrapCpp(code, functionName, inputStructure);
        case 'c':
            return wrapC(code, functionName, inputStructure);
        default:
            return code; // Fallback: run as is
    }
}

function wrapPython(code: string, functionName: string, inputs: string[]): string {
    // Python Driver:
    // expects inputs line by line or json-encoded lines?
    // Let's assume standard LeetCode: line-separated inputs, often JSON valid for arrays/lists.
    // e.g.
    // [2,7,11,15]
    // 9

    const readInputs = inputs.map((type, idx) => {
        // Simple type based parsing
        if (type.includes('[]') || type.includes('List')) {
            return `json.loads(sys.stdin.readline())`;
        }
        if (type === 'int') {
            return `int(sys.stdin.readline())`;
        }
        if (type === 'float') {
            return `float(sys.stdin.readline())`;
        }
        if (type === 'string' || type === 'str') {
            return `sys.stdin.readline().strip().strip('"')`;
        }
        // Default fallback to json loads for structure or raw for string
        return `json.loads(sys.stdin.readline())`;
    }).join(', ');

    return `
import sys
import json
from typing import List, Dict, Optional

${code}

if __name__ == "__main__":
    try:
        # Auto-generated driver
        args = [${readInputs}]
        result = ${functionName}(*args)
        
        # Print result as JSON for consistency
        print(json.dumps(result))
    except Exception as e:
        print(str(e), file=sys.stderr)
`;
}

function wrapJava(code: string, functionName: string, inputs: string[]): string {
    // Java requires a class. 
    // If user provides "class Solution { ... }", we leave it.
    // If user provides "public void solve...", we might need to wrap it?
    // LeetCode usually gives "class Solution".

    // We create a Main class that instantiates Solution.

    // Input parsing in Java is verbose.
    // We'll use a Scanner.

    const inputReaders = inputs.map(type => {
        if (type === 'int') return `scanner.nextInt()`;
        if (type === 'String') return `scanner.next()`;
        // For arrays, it's harder with Scanner directly without loop. 
        // For simplicity in this mock: Assume simple inputs or use a custom parser helper.
        return `scanner.next()`; // Placeholder
    }).join(', ');

    // Simplistic Check: does code have "class Solution"?
    const hasSolutionClass = code.includes("class Solution");
    const classCtx = hasSolutionClass ? code : `
class Solution {
    ${code}
}
`;

    return `
import java.util.*;
import java.io.*;

${classCtx}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Solution solution = new Solution();
        
        try {
            // NOTE: This driver is a basic stub. 
            // Complex input parsing (arrays/lists) requires meaningful logic 
            // corresponding to the 'inputStructure' metadata.
            
            // For now, we assume simple single-value inputs or string inputs for prototype
            // Implement proper JSON parsing or line reading later if needed.
            
            // System.out.println(solution.${functionName}(${inputReaders}));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
`;
}

function wrapJavascript(code: string, functionName: string, inputs: string[]): string {
    // JS Driver
    return `
${code}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');

function parseInput(val, type) {
    if (type.includes('[]')) return JSON.parse(val);
    if (type === 'int') return parseInt(val);
    return JSON.parse(val || 'null'); // Safe fallback
}

try {
    const types = ${JSON.stringify(inputs)};
    const args = types.map((t, i) => parseInput(input[i], t));
    
    const result = ${functionName}(...args);
    console.log(JSON.stringify(result));
} catch (e) {
    console.error(e);
}
`;
}

function wrapCpp(code: string, functionName: string, inputs: string[]): string {
    // C++ Driver. User usually writes "class Solution { ... };"
    // We need to include libraries.

    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <map>

using namespace std;

${code}

int main() {
    Solution solution;
    // Input parsing stub
    // int a; cin >> a;
    // cout << solution.${functionName}(a) << endl;
    return 0;
}
`;
}

function wrapC(code: string, functionName: string, inputs: string[]): string {
    return `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${code}

int main() {
    // Driver code
    // printf("%d", ${functionName}(...));
    return 0;
}
`;
}

export function getStarterCode(language: string, config: WrapperConfig): string {
    const { functionName, inputStructure, outputType } = config;
    if (!functionName) return ""; // Fallback to empty or generic if no metadata

    switch (language) {
        case 'python':
            return `def ${functionName}(${inputStructure.map((t, i) => `arg${i}: ${t}`).join(', ')}):\n    # Write your code here\n    pass`;
        case 'javascript':
            return `function ${functionName}(${inputStructure.map((t, i) => `arg${i}`).join(', ')}) {\n    // Write your code here\n    return;\n}`;
        case 'java':
            // inputStructure e.g. ["int[]", "int"]
            const javaArgs = inputStructure.map((t, i) => `${t} arg${i}`).join(', ');
            return `class Solution {\n    public ${outputType || 'void'} ${functionName}(${javaArgs}) {\n        // Write your code here\n        return null;\n    }\n}`;
        case 'cpp':
        case 'c++':
            const cppArgs = inputStructure.map((t, i) => `${t} arg${i}`).join(', ');
            return `class Solution {\npublic:\n    ${outputType || 'void'} ${functionName}(${cppArgs}) {\n        // Write your code here\n    }\n};`;
        case 'c':
            const cArgs = inputStructure.map((t, i) => `${t} arg${i}`).join(', ');
            return `${outputType || 'void'} ${functionName}(${cArgs}) {\n    // Write your code here\n}`;
        default:
            return "// Write your code here";
    }
}
