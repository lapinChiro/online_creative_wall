<template>
  <div class="image-content" :class="[sizeClass, statusClass]">
    <div v-if="isLoading" class="loader">
      <div class="spinner"></div>
    </div>
    <img 
      v-if="!hasError"
      :src="content.url" 
      :alt="content.title"
      :title="content.title"
      loading="lazy"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    <div v-if="hasError" class="error-placeholder">
      <span>⚠️</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ImageContent } from '@/types/scroll-item'

interface Props {
  content: ImageContent
}

const props = defineProps<Props>()

const isLoading = ref(true)
const isLoaded = ref(false)
const hasError = ref(false)

const sizeClass = computed(() => `size-${props.content.size}`)
const statusClass = computed(() => {
  if (hasError.value) return 'error'
  if (isLoaded.value) return 'loaded'
  if (isLoading.value) return 'loading'
  return ''
})

const handleImageLoad = () => {
  isLoading.value = false
  isLoaded.value = true
}

const handleImageError = () => {
  isLoading.value = false
  hasError.value = true
}
</script>

<style scoped>
.image-content {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease;
}

.image-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-content.loading {
  background: rgba(255, 255, 255, 0.1);
}

.image-content.error {
  background: rgba(255, 0, 0, 0.1);
}

.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
}

/* サイズクラス */
.size-small {
  width: 100px;
  height: 100px;
}

.size-medium {
  width: 120px;
  height: 120px;
}

.size-large {
  width: 150px;
  height: 150px;
}

.size-xlarge {
  width: 180px;
  height: 180px;
}

/* ホバーエフェクト */
.image-content:hover {
  transform: scale(1.05);
  z-index: 100;
}

.image-content.loaded {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>