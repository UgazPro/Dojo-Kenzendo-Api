-- Add authorized column to AppliedStudents
ALTER TABLE "AppliedStudents" ADD COLUMN "authorized" BOOLEAN NOT NULL DEFAULT false;
