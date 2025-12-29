# Violation Detection System

This document describes the violation detection and warning system for the online exam proctoring platform.

## Overview

The violation detection system monitors student behavior during exams and issues warnings for prohibited actions. After 3 warnings, the test is automatically submitted.

## Features

### Violation Types Detected

1. **Fullscreen Exit** - Detects when user exits fullscreen mode
2. **Tab Switching / Window Blur** - Detects when user switches tabs or minimizes browser
3. **Looking Away from Camera** - Detects when user looks away for more than 3 seconds
4. **Copy/Paste/Right Click** - Detects and blocks copy, paste, cut operations and right-click context menu
5. **Keyboard Shortcuts** - Detects prohibited shortcuts (Alt+Tab, Ctrl+Tab, Alt+F4)

### Warning System

- Maximum warnings: 3
- Each violation increments the warning counter
- Warning modal displays violation type and remaining warnings
- On 4th violation, test is automatically submitted

## Implementation

### Files

- `src/hooks/useViolationDetection.ts` - Main violation detection hook
- `src/components/proctoring/violation-warning-modal.tsx` - Warning modal component
- Integrated into:
  - `src/components/test/test-interface.tsx`
  - `src/components/placements/placement-mcq-test.tsx`

### Usage

```typescript
import { useViolationDetection } from '@/hooks/useViolationDetection';
import { ViolationWarningModal } from '@/components/proctoring/violation-warning-modal';

const { warningCount, resetViolations } = useViolationDetection({
  maxWarnings: 3,
  onViolation: handleViolationDetected,
  onMaxViolations: handleMaxViolations,
  enabled: examStarted,
  videoElementRef: previewVideoRef,
  faceDetectionEnabled: true,
  faceAwayThreshold: 3,
});
```

## Backend API Integration Points

### 1. Face Detection API

**Location:** `src/hooks/useViolationDetection.ts` (line ~350)

Replace the basic face detection with a backend API call:

```typescript
const detectFaceWithAPI = async () => {
  if (!videoElement || videoElement.readyState !== 4) return false;

  try {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // TODO: Replace with actual API call
    const response = await fetch('/api/proctoring/detect-face', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageData,
        timestamp: Date.now(),
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.hasFace && result.faceDirection === 'front';
    }
    
    return detectFace(); // Fallback to basic detection
  } catch (error) {
    console.error('API face detection error:', error);
    return detectFace();
  }
};
```

**Expected API Response:**
```json
{
  "hasFace": true,
  "faceDirection": "front" | "left" | "right" | "away",
  "confidence": 0.95
}
```

### 2. Violation Logging API

**Location:** `src/components/test/test-interface.tsx` (line ~220)

Send violation logs when test is submitted:

```typescript
// In submitTest function
if (createdResultId) {
  // Send violation logs to backend
  await fetch(`/api/tests/${testId}/violations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resultId: createdResultId,
      violations: violationLogs,
      warningCount,
      autoSubmitted: isMaxViolations,
    }),
  });
}
```

**Location:** `src/components/placements/placement-mcq-test.tsx` (line ~120)

For placement tests:

```typescript
// In handleSubmit and handleAutoSubmit functions
await fetch(`/api/placements/${applicationId}/violations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    violations: violationLogs,
    warningCount,
    autoSubmitted: isMaxViolations,
  }),
});
```

**Expected API Request Body:**
```json
{
  "resultId": "result-id-here",
  "violations": [
    {
      "type": "tab_switch",
      "timestamp": 1234567890,
      "metadata": {
        "duration": 5000,
        "reason": "Tab or window was switched"
      }
    }
  ],
  "warningCount": 3,
  "autoSubmitted": true
}
```

## Backend API Endpoints to Implement

### 1. Face Detection Endpoint

**POST** `/api/proctoring/detect-face`

Request:
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "timestamp": 1234567890
}
```

Response:
```json
{
  "hasFace": true,
  "faceDirection": "front",
  "confidence": 0.95
}
```

### 2. Violation Logging Endpoint (Tests)

**POST** `/api/tests/[testId]/violations`

Request:
```json
{
  "resultId": "result-id",
  "violations": [...],
  "warningCount": 3,
  "autoSubmitted": true
}
```

Response:
```json
{
  "success": true,
  "violationLogId": "log-id"
}
```

### 3. Violation Logging Endpoint (Placements)

**POST** `/api/placements/[applicationId]/violations`

Request:
```json
{
  "violations": [...],
  "warningCount": 3,
  "autoSubmitted": true
}
```

Response:
```json
{
  "success": true,
  "violationLogId": "log-id"
}
```

## Database Schema Suggestions

Consider adding a `ViolationLog` table:

```prisma
model ViolationLog {
  id            String   @id @default(cuid())
  resultId      String?
  applicationId String?
  type          String   // violation type
  timestamp     DateTime
  metadata      Json?
  warningCount  Int
  autoSubmitted Boolean  @default(false)
  createdAt     DateTime @default(now())
  
  result        TestResult? @relation(fields: [resultId], references: [id])
  
  @@index([resultId])
  @@index([applicationId])
}
```

## Testing

To test the violation detection system:

1. **Fullscreen Exit**: Press F11 or ESC during exam
2. **Tab Switch**: Switch to another tab
3. **Copy/Paste**: Try Ctrl+C or Ctrl+V
4. **Right Click**: Right-click anywhere on the page
5. **Keyboard Shortcuts**: Try Alt+Tab, Ctrl+Tab, Alt+F4
6. **Face Detection**: Cover camera or look away for 3+ seconds

## Notes

- Face detection uses basic image analysis. For production, implement proper ML-based face detection via backend API.
- All violations are logged with timestamps for review.
- The system automatically stops camera stream and disables inputs on max violations.
- Violation logs are included in test submission for administrator review.

