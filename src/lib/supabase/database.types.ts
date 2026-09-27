/**
 * Auto-generated Supabase database types for Midigo.
 *
 * To regenerate after schema changes, run:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/lib/supabase/database.types.ts
 *
 * Or install the Supabase CLI: https://supabase.com/docs/guides/cli
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          handle: string | null;
          avatar_url: string | null;
          role: "fan" | "chatter" | "moderator" | "editor" | "administrator";
          membership: "free" | "standard" | "vip" | "founding" | "lifetime";
          status: "active" | "pending" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          handle?: string | null;
          avatar_url?: string | null;
          role?: "fan" | "chatter" | "moderator" | "editor" | "administrator";
          membership?: "free" | "standard" | "vip" | "founding" | "lifetime";
          status?: "active" | "pending" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          handle?: string | null;
          avatar_url?: string | null;
          role?: "fan" | "chatter" | "moderator" | "editor" | "administrator";
          membership?: "free" | "standard" | "vip" | "founding" | "lifetime";
          status?: "active" | "pending" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fans: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          handle: string;
          membership: string;
          engagement: "low" | "medium" | "high" | "very_high";
          status: "active" | "vip" | "at_risk" | "churned";
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          name: string;
          handle: string;
          membership?: string;
          engagement?: "low" | "medium" | "high" | "very_high";
          status?: "active" | "vip" | "at_risk" | "churned";
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          name?: string;
          handle?: string;
          membership?: string;
          engagement?: "low" | "medium" | "high" | "very_high";
          status?: "active" | "vip" | "at_risk" | "churned";
          joined_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      chatters: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          queue: string;
          presence: "online" | "away" | "offline";
          active_conversations: number;
          avg_response_time: string | null;
          status: "available" | "busy" | "offline";
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          name: string;
          queue?: string;
          presence?: "online" | "away" | "offline";
          active_conversations?: number;
          avg_response_time?: string | null;
          status?: "available" | "busy" | "offline";
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          name?: string;
          queue?: string;
          presence?: "online" | "away" | "offline";
          active_conversations?: number;
          avg_response_time?: string | null;
          status?: "available" | "busy" | "offline";
          created_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          title: string;
          category: string;
          storage_path: string | null;
          visibility: "public" | "members" | "vip";
          status: "published" | "draft" | "locked";
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string;
          storage_path?: string | null;
          visibility?: "public" | "members" | "vip";
          status?: "published" | "draft" | "locked";
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          storage_path?: string | null;
          visibility?: "public" | "members" | "vip";
          status?: "published" | "draft" | "locked";
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      live_rooms: {
        Row: {
          id: string;
          title: string;
          host: string;
          max_participants: number | null;
          current_participants: number;
          status: "live" | "upcoming" | "ended";
          scheduled_at: string | null;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          host?: string;
          max_participants?: number | null;
          current_participants?: number;
          status?: "live" | "upcoming" | "ended";
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          host?: string;
          max_participants?: number | null;
          current_participants?: number;
          status?: "live" | "upcoming" | "ended";
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      live_room_participants: {
        Row: {
          room_id: string;
          profile_id: string;
          joined_at: string;
        };
        Insert: {
          room_id: string;
          profile_id: string;
          joined_at?: string;
        };
        Update: {
          room_id?: string;
          profile_id?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          fan_id: string | null;
          fan_name: string;
          subject: string;
          assignee_id: string | null;
          assignee_name: string;
          message_count: number;
          status: "open" | "waiting" | "resolved";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fan_id?: string | null;
          fan_name: string;
          subject: string;
          assignee_id?: string | null;
          assignee_name?: string;
          message_count?: number;
          status?: "open" | "waiting" | "resolved";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fan_id?: string | null;
          fan_name?: string;
          subject?: string;
          assignee_id?: string | null;
          assignee_name?: string;
          message_count?: number;
          status?: "open" | "waiting" | "resolved";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          live_room_id: string | null;
          sender_id: string | null;
          sender_name: string;
          sender: "midigo" | "fan" | "chatter";
          type: "text" | "voice";
          content: string | null;
          voice_duration: string | null;
          voice_storage_path: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          live_room_id?: string | null;
          sender_id?: string | null;
          sender_name?: string;
          sender: "midigo" | "fan" | "chatter";
          type?: "text" | "voice";
          content?: string | null;
          voice_duration?: string | null;
          voice_storage_path?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string | null;
          live_room_id?: string | null;
          sender_id?: string | null;
          sender_name?: string;
          sender?: "midigo" | "fan" | "chatter";
          type?: "text" | "voice";
          content?: string | null;
          voice_duration?: string | null;
          voice_storage_path?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      content_articles: {
        Row: {
          id: string;
          title: string;
          type: string;
          category: string;
          status: "published" | "draft" | "scheduled";
          author_id: string | null;
          author_name: string;
          body: string | null;
          scheduled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type?: string;
          category?: string;
          status?: "published" | "draft" | "scheduled";
          author_id?: string | null;
          author_name?: string;
          body?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: string;
          category?: string;
          status?: "published" | "draft" | "scheduled";
          author_id?: string | null;
          author_name?: string;
          body?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          fan_id: string | null;
          member_name: string;
          plan: string;
          amount_cents: number;
          currency: string;
          status: "active" | "past_due" | "cancelled" | "refunded";
          renewal_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fan_id?: string | null;
          member_name: string;
          plan: string;
          amount_cents?: number;
          currency?: string;
          status?: "active" | "past_due" | "cancelled" | "refunded";
          renewal_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fan_id?: string | null;
          member_name?: string;
          plan?: string;
          amount_cents?: number;
          currency?: string;
          status?: "active" | "past_due" | "cancelled" | "refunded";
          renewal_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      moderation_cases: {
        Row: {
          id: string;
          target: string;
          reason: string;
          severity: "low" | "medium" | "high";
          status: "open" | "in_review" | "resolved";
          reporter: string;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          target: string;
          reason: string;
          severity?: "low" | "medium" | "high";
          status?: "open" | "in_review" | "resolved";
          reporter?: string;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          target?: string;
          reason?: string;
          severity?: "low" | "medium" | "high";
          status?: "open" | "in_review" | "resolved";
          reporter?: string;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          actor: string;
          action: string;
          target: string;
          outcome: "success" | "denied" | "warning";
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor: string;
          action: string;
          target: string;
          outcome?: "success" | "denied" | "warning";
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor?: string;
          action?: string;
          target?: string;
          outcome?: "success" | "denied" | "warning";
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string;
          member_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          member_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          member_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      join_live_room: {
        Args: { target_room_id: string };
        Returns: number;
      };
      leave_live_room: {
        Args: { target_room_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
  };
}
