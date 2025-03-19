<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import FollowButton from "@/components/FollowButton.vue";
import type { Attachment, User, Post, PostsResponse } from "@/types/main";

const route = useRoute();
const router = useRouter();
const user = ref<User | null>(null);
const isLoading = ref(true);
const error = ref("");
const currentUser = ref<any>(null);

const fetchUserProfile = async () => {
  const username = route.params.username as string;
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  try {
    const response = await fetch(`/api/users/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user profile");
    }

    const data = await response.json();
    user.value = data.user;
  } catch (err: any) {
    console.error("Error fetching profile:", err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const handleFollowStatusChange = (status: "following" | "requested" | null) => {
  if (user.value) {
    user.value.follow_status = status;
    fetchUserProfile();
  }
};

const formatDate = (dateString: string): string => {
  const dateObj: Date = new Date(dateString);
  const options: Object = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

const getImageUrl = (path: string): string => {
  return `/storage/${path}`;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};

onMounted(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    currentUser.value = JSON.parse(userData);
  }

  fetchUserProfile();
});
</script>

<template>
  <div class="profile-container">
    <div class="header-section">
      <a @click="router.push('/')" class="back-button"> ← Kembali </a>
      <button class="logout" @click="logout">Logout</button>
    </div>

    <div v-if="isLoading" class="loading-container">
      <p>Loading profile...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchUserProfile" class="retry-button">Coba Lagi</button>
    </div>

    <div v-else-if="user" class="profile-content">
      <div class="profile-header">
        <div class="profile-info">
          <div class="avatar">{{ user.full_name.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <h2>{{ user.full_name }}</h2>
            <p class="username">@{{ user.username }}</p>
            <p v-if="user.bio" class="bio">{{ user.bio }}</p>
            <p v-if="user.is_private" class="private-badge">Private Account</p>
          </div>
        </div>

        <div
          v-if="currentUser && currentUser.username !== user.username"
          class="follow-container"
        >
          <FollowButton
            :username="user.username"
            :initial-status="user.follow_status"
            @status-changed="handleFollowStatusChange"
          />
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-value">{{ user.posts_count }}</span>
          <span class="stat-label">Posts</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ user.followers_count }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ user.following_count }}</span>
          <span class="stat-label">Following</span>
        </div>
      </div>

      <div v-if="user.posts && user.posts.length > 0" class="posts-section">
        <h3>Posts</h3>
        <div class="posts-grid">
          <div v-for="post in user.posts" :key="post.id" class="post-card">
            <div class="post-header">
              <span class="post-date">{{ formatDate(post.created_at) }}</span>
            </div>
            <p class="post-caption">{{ post.caption }}</p>
            <div
              v-if="post.attachments && post.attachments.length > 0"
              class="post-attachments"
            >
              <div
                v-for="attachment in post.attachments"
                :key="attachment.id"
                class="attachment"
              >
                <img
                  :src="getImageUrl(attachment.storage_path)"
                  :alt="`Attachment for post ${post.id}`"
                  @error="(event) => { (event.target as HTMLImageElement).style.display = 'none' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="
          user.is_private &&
          user.follow_status !== 'following' &&
          currentUser.username !== user.username
        "
        class="private-message"
      >
        <p>
          Akun ini private. Anda perlu mengikuti user ini untuk melihat
          postingannya.
        </p>
      </div>

      <div
        v-else-if="user.posts && user.posts.length === 0"
        class="empty-posts"
      >
        <p>Belum ada postingan.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  color: white;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.back-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
}

.loading-container,
.error-container {
  background-color: #222;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-top: 1rem;
}

.error-container {
  color: #ef4444;
}

.retry-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
}

.profile-content {
  background-color: #222;
  border-radius: 8px;
  padding: 1.5rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.profile-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  background-color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-right: 1rem;
}

.user-details h2 {
  font-size: 1.5rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0 0 0.25rem 0;
}

.username {
  color: #9ca3af;
  margin: 0 0 0.5rem 0;
}

.bio {
  margin: 0.5rem 0;
}

.private-badge {
  display: inline-block;
  background-color: #4b5563;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  background-color: #2d3748;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.875rem;
  color: #9ca3af;
}

.posts-section h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 1rem;
}

.post-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.post-date {
  font-size: 0.875rem;
  color: #9ca3af;
}

.post-caption {
  margin-bottom: 1rem;
}

.post-attachments {
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.attachment img {
  width: 100%;
  max-height: 500px;
  border-radius: 8px;
  object-fit: contain;
}

.private-message,
.empty-posts {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
}

.logout {
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.logout:hover {
  background-color: #b71c1c;
}

@media (max-width: 480px) {
  .user-details h2{
    max-width: 30vw;
  }
}
</style>
