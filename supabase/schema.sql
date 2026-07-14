-- ============================================
-- OborDahlan Database Schema for Supabase
-- Jalankan di SQL Editor Supabase
-- ============================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nim TEXT DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  initials TEXT NOT NULL,
  jurusan TEXT DEFAULT '',
  angkatan TEXT DEFAULT '',
  role TEXT DEFAULT 'mahasiswa',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 4. Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Follows (pengikut & mengikuti)
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 6. Lowongan (job listings)
CREATE TABLE IF NOT EXISTS lowongan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT NOT NULL,
  salary TEXT DEFAULT '',
  location TEXT DEFAULT '',
  type TEXT DEFAULT 'Full-time',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Conversation members
CREATE TABLE IF NOT EXISTS conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 7. Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_nim ON profiles(nim);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_lowongan_user_id ON lowongan(user_id);
CREATE INDEX IF NOT EXISTS idx_lowongan_created_at ON lowongan(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conv_id ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE lowongan ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: anyone can read, owner can create/delete
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Post likes: anyone can read, users can toggle their own
CREATE POLICY "Likes are viewable by everyone" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: anyone can read, owner can delete
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Follows: anyone can read, authenticated users can follow/unfollow
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Lowongan: anyone can read, authenticated users can create
CREATE POLICY "Lowongan are viewable by everyone" ON lowongan FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create lowongan" ON lowongan FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own lowongan" ON lowongan FOR DELETE USING (auth.uid() = user_id);

-- Conversations: members can view, anyone authenticated can create
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Members can view conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can add members" ON conversation_members;
DROP POLICY IF EXISTS "Members can view own membership" ON conversation_members;
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can send messages" ON messages;

CREATE POLICY "Authenticated users can create conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can view conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_members
      WHERE conversation_id = id
    )
  );

-- Conversation members: members can view, authenticated users can insert
CREATE POLICY "Authenticated users can add members" ON conversation_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can view own membership" ON conversation_members
  FOR SELECT USING (user_id = auth.uid());

-- Messages: conversation members can view/send
CREATE POLICY "Members can view messages" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM conversation_members
      WHERE conversation_id = messages.conversation_id
    )
  );
CREATE POLICY "Members can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT user_id FROM conversation_members
      WHERE conversation_id = messages.conversation_id
    )
  );

-- Notifications: owner can read/update, anyone authenticated can insert
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- ============================================
-- Function: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_nim TEXT;
  user_email TEXT;
  user_initials TEXT;
  user_role TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  user_nim := COALESCE(NEW.raw_user_meta_data->>'nim', '');
  user_email := COALESCE(NEW.email, '');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'mahasiswa');
  user_initials := UPPER(LEFT(user_name, 1));
  IF LENGTH(user_name) > 0 THEN
    user_initials := REGEXP_REPLACE(user_name, '(\S+)\s+(\S+).*', '\1\2');
    user_initials := UPPER(LEFT(user_initials, 2));
  END IF;

  INSERT INTO profiles (id, name, nim, email, initials, role)
  VALUES (NEW.id, user_name, user_nim, user_email, user_initials, user_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: call function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();