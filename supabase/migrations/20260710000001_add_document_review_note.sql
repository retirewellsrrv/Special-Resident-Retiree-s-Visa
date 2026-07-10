-- Add review_note column for admin review comments on documents
ALTER TABLE documents ADD COLUMN review_note TEXT;

-- Add index for quick lookups by application
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
