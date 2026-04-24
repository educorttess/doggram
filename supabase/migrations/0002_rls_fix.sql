-- ============================================================
-- Doggram — RLS Policy Fix
-- Run this in the Supabase Dashboard → SQL Editor if profiles
-- are not being read/written correctly.
-- ============================================================

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "profiles_public_read"  ON profiles;
DROP POLICY IF EXISTS "profiles_owner_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_update" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_delete" ON profiles;

DROP POLICY IF EXISTS "posts_public_read"   ON posts;
DROP POLICY IF EXISTS "posts_owner_insert"  ON posts;
DROP POLICY IF EXISTS "posts_owner_delete"  ON posts;

DROP POLICY IF EXISTS "likes_public_read"   ON likes;
DROP POLICY IF EXISTS "likes_owner_insert"  ON likes;
DROP POLICY IF EXISTS "likes_owner_delete"  ON likes;

DROP POLICY IF EXISTS "comments_public_read"  ON comments;
DROP POLICY IF EXISTS "comments_owner_insert" ON comments;
DROP POLICY IF EXISTS "comments_owner_delete" ON comments;

DROP POLICY IF EXISTS "follows_public_read"   ON follows;
DROP POLICY IF EXISTS "follows_owner_insert"  ON follows;
DROP POLICY IF EXISTS "follows_owner_delete"  ON follows;

DROP POLICY IF EXISTS "stories_public_read"   ON stories;
DROP POLICY IF EXISTS "stories_owner_insert"  ON stories;
DROP POLICY IF EXISTS "stories_owner_delete"  ON stories;

-- Make sure RLS is enabled on all tables
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────────
-- Anyone can read any profile (public social network)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "profiles_owner_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owner can update their own profile
CREATE POLICY "profiles_owner_update" ON profiles
  FOR UPDATE USING (auth.uid() = owner_id);

-- Owner can delete their own profile
CREATE POLICY "profiles_owner_delete" ON profiles
  FOR DELETE USING (auth.uid() = owner_id);

-- ── Posts ──────────────────────────────────────────────────────
CREATE POLICY "posts_public_read" ON posts
  FOR SELECT USING (true);

CREATE POLICY "posts_owner_insert" ON posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

CREATE POLICY "posts_owner_delete" ON posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

-- ── Likes ──────────────────────────────────────────────────────
CREATE POLICY "likes_public_read" ON likes
  FOR SELECT USING (true);

CREATE POLICY "likes_owner_insert" ON likes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

CREATE POLICY "likes_owner_delete" ON likes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

-- ── Comments ───────────────────────────────────────────────────
CREATE POLICY "comments_public_read" ON comments
  FOR SELECT USING (true);

CREATE POLICY "comments_owner_insert" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

CREATE POLICY "comments_owner_delete" ON comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

-- ── Follows ────────────────────────────────────────────────────
CREATE POLICY "follows_public_read" ON follows
  FOR SELECT USING (true);

CREATE POLICY "follows_owner_insert" ON follows
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = follower_id AND owner_id = auth.uid())
  );

CREATE POLICY "follows_owner_delete" ON follows
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = follower_id AND owner_id = auth.uid())
  );

-- ── Stories ────────────────────────────────────────────────────
CREATE POLICY "stories_public_read" ON stories
  FOR SELECT USING (expires_at > NOW());

CREATE POLICY "stories_owner_insert" ON stories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

CREATE POLICY "stories_owner_delete" ON stories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
  );

-- ── Notifications ──────────────────────────────────────────────
CREATE POLICY "notifications_recipient_read" ON notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = recipient_id AND owner_id = auth.uid())
  );

-- ── Messages ───────────────────────────────────────────────────
CREATE POLICY "messages_member_read" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members cm
      JOIN profiles p ON p.id = cm.profile_id
      WHERE cm.conversation_id = messages.conversation_id
        AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "messages_member_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_members cm
      JOIN profiles p ON p.id = cm.profile_id
      WHERE cm.conversation_id = messages.conversation_id
        AND p.owner_id = auth.uid()
    )
  );

-- ── Verify policies were created ──────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'posts', 'likes', 'comments', 'follows')
ORDER BY tablename, cmd;
