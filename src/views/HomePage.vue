<script setup lang="ts">
import router from "@/router";
import { ref, onMounted } from "vue";

interface Attachment {
  id: number;
  storage_path: string;
}

interface User {
  id: number;
  full_name: string;
  username: string;
  bio: string | null;
  is_private: boolean | null;
  created_at: string;
}

interface Post {
  id: number;
  caption: string;
  created_at: string;
  deleted_at: string | null;
  user: User;
  attachments: Attachment[];
}

interface PostsResponse {
  page: number;
  size: number;
  posts: Post[];
}

const user = ref(null);
const isLoading = ref(true);
const posts = ref<Post[]>([]);
const newPostContent = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const selectedFiles = ref<File[]>([]);
const filePreviews = ref<string[]>([]);

const formatDate = (dateString: string): string => {
  const dateObj = new Date(dateString);

  const tanggal = dateObj.getDate();
  const bulan = dateObj.getMonth() + 1;
  const tahun = dateObj.getFullYear();
  const jam = dateObj.getHours();
  const menit = dateObj.getMinutes();

  const tanggalFormat = `${tanggal < 10 ? "0" + tanggal : tanggal}-${
    bulan < 10 ? "0" + bulan : bulan
  }-${tahun} ${jam < 10 ? "0" + jam : jam}:${menit < 10 ? "0" + menit : menit}`;

  return tanggalFormat;
};

const getImageUrl = (path: string): string => {
  return `http://localhost:8000/storage/${path}`;
};

const fetchPosts = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ada");
    }

    const response = await fetch("http://localhost:8000/api/v1/posts", {
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
    errorMessage.value = error.message || "Terjadi kesalahan saat memuat postingan";
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

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};
const profile = () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    const user = JSON.parse(userData);
    router.push(`/profile/${user.username}`);
  }
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

    const response = await fetch("http://localhost:8000/api/v1/posts", {
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
    errorMessage.value = error.message || "Terjadi kesalahan saat membuat postingan";
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
    <section class="welcome-section">
      <h1>Selamat Datang, {{ user ? (user as unknown as User).full_name : "Pengguna" }}!</h1>
      <p class="welcome-text">Simple Social Media, Posting Posting Posting!!!!</p>
      <button class="logout" @click="logout">Logout</button>
      <button class="profile" @click="profile">Profile</button>
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
            <div v-for="(preview, index) in filePreviews" :key="index" class="file-preview">
              <img :src="preview" alt="Preview" class="preview-image" />
              <button @click="removeSelectedFile(index)" class="remove-file-btn">×</button>
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
            :disabled="isSubmitting || (!newPostContent.trim() && !selectedFiles.length)"
            class="post-btn"
          >
            {{ isSubmitting ? "Memposting..." : "Posting" }}
          </button>
        </div>
      </div>
    </section>

    <section class="feed-section">
      <h2>Postingan Terbaru</h2>

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
                  ><a :href="`/profile/${post.user.username}`">{{ post.user.full_name }}</a></strong
                >
                <div class="post-username">@{{ post.user.username }}</div>
              </div>
            </div>
            <span class="post-time">{{ formatDate(post.created_at) }}</span>
          </div>

          <p class="post-content">{{ post.caption }}</p>

          <div v-if="post.attachments && post.attachments.length > 0" class="post-attachments">
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
  max-width: 800px; /* Batasi lebar konten */
  width: 90%; /* Sesuaikan dengan lebar layar */
  margin-top: 2rem; /* Tambahkan margin atas */
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
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: whitesmoke;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  color: white;
  font-size: 1rem;
  display: block;
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

.logout {
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  margin-right: 0.2rem;
}

.profile {
  background-color: green;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  margin-left: 0.2rem;
}

.logout:hover {
  background-color: #b71c1c;
}
</style>
