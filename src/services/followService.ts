import type { FollowResponse } from "@/types/main";

export default {
  async followUser(username: string): Promise<FollowResponse> {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/users/${username}/follow`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to follow user");
    }

    return response.json();
  },

  async unfollowUser(username: string): Promise<void> {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/users/${username}/unfollow`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to unfollow user");
    }
  },

  async getFollowing() {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/following", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get following list");
    }

    return response.json();
  },

  async getFollowers() {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/followers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get followers list");
    }

    return response.json();
  },
};
