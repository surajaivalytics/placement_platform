# Subtopic-Based Testing Feature

## Overview

This feature implements an IndiaBIX-style testing flow where users can practice aptitude questions organized by topics and subtopics. Instead of taking a full test immediately, users first select a topic, then choose from available subtopics, and finally take focused tests on individual subtopics.

## User Flow

```
Topics Page
   ↓ (Click Start on a topic)
Subtopics List
   ↓ (Click Start on a subtopic)
Subtopic Test
   ↓ (Submit)
Subtopic Result
   ↓ (Options)
├─ Back to Subtopics (continue with other subtopics)
├─ Retry Subtopic
└─ After all completed → Topic Summary
```

## Database Schema

### New Models

#### Subtopic
- `id`: Unique identifier
- `testId`: Reference to parent test
- `name`: Subtopic name (e.g., "Synonyms", "Number Series")
- `description`: Brief description
- `totalQuestions`: Count of questions in this subtopic
- `order`: Display order
- Relations: Test, Questions, UserSubtopicProgress

#### UserSubtopicProgress
- `id`: Unique identifier
- `userId`: Reference to user
- `subtopicId`: Reference to subtopic
- `score`: Number of correct answers
- `total`: Total questions attempted
- `percentage`: Score percentage
- `attempted`: Whether user has started
- `completed`: Whether user has finished
- `answers`: JSON of user's answers
- `timeSpent`: Time taken in seconds
- Unique constraint on (userId, subtopicId)

### Updated Models

#### Question
- Added `subtopicId` field (optional)
- Questions can now belong to a subtopic

#### User
- Added `subtopicProgress` relation

## API Endpoints

### GET `/api/tests/[id]/subtopics`
Fetches all subtopics for a test with user progress
- Returns: Array of subtopics with progress data
- Includes question count and completion status

### GET `/api/tests/[id]/subtopics/[subtopicId]/questions`
Fetches questions for a specific subtopic
- Returns: Questions array and subtopic details
- Used by the test interface

### POST `/api/tests/[id]/subtopics/[subtopicId]/submit`
Submits answers for a subtopic test
- Body: `{ answers: Record<string, string>, timeSpent: number }`
- Calculates score and saves progress
- Returns: Result with score, total, percentage

## Pages

### `/dashboard/test/[id]/subtopics`
**Subtopics Selection Page**
- Displays all subtopics for a topic
- Shows progress badges (Not Started, In Progress, Completed)
- Displays scores for completed subtopics
- Overall progress bar
- Option to view topic summary when all completed

### `/dashboard/test/[id]/subtopic/[subtopicId]`
**Subtopic Test Page**
- Uses existing `PlacementMCQTest` component
- 15-minute duration per subtopic
- Full proctoring features enabled
- Submits to subtopic-specific endpoint

### `/dashboard/test/[id]/subtopic/[subtopicId]/result`
**Subtopic Result Page**
- Shows score, percentage, and grade
- Visual progress indicators
- Options to:
  - View all subtopics
  - Retry current subtopic
  - Return to topics

### `/dashboard/test/[id]/summary`
**Topic Summary Page**
- Overall performance across all subtopics
- Strongest and weakest areas
- Subtopic-wise breakdown with visual charts
- Recommendations for improvement

## Subtopic Definitions

### Verbal Ability
1. Synonyms
2. Antonyms
3. Sentence Correction
4. Reading Comprehension
5. Spotting Errors

### Logical Reasoning
1. Number Series
2. Coding-Decoding
3. Blood Relations
4. Direction Sense
5. Puzzles

### Basic Mathematics
1. Percentages
2. Profit & Loss
3. Time & Work
4. Simple Interest
5. Averages

### Aptitude
1. Arithmetic
2. Data Interpretation
3. Ratios
4. Time & Distance
5. Probability

## Setup Instructions

### 1. Database Migration

The schema has been updated with new models. To apply the changes:

```bash
# Option 1: Create and apply migration
npx prisma migrate dev --name add_subtopics_and_progress

# Option 2: Push schema directly (development only)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 2. Create Subtopics for Existing Tests

Run the subtopic creation script:

```bash
npx tsx scripts/create-subtopics.ts
```

This will:
- Find all topic tests
- Create appropriate subtopics based on test title
- Skip tests that already have subtopics

### 3. Assign Questions to Subtopics (Manual)

Currently, questions need to be manually assigned to subtopics. You can do this via:

1. **Admin Panel** (if available)
2. **Database Update**:
```sql
UPDATE "Question" 
SET "subtopicId" = 'subtopic-id-here'
WHERE "testId" = 'test-id-here' 
AND "category" = 'category-name';
```

3. **Bulk Upload** - Update CSV upload to include subtopic field

## Features

### Progress Tracking
- Individual subtopic completion status
- Score and percentage for each subtopic
- Overall topic progress
- Historical performance data

### Smart Navigation
- Breadcrumb navigation
- Back to topics/subtopics
- Continue where you left off
- Retry any subtopic

### Visual Feedback
- Color-coded status badges
- Progress bars and charts
- Grade indicators (A+, A, B, C, F)
- Performance insights

### Proctoring
- Full proctoring enabled for subtopic tests
- Camera monitoring
- Violation tracking
- Same security as full tests

## Future Enhancements

### Planned Features
1. **Auto-assign questions to subtopics** based on category/tags
2. **Adaptive difficulty** - Adjust question difficulty based on performance
3. **Recommendations** - Suggest next subtopics based on weak areas
4. **Leaderboards** - Subtopic-wise rankings
5. **Certificates** - Award certificates for topic completion
6. **Analytics Dashboard** - Detailed performance analytics
7. **Practice Mode** - Non-proctored practice for subtopics
8. **Timed Challenges** - Speed-based subtopic tests

### Admin Features (TODO)
1. Bulk question-to-subtopic assignment
2. Subtopic management UI
3. Question distribution analytics
4. User progress reports

## Testing

### Manual Testing Checklist
- [ ] Navigate from Topics to Subtopics
- [ ] Start a subtopic test
- [ ] Submit test and view results
- [ ] Retry a subtopic
- [ ] Complete all subtopics and view summary
- [ ] Check progress persistence
- [ ] Verify proctoring works
- [ ] Test on mobile devices

### Test Data
Use the seed script to create sample data:
```bash
npx tsx prisma/seed.ts
```

## Troubleshooting

### Subtopics not showing
- Verify subtopics exist in database for the test
- Run create-subtopics script
- Check API response in browser console

### Questions not loading
- Ensure questions have `subtopicId` set
- Check question count in subtopic
- Verify API endpoint returns data

### Progress not saving
- Check user authentication
- Verify database connection
- Check browser console for errors

## Architecture Notes

### Why Subtopics?
- Better organization of questions
- Focused practice on weak areas
- Progressive learning path
- Matches industry standard (IndiaBIX, etc.)

### Design Decisions
- Subtopics are optional (questions can exist without subtopics)
- Each subtopic test is independent
- Progress is tracked separately per subtopic
- Existing test functionality remains unchanged

### Performance Considerations
- Subtopics are loaded with question counts
- Progress is fetched in single query
- Results use optimistic UI updates
- Pagination may be needed for many subtopics

## Support

For issues or questions:
1. Check this documentation
2. Review API responses in browser console
3. Check database for data consistency
4. Review Prisma schema for relationships
