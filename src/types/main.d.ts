export interface Attachment {
  id: number;
  storage_path: string;
}

interface User {
  id: number;
  username: string;
  full_name: string;
  bio: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  follow_status?: "following" | "requested" | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
  posts?: Post[];
}

export interface Post {
  id: number;
  caption: string;
  created_at: string;
  deleted_at: string | null;
  user: User;
  attachments: Attachment[];
}

export interface PostsResponse {
  page: number;
  size: number;
  posts: Post[];
}

interface FollowResponse {
  message: string;
  status?: 'following' | 'requested';
}