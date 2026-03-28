-- Add full-text search vector column with GIN index and auto-update trigger
-- This enables efficient full-text search on document titles and content

-- 1. Add the search_vector column
ALTER TABLE "Document" ADD COLUMN "searchVector" TSVECTOR;

-- 2. Create GIN index for fast full-text search
CREATE INDEX "Document_searchVector_idx" ON "Document" USING GIN ("searchVector");

-- 3. Function to update search vector
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract text content from JSON (Tiptap content structure)
  -- This recursively extracts all text nodes from the Tiptap JSON content
  NEW."searchVector" :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.content::text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to auto-update search vector on insert/update
CREATE TRIGGER document_search_vector_update
  BEFORE INSERT OR UPDATE OF title, content ON "Document"
  FOR EACH ROW
  EXECUTE FUNCTION update_document_search_vector();

-- 5. Backfill existing documents with search vectors
UPDATE "Document" SET "searchVector" =
  setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(content::text, '')), 'B')
WHERE "searchVector" IS NULL;
