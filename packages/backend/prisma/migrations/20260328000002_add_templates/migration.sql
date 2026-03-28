-- Create Template table
CREATE TABLE "Template" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "content" JSONB NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "ownerId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);