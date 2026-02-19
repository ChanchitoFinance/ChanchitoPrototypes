-- Add NDA acceptance column to users (required for Terms+NDA acceptance flow)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nda_accepted BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN users.nda_accepted IS 'User has accepted the Confidentiality and Non-Disclosure Agreement (NDA).';
