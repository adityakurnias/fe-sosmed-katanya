<script setup lang="ts">
import { ref, onMounted } from "vue";
import NavigationBar from "@/components/NavigationBar.vue";
import type { Attachment, User, Post, PostsResponse } from "@/types/main";

const user = ref(null);
const isLoading = ref(true);
const posts = ref<Post[]>([]);
const newPostContent = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const selectedFiles = ref<File[]>([]);
const filePreviews = ref<string[]>([]);
const ascending = ref(true);

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
  return `${import.meta.env.VITE_BASE_URL}/${path}`;
};

const fetchPosts = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ada");
    }

    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal memuat postingan");
    }

    const data: PostsResponse = await response.json();
    posts.value = data.posts;
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    errorMessage.value =
      error.message || "Terjadi kesalahan saat memuat postingan";
  } finally {
    isLoading.value = false;
  }
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    for (const file of input.files) {
      if (file.type.startsWith("image/")) {
        selectedFiles.value.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          filePreviews.value.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }
};

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  filePreviews.value.splice(index, 1);
};

const sortPosts = () => {
  posts.value.sort((a, b) => {
    const dateA: Date = new Date(a.created_at);
    const dateB: Date = new Date(b.created_at);
    return ascending.value
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
  ascending.value = !ascending.value;
};

const createPost = async () => {
  if (!newPostContent.value.trim() && selectedFiles.value.length === 0) {
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    const formData = new FormData();
    formData.append("caption", newPostContent.value);

    selectedFiles.value.forEach((file) => {
      formData.append("post_attachments[]", file);
    });

    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Gagal membuat postingan");
    }

    newPostContent.value = "";
    selectedFiles.value = [];
    filePreviews.value = [];

    await fetchPosts();
  } catch (error: any) {
    console.error("Error creating post:", error);
    errorMessage.value =
      error.message || "Terjadi kesalahan saat membuat postingan";
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    user.value = JSON.parse(userData);
  }

  fetchPosts();
});
</script>

<template>
  <div class="home-container">
    <NavigationBar />

    <section class="welcome-section">
      <h1>
        Selamat Datang,
        {{ user ? (user as unknown as User).full_name : "Pengguna" }}!
      </h1>
      <p class="welcome-text">
        Simple Social Media, Posting Posting Posting!!!!
      </p>
    </section>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button @click="fetchPosts" class="retry-btn">Coba Lagi</button>
    </div>

    <section class="create-post">
      <div class="post-form">
        <textarea
          v-model="newPostContent"
          placeholder="Apa yang Anda pikirkan?"
          rows="3"
          class="post-input"
        ></textarea>

        <div class="attachment-section">
          <div v-if="filePreviews.length > 0" class="file-preview-container">
            <div
              v-for="(preview, index) in filePreviews"
              :key="index"
              class="file-preview"
            >
              <img :src="preview" alt="Preview" class="preview-image" />
              <button
                @click="removeSelectedFile(index)"
                class="remove-file-btn"
              >
                ×
              </button>
            </div>
          </div>

          <div class="file-input-container">
            <label for="file-input" class="file-input-label">
              <span class="file-icon">📷</span>
              <span>Tambahkan Foto</span>
            </label>
            <input
              type="file"
              id="file-input"
              accept="image/*"
              multiple
              @change="handleFileChange"
              class="file-input"
            />
          </div>
        </div>

        <div class="post-actions">
          <button
            @click="createPost"
            :disabled="
              isSubmitting || (!newPostContent.trim() && !selectedFiles.length)
            "
            class="post-btn"
          >
            {{ isSubmitting ? "Memposting..." : "Posting" }}
          </button>
        </div>
      </div>
    </section>

    <section class="feed-section">
      <div class="feed-header">
        <h2>Postingan Terbaru</h2>
        <button @click="sortPosts">
          {{ ascending ? "Terlama" : "Terbaru" }}
        </button>
      </div>

      <div v-if="isLoading" class="loading">
        <p>Memuat postingan...</p>
      </div>

      <div v-else-if="posts.length === 0" class="empty-feed">
        <p>Belum ada postingan untuk ditampilkan.</p>
      </div>

      <div v-else class="posts-container">
        <div v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-header">
            <div class="user-info">
              <div class="user-avatar">
                {{ post.user.full_name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <strong class="post-author"
                  ><a :href="`/profile/${post.user.username}`">{{
                    post.user.full_name
                  }}</a></strong
                >
                <div class="post-username">@{{ post.user.username }}</div>
              </div>
            </div>
            <span class="post-time">{{ formatDate(post.created_at) }}</span>
          </div>

          <p class="post-content">{{ post.caption }}</p>

          <div
            v-if="post.attachments && post.attachments.length > 0"
            class="post-attachments"
          >
            <div
              v-for="attachment in post.attachments"
              :key="attachment.id"
              class="attachment-container"
            >
              <img
                :src="getImageUrl(attachment.storage_path)"
                :alt="`Attachment for post ${post.id}`"
                class="attachment-image"
                @error="(event: Event) => {
                  const target = event.target as HTMLImageElement;
                  target.style.display = 'none';
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

.welcome-section {
  text-align: center;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  color: white;
  margin-bottom: 0.5rem;
}

.welcome-text {
  color: whitesmoke;
  font-size: 1.1rem;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  background-color: #b91c1c;
  color: #222;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.create-post {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: #222;
  color: whitesmoke;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
}

.post-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.post-actions {
  display: flex;
  justify-content: flex-end;
}

.post-btn {
  background-color: #3b82f6;
  color: #222;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.post-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.post-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.feed-section {
  margin-top: 1rem;
}

.create-post,
.feed-section {
  max-width: 800px;
  width: 90%;
  margin-top: 2rem;
}

h2 {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1rem;
}

.loading,
.empty-feed {
  text-align: center;
  padding: 2rem;
  background-color: #222;
  min-width: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: whitesmoke;
}

.posts-container {
  display: flex;
  flex-direction: column;
  min-width: 100%;
  gap: 1rem;
}

.feed-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feed-header button {
  color: whitesmoke;
  background-color: #222;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
}

.post-card {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
  color: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
}

.post-author a {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  text-overflow: ellipsis;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  text-decoration: none;
}

.post-author a:hover {
  text-decoration: underline;
}

.post-username {
  color: whitesmoke;
  font-size: 0.875rem;
}

.post-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: whitesmoke;
  font-size: 0.875rem;
}

.post-content {
  margin: 0.5rem 0 1rem;
  line-height: 1.5;
}

.post-attachments {
  margin: 1rem 0;
}

.attachment-container {
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.attachment-image {
  width: 100%;
  max-height: 500px;
  border-radius: 8px;
  object-fit: contain;
}

.file-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #333;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-file-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.file-input-container {
  display: inline-block;
}

.file-input-label {
  background-color: #444;
  color: whitesmoke;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-input {
  display: none;
}

.file-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .home-container {
    min-width: 60%;
  }
}

@media (max-width: 480px) {
  .post-author a{
    max-width: 28vw;
  }
}
</style>
