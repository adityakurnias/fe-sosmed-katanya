<template>
  <nav>
    <h2>Footgram.</h2>

    <div class="profile">
      <div
        @click="$router.push(`/profile/${user?.username}`)"
        class="user-avatar"
      >
        {{ user?.username.charAt(0).toUpperCase() }}
      </div>
      <a :href="`/profile/${user?.username}`" class="username">{{
        user?.username
      }}</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface User {
  id: number;
  full_name: string;
  username: string;
  bio: string | null;
  is_private: boolean | null;
}

const user = ref<User | null>(null);

onMounted(() => {
  const userData = localStorage.getItem("user");
  if (userData != null) {
    user.value = JSON.parse(userData);
  }
});
</script>

<style lang="css">
nav {
  top: 5px;
  width: 100%;
  padding: 0.5rem 1rem;
  margin-top: 10px;
  position: sticky;
  display: flex;
  place-items: center;
  justify-content: space-between;
  border-radius: 8px;
  background-color: #222;
  box-shadow: 0px 0px 10px 0px #00000052;
}

.profile {
  display: flex;
  place-items: center;
}

.username {
  color: whitesmoke;
  text-decoration: none;
  font-weight: bold;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #3b82f6;
  color: #222;
  display: flex;
  place-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  margin-right: 6px;
}
</style>
