-- AlterTable: Make Document.content nullable (for folders)
ALTER TABLE "Document" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable: Add sharing and folder fields to Document
ALTER TABLE "Document" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Document" ADD COLUMN "shareToken" TEXT;
ALTER TABLE "Document" ADD COLUMN "isFolder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Document" ADD COLUMN "parentId" INTEGER;

-- CreateIndex: Unique constraint on shareToken
CREATE UNIQUE INDEX "Document_shareToken_key" ON "Document"("shareToken");

-- AddForeignKey: Self-referencing relation for folder tree
ALTER TABLE "Document" ADD CONSTRAINT "Document_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: DocumentShare
CREATE TABLE "DocumentShare" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on documentId + userId
CREATE UNIQUE INDEX "DocumentShare_documentId_userId_key" ON "DocumentShare"("documentId", "userId");

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;