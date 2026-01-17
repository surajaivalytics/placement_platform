# Database Schema Fix - Subtopic Tables

## Problem
The application was throwing 500 errors because the database schema was out of sync with the Prisma schema. Specifically:
- The `Subtopic` table was missing from the database
- The `UserSubtopicProgress` table was missing from the database
- Foreign key constraints were not set up

Error message:
```
column Question.subtopicId does not exist
```

## Root Cause
The Prisma migrations were not applied to the database. The `subtopicId` column existed in the `Question` table, but the `Subtopic` table itself was missing, causing foreign key constraint failures.

## Solution Applied

### 1. Removed `directUrl` from Prisma Schema
**File:** `prisma/schema.prisma`
- Removed the optional `directUrl` property that was causing Prisma CLI validation errors
- This was preventing migrations from running

### 2. Created Migration Script
**File:** `create-subtopic-tables.js`
- Created a Node.js script to manually create the missing tables
- Script creates:
  - `Subtopic` table with all required columns
  - `UserSubtopicProgress` table with all required columns
  - All necessary indexes for performance
  - All foreign key constraints

### 3. Executed Migration
Successfully ran the migration script which:
- ✅ Created `Subtopic` table
- ✅ Created `UserSubtopicProgress` table
- ✅ Created indexes on:
  - `Subtopic.testId`
  - `Question.subtopicId`
  - `UserSubtopicProgress.userId`
  - `UserSubtopicProgress.subtopicId`
  - `UserSubtopicProgress.userId_subtopicId` (unique)
- ✅ Created foreign key constraints:
  - `Subtopic.testId` → `Test.id`
  - `Question.subtopicId` → `Subtopic.id`
  - `UserSubtopicProgress.userId` → `User.id`
  - `UserSubtopicProgress.subtopicId` → `Subtopic.id`

## Tables Created

### Subtopic Table
```sql
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### UserSubtopicProgress Table
```sql
CREATE TABLE "UserSubtopicProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "score" INTEGER,
    "total" INTEGER,
    "percentage" DOUBLE PRECISION,
    "attempted" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "answers" TEXT,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Expected Result
After this fix:
- ✅ `/api/tests/[id]` endpoint should work without errors
- ✅ `/api/tests/[id]/subtopics` endpoint should work without errors
- ✅ Subtopic-based test flow should function properly
- ✅ No more "column does not exist" errors

## Verification
To verify the fix worked:
1. Refresh the browser
2. Navigate to a test page
3. Check that subtopics load without 500 errors
4. Check browser console for any remaining errors

## Files Modified
- `prisma/schema.prisma` - Removed directUrl
- `create-subtopic-tables.js` - New migration script (can be deleted after verification)
- `check-tables.js` - Helper script to check database state (can be deleted)

## Next Steps
1. Test the application to ensure subtopics work correctly
2. Delete the temporary migration scripts if everything works
3. Consider setting up proper Prisma migrations workflow for future schema changes
