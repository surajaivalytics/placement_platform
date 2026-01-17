# Task: Refine Mock Test Experience & Add Loaders

## Status
- [ ] Align "Enter Exam Hall" buttons in Mock Tests Dashboard
- [ ] Implement Eligibility Check Logic
- [ ] Update Mock Tests Page to reflect Eligibility Status
- [ ] Add Loading states for Interview Suite & Voice Assessment

## Context
The user wants to improve the visual consistency of the Mock Test cards (aligning buttons) and enforce strict eligibility criteria before allowing users to take tests. Additionally, loaders are requested for better UX during navigation.

## Implementation Details

### 1. UI Alignment
- **Target File**: `src/app/(dashboard)/dashboard/mock-tests/page.tsx`
- **Change**: Apply `flex flex-col` to the Card component and ensure `CardFooter` (or the button container) is pushed to the bottom using `mt-auto`. Ensure all cards have the same height.

### 2. Eligibility Logic
- **Target File**: `src/app/actions/placement.ts`
- **Logic**:
  - `checkEligibility(company)` function.
  - **TCS Criteria** (Example): 60% in 10th, 12th, Grad. No active backlogs. Gap <= 2 years.
  - **Wipro Criteria** (Example): 60% in 10th, 12th. 6.0 CGPA. Gap <= 3 years.
  - Returns `{ isEligible: boolean, reason?: string }`.

### 3. Update Mock Test Page
- **Target File**: `src/app/(dashboard)/dashboard/mock-tests/page.tsx`
- **Change**:
  - Fetch user eligibility status for each company server-side.
  - If eligible -> Show "Enter Exam Hall".
  - If not eligible -> Show "Not Eligible" (disabled) with a tooltip explaining why.

### 4. Loaders
- **Target Files**:
  - `src/app/(dashboard)/dashboard/interview-suite/loading.tsx`
  - `src/app/(dashboard)/dashboard/voice-assessment/loading.tsx`
- **Content**: Use a standard, clean loader matching the app's design (e.g., `Loader2` from lucide-react or a custom skeleton).

## Verification
- visual check of button alignment.
- Modify database mock user data to test eligible vs ineligible states.
- Navigate to Interview Suite to see the loader.
