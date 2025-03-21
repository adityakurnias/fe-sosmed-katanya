<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const fullName = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const register = async () => {
  errorMessage.value = "";

  if (!fullName.value || !username.value || !password.value) {
    errorMessage.value = "Semua field harus diisi";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Password tidak cocok";
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = "Password minimal 6 karakter";
    return;
  }

  isLoading.value = true;

  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.value,
        username: username.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registrasi gagal");
    }

    const loginResponse = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(loginData.message || "Auto login gagal");
    }

    localStorage.setItem("token", loginData.token);
    localStorage.setItem("user", JSON.stringify(loginData.user));

    router.push("/");
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <h2>Daftar Akun</h2>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="register" class="auth-form">
      <div class="form-group">
        <label for="fullName">Nama Lengkap</label>
        <input
          type="text"
          id="fullName"
          v-model="fullName"
          placeholder="Masukkan nama lengkap"
          required
        />
      </div>

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

      <div class="form-group">
        <label for="confirmPassword">Konfirmasi Password</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="Konfirmasi password"
          required
        />
      </div>

      <button type="submit" :disabled="isLoading" class="submit-button">
        {{ isLoading ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="auth-switch">
      Sudah punya akun? <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<style scoped>
.auth-container {
  width: 400px;
  margin: 2rem auto;
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
  color: whitesmoke;
  background-color: #222;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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

@media (max-width: 768px) {
  .auth-container {
    width: 90%;
  }
}
</style>
