-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubtopicProgress" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubtopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subtopic_testId_idx" ON "Subtopic"("testId");

-- CreateIndex
CREATE INDEX "Question_subtopicId_idx" ON "Question"("subtopicId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubtopicProgress_userId_subtopicId_key" ON "UserSubtopicProgress"("userId", "subtopicId");

-- CreateIndex
CREATE INDEX "UserSubtopicProgress_userId_idx" ON "UserSubtopicProgress"("userId");

-- CreateIndex
CREATE INDEX "UserSubtopicProgress_subtopicId_idx" ON "UserSubtopicProgress"("subtopicId");

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubtopicProgress" ADD CONSTRAINT "UserSubtopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubtopicProgress" ADD CONSTRAINT "UserSubtopicProgress_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add subtopicId column to Question table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Question' AND column_name='subtopicId') THEN
        ALTER TABLE "Question" ADD COLUMN "subtopicId" TEXT;
    END IF;
END $$;
