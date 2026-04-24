export interface PostProfile {
  id: string;
  username: string;
  dog_name: string;
  breed: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface Post {
  id: string;
  profile_id: string;
  image_url: string;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface PostWithProfile extends Post {
  profile: PostProfile;
  is_liked: boolean;
  is_suggested?: boolean; // post from a profile the user doesn't follow
}

export interface Comment {
  id: string;
  post_id: string;
  profile_id: string;
  text: string;
  created_at: string;
  profile: PostProfile;
}
