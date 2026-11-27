ALTER TABLE profiles ADD COLUMN search_text text;

CREATE INDEX ix_profiles__updated_at ON profiles (updated_at, id);
