-- Create UserRoles junction table
CREATE TABLE "UserRoles" (
    "userId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("userId", "rolId")
);

-- Add foreign keys
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing rolId data to UserRoles
INSERT INTO "UserRoles" ("userId", "rolId")
SELECT "id", "rolId" FROM "Users";

-- Remove old rolId column and its foreign key from Users
ALTER TABLE "Users" DROP CONSTRAINT "Users_rolId_fkey";
ALTER TABLE "Users" DROP COLUMN "rolId";
