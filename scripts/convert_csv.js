const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'Time and work.csv');
const outputFile = path.join(__dirname, '..', 'public', 'placement_questions_ready.csv');

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
}

function convert() {
    if (!fs.existsSync(inputFile)) {
        console.error('Input file not found:', inputFile);
        return;
    }

    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
        console.error('CSV file is empty or invalid');
        return;
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const targetHeaders = [
        'text', 'type', 'category', 'difficulty',
        'option1', 'option2', 'option3', 'option4', 'correctOption',
        'testCases', 'sampleInput', 'sampleOutput', 'constraints'
    ];

    const outputRows = [targetHeaders.join(',')];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 7) continue;

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });

        // Mapping
        const questionText = row['question'] || '';
        const category = 'quant'; // Defaulting to quant as it's Time and Work
        const difficulty = row['difficulty'] || 'Medium';
        const option1 = row['option_1'] || '';
        const option2 = row['option_2'] || '';
        const option3 = row['option_3'] || '';
        const option4 = row['option_4'] || '';

        let correctOption = row['correct_option'] || '';
        // Map A,B,C,D to 1,2,3,4
        if (correctOption === 'A') correctOption = '1';
        else if (correctOption === 'B') correctOption = '2';
        else if (correctOption === 'C') correctOption = '3';
        else if (correctOption === 'D') correctOption = '4';

        // Escape quotes for CSV
        const escape = (text) => {
            if (!text) return '""';
            return `"${text.toString().replace(/"/g, '""')}"`;
        };

        const newRow = [
            escape(questionText),
            'multiple-choice',
            escape(category),
            escape(difficulty),
            escape(option1),
            escape(option2),
            escape(option3),
            escape(option4),
            correctOption,
            '', // testCases
            '', // sampleInput
            '', // sampleOutput
            ''  // constraints
        ];

        outputRows.push(newRow.join(','));
    }

    fs.writeFileSync(outputFile, outputRows.join('\n'));
    console.log(`Successfully converted ${outputRows.length - 1} questions to ${outputFile}`);
}

convert();
