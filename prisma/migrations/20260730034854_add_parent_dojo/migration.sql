-- Add parentDojoId to Dojos for hierarchical relationship
ALTER TABLE "Dojos" ADD COLUMN "parentDojoId" INTEGER;

-- Add foreign key constraint
ALTER TABLE "Dojos" ADD CONSTRAINT "Dojos_parentDojoId_fkey"
    FOREIGN KEY ("parentDojoId") REFERENCES "Dojos"(id) ON DELETE SET NULL ON UPDATE CASCADE;
