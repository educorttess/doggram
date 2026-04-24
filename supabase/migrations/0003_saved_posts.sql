-- Saved posts (bookmarks)
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, post_id)
);

ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read their saved posts"
  ON saved_posts FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Owners can save posts"
  ON saved_posts FOR INSERT
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Owners can unsave posts"
  ON saved_posts FOR DELETE
  USING (profile_id IN (
    SELECT id FROM profiles WHERE owner_id = auth.uid()
  ));
