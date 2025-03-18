<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const rememberMe = ref(false);

const login = async () => {
  errorMessage.value = "";

  if (!username.value || !password.value) {
    errorMessage.value = "Username dan password harus diisi";
    return;
  }

  isLoading.value = true;

  try {
    const response = await fetch("http://localhost:8000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login gagal");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (rememberMe.value) {
      localStorage.setItem("rememberedUsername", username.value);
    } else {
      localStorage.removeItem("rememberedUsername");
    }

    router.push("/");
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const savedUsername = localStorage.getItem("rememberedUsername");
if (savedUsername) {
  username.value = savedUsername;
  rememberMe.value = true;
}
</script>

<template>
  <div class="auth-container">
    <h2>Login</h2>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="login" class="auth-form">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="Masukkan username"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Masukkan password"
          required
        />
      </div>

      <label class="remember-me">
        <input type="checkbox" v-model="rememberMe" />
        <span>Ingat saya</span>
      </label>

      <button type="submit" :disabled="isLoading" class="submit-button">
        {{ isLoading ? "Memproses..." : "Login" }}
      </button>
    </form>

    <p class="auth-switch">Belum punya akun? <router-link to="/register">Daftar</router-link></p>
  </div>
</template>

<style scoped>
.auth-container {
  margin: 2rem auto;
  width: 400px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  background-color: #222;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

label {
  font-weight: 600;
  font-size: 0.9rem;
  color: whitesmoke;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #222;
  color: whitesmoke;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

input[type="checkbox"] {
  cursor: pointer;
  width: fit-content;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
}

.forgot-password {
  font-size: 0.9rem;
  color: #3b82f6;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: left;
  font-size: 0.9rem;
}

.auth-switch {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.auth-switch a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.auth-switch a:hover {
  text-decoration: underline;
}
</style>
