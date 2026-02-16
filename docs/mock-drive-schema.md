# Mock Placement Drive System - Schema Documentation

## Overview
This document details the database schema for the isolated Mock Placement Drive system. The schema is designed to support realistic placement simulations with up to 4 rounds (MCQ, Coding, Technical Interview, HR Interview).

## Core Models

### 1. MockCompanyDrive
Represents a mock placement event conducted by a company.
- **Table Name**: `MockCompanyDrive`
- **Key Fields**:
  - `id`: Unique identifier.
  - `title`: e.g., "Google SDE Mock Drive".
  - `companyName`: e.g., "Google".
  - `isLive`: Toggle visibility of the drive.

### 2. MockRound
Defines a specific stage within a drive.
- **Table Name**: `MockRound`
- **Key Fields**:
  - `driveId`: FK to `MockCompanyDrive`.
  - `roundNumber`: 1 to 4.
  - `type`: Enum (`MCQ`, `CODING`, `TECH_INTERVIEW`, `HR_INTERVIEW`).
  - `metadata`: JSON field for round-specific settings (e.g., strict mode enabled).

### 3. MockQuestion
Stores questions for a specific round.
- **Table Name**: `MockQuestion`
- **Key Fields**:
  - `roundId`: FK to `MockRound`.
  - `type`: String ('mcq', 'coding', 'interview').
  - **JSON Fields**:
    - `options`: Array of `{ text: string, isCorrect: boolean }` (for MCQs).
    - `codingMetadata`: `{ inputFormat, outputFormat, constraints, testCases, starterCode }` (for Coding).

### 4. MockDriveEnrollment
Tracks user participation in a drive.
- **Table Name**: `MockDriveEnrollment`
- **Key Fields**:
  - `userId`: FK to `User`.
  - `driveId`: FK to `MockCompanyDrive`.
  - `status`: Enum (`IN_PROGRESS`, `PASSED`, `FAILED`).
  - `currentRoundNumber`: Tracks progress (1-4).
  - `overallScore`: Cumulative score.

### 5. MockRoundProgress
Tracks user status within a specific round.
- **Table Name**: `MockRoundProgress`
- **Key Fields**:
  - `enrollmentId`: FK to `MockDriveEnrollment`.
  - `roundId`: FK to `MockRound`.
  - `status`: Enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`).
  - `aiFeedback`: Summary feedback for the round.

### 6. MockResponse
Stores submitted answers for MCQs and Coding problems.
- **Table Name**: `MockResponse`
- **Key Fields**:
  - `roundProgressId`: FK to `MockRoundProgress`.
  - `questionId`: FK to `MockQuestion`.
  - `answer`: The user's submission (Option ID or Code string).
  - `lastSavedAt`: Timestamp for auto-save recovery.
  - `passedCases` / `totalCases`: For coding evaluation.

### 7. MockInterviewInteraction
Logs chat or voice interactions for AI interviews.
- **Table Name**: `MockInterviewInteraction`
- **Key Fields**:
  - `roundProgressId`: FK to `MockRoundProgress`.
  - `questionText`: The question asked by AI.
  - `answerText`: The user's transcribed answer.
  - `audioUrl`: URL to recording if applicable.
  - `aiFeedback` / `score` / `sentiment`: Evaluation metadata per interaction.

## JSON Schema Definitions

### Coding Metadata (`MockQuestion.codingMetadata`)
```json
{
  "inputFormat": "Input consists of two integers A and B.",
  "outputFormat": "Print the sum of A and B.",
  "constraints": "1 <= A, B <= 1000",
  "starterCode": "function solve(input) { ... }",
  "testCases": [
    { "input": "2 3", "output": "5", "isHidden": false },
    { "input": "10 -5", "output": "5", "isHidden": true }
  ]
}
```

### MCQ Options (`MockQuestion.options`)
```json
[
  { "id": "opt1", "text": "Option A", "isCorrect": false },
  { "id": "opt2", "text": "Option B", "isCorrect": true }
]
```

### AI Evaluation (`MockResponse.aiEvaluation`)
```json
{
  "feedback": "Good use of recursion, but time complexity is O(2^n).",
  "suggestions": ["Use dynamic programming to optimize."],
  "sentiment": "Neutral"
}
```

## Workflows

### Starting a Drive
1. Create `MockDriveEnrollment` for the user.
2. Create initial `MockRoundProgress` for Round 1.
3. Update `User.mockEnrollments`.

### Submitting an Answer (Coding)
1. Find or create `MockResponse` by `roundProgressId` and `questionId`.
2. Update `answer` with code.
3. Update `lastSavedAt`.
4. Run test cases and update `passedCases`, `score`.

### Completing a Round
1. Aggregate scores from `MockResponse` (or `MockInterviewInteraction`).
2. Update `MockRoundProgress.status` to `COMPLETED`.
3. Check passing criteria.
4. If passed:
   - Create `MockRoundProgress` for Round N+1.
   - Update `MockDriveEnrollment.currentRoundNumber`.
5. If failed:
   - Update `MockDriveEnrollment.status` to `FAILED`.
