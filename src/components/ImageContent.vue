<template>
  <div
    class="image-content"
    :class="[statusClass]"
    :style="dynamicSizeStyle"
  >
    <div
      v-if="isLoading"
      class="loader"
    >
      <div class="spinner" />
    </div>
    <img 
      v-if="!hasError"
      :src="content.url" 
      :alt="content.title"
      :title="content.title"
      loading="lazy"
      crossorigin="anonymous"
      @load="handleImageLoad"
      @error="handleImageError"
    >
    <div
      v-if="hasError"
      class="error-placeholder"
    >
      <span>⚠️</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ImageContent } from '@/types/scroll-item'
import { SCROLL_CONFIG } from '@/config/scroll.config'

interface Props {
  content: ImageContent
}

const props = defineProps<Props>()

const isLoading = ref(true)
const isLoaded = ref(false)
const hasError = ref(false)

const statusClass = computed(() => {
  if (hasError.value) {return 'error'}
  if (isLoaded.value) {return 'loaded'}
  if (isLoading.value) {return 'loading'}
  return ''
})

const dynamicSizeStyle = computed(() => {
  const size = SCROLL_CONFIG.sizes.image[props.content.size]
  return {
    width: `${String(size.width)}px`,
    height: `${String(size.height)}px`
  }
})

const handleImageLoad = (): void => {
  isLoading.value = false
  isLoaded.value = true
}

const handleImageError = (): void => {
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
  
  /* GPU最適化 */
  will-change: transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  
  /* Containment API */
  contain: layout style paint;
}

.image-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  
  /* 画像のレンダリング最適化 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
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

/* サイズはdynamicSizeStyleで動的設定されるため、CSS定義不要 */

/* ホバーエフェクト */
.image-content:hover {
  transform: scale(1.05);
  z-index: 100; /* TODO: SCROLL_CONFIG.layout.hoverZIndex 使用検討 */
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