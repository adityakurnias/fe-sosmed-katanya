<script setup lang="ts">
import { ref, computed } from 'vue';
import followService from '@/services/followService';

const props = defineProps<{
  username: string;
  initialStatus?: 'following' | 'requested' | null;
}>();

const emit = defineEmits<{
  (e: 'statusChanged', status: 'following' | 'requested' | null): void;
}>();

const followStatus = ref(props.initialStatus);
const isLoading = ref(false);

const handleFollow = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    if (followStatus.value) {
      await followService.unfollowUser(props.username);
      followStatus.value = null;
    } else {
      const response = await followService.followUser(props.username);
      followStatus.value = response.status || 'following';
    }
    emit('statusChanged', followStatus.value);
  } catch (error: any) {
    console.error('Follow action failed:', error);
    alert(error.message);
  } finally {
    isLoading.value = false;
  }
};

const buttonClass = computed(() => followStatus.value ? 'following' : 'follow');
</script>

<template>
  <button 
    @click="handleFollow"
    :class="buttonClass"
    :disabled="isLoading"
  >
    <span v-if="isLoading">Processing...</span>
    <span v-else>
      {{ followStatus === 'following' ? 'Following' : 
         followStatus === 'requested' ? 'Requested' : 'Follow' }}
    </span>
  </button>
</template>

<style scoped>
button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
  cursor: pointer;
}

.following {
  background-color: #e5e7eb;
  color: #1f2937;
}

.following:hover {
  background-color: #d1d5db;
}

.follow {
  background-color: #3b82f6;
  color: white;
}

.follow:hover {
  background-color: #2563eb;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
