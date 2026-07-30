-- Add AprobadoConPenalizacion to ExamStatus enum
DO $$ BEGIN
    CREATE TYPE "ExamStatus" AS ENUM ('Pendiente', 'Aprobado', 'Reprobado', 'AprobadoConPenalizacion');
EXCEPTION
    WHEN duplicate_object THEN
        BEGIN
            EXECUTE 'ALTER TYPE "ExamStatus" ADD VALUE ''AprobadoConPenalizacion''';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
END $$;

-- Add columns to AppliedStudents
ALTER TABLE "AppliedStudents" ADD COLUMN IF NOT EXISTS "exceptionMonths" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AppliedStudents" ADD COLUMN IF NOT EXISTS "customRankId" INTEGER;
ALTER TABLE "AppliedStudents" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "AppliedStudents" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);

-- Add penalizedUntil to UserRanks
ALTER TABLE "UserRanks" ADD COLUMN IF NOT EXISTS "penalizedUntil" TIMESTAMP(3);
