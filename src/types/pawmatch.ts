export interface PawMatchProfile {
  id: string;
  username: string;
  dog_name: string;
  breed: string | null;
  bio: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  is_verified: boolean;
}

export interface PawMatchRecord {
  id: string;
  profile_a_id: string;
  profile_b_id: string;
  created_at: string;
  matched_profile: PawMatchProfile;
}
