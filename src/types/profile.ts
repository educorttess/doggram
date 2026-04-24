export interface Profile {
  id: string;
  owner_id: string;
  username: string;
  dog_name: string;
  breed: string | null;
  bio: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_verified: boolean;
  xp?: number;
  quiz_streak?: number;
  last_quiz_date?: string | null;
  created_at: string;
  updated_at: string;
}
