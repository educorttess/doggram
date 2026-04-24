-- ============================================================
-- Doggram — Initial Schema
-- ============================================================

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  dog_name TEXT NOT NULL,
  breed TEXT,
  bio TEXT,
  avatar_url TEXT,
  birth_date DATE,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, post_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations & Messages
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "profiles_owner_update" ON profiles FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "profiles_owner_delete" ON profiles FOR DELETE USING (auth.uid() = owner_id);

-- Posts: public read, profile owner write
CREATE POLICY "posts_public_read" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_owner_insert" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);
CREATE POLICY "posts_owner_delete" ON posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);

-- Likes: public read, authenticated write
CREATE POLICY "likes_public_read" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_owner_insert" ON likes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);
CREATE POLICY "likes_owner_delete" ON likes FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);

-- Comments: public read, authenticated write
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_owner_insert" ON comments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);
CREATE POLICY "comments_owner_delete" ON comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);

-- Follows: public read, authenticated write
CREATE POLICY "follows_public_read" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_owner_insert" ON follows FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = follower_id AND owner_id = auth.uid())
);
CREATE POLICY "follows_owner_delete" ON follows FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = follower_id AND owner_id = auth.uid())
);

-- Stories: public read, owner write
CREATE POLICY "stories_public_read" ON stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "stories_owner_insert" ON stories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);
CREATE POLICY "stories_owner_delete" ON stories FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND owner_id = auth.uid())
);

-- Notifications: recipient read only
CREATE POLICY "notifications_recipient_read" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = recipient_id AND owner_id = auth.uid())
);

-- Messages: members only
CREATE POLICY "messages_member_read" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = messages.conversation_id
      AND profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  )
);
CREATE POLICY "messages_member_insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = messages.conversation_id
      AND profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  )
);
