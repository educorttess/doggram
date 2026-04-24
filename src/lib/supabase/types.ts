// Doggram database types — run `pnpm db:generate` to regenerate from Supabase.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          username: string;
          dog_name: string;
          breed?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          username?: string;
          dog_name?: string;
          breed?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          profile_id: string;
          image_url: string;
          caption: string | null;
          likes_count: number;
          comments_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          image_url: string;
          caption?: string | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          image_url?: string;
          caption?: string | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          profile_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          profile_id: string;
          post_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          post_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          post_id?: string;
          text?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          profile_id: string;
          image_url: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          image_url: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          image_url?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string;
          type: "like" | "comment" | "follow" | "mention";
          post_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id: string;
          type: "like" | "comment" | "follow" | "mention";
          post_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          actor_id?: string;
          type?: "like" | "comment" | "follow" | "mention";
          post_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          profile_id: string;
        };
        Insert: {
          conversation_id: string;
          profile_id: string;
        };
        Update: {
          conversation_id?: string;
          profile_id?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          text?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
