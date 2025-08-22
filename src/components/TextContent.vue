<template>
  <div 
    class="text-content chalk-text"
    :class="`color-${content.color}`"
    :style="textStyle"
  >
    {{ displayText }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextContent } from '@/types/scroll-item'
import { SCROLL_CONFIG } from '@/config/scroll.config'

interface Props {
  content: TextContent
}

const props = defineProps<Props>()

const displayText = computed(() => {
  // SCROLL_CONFIG から最大長を取得（ContentFactory.truncateText と統一）
  const maxLength = SCROLL_CONFIG.layout.maxTextLength
  if (props.content.text.length <= maxLength) {
    return props.content.text
  }
  return props.content.text.substring(0, maxLength) + '...'
})

const textStyle = computed(() => ({
  fontSize: `${String(props.content.fontSize)}em`
}))
</script>

<style scoped>
.text-content {
  position: relative;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  font-weight: bold;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.3s ease;
  user-select: none;
  
  
  /* Subpixel anti-aliasing無効化でGPU負荷軽減 */
  -webkit-font-smoothing: antialiased;
  
  /* Layer化ヒント */
  will-change: opacity;
}

.chalk-text {
  position: relative;
}

/* GPU最適化版カラーバリエーション（単一shadowに統合） */
.chalk-text.color-yellow {
  color: #ffe066;
  --shadow-color: rgba(255, 224, 102, 0.4);
  text-shadow: 0 0 8px var(--shadow-color);
}

.chalk-text.color-pink {
  color: #ff6b9d;
  --shadow-color: rgba(255, 107, 157, 0.4);
  text-shadow: 0 0 8px var(--shadow-color);
}

.chalk-text.color-blue {
  color: #4ecdc4;
  --shadow-color: rgba(78, 205, 196, 0.4);
  text-shadow: 0 0 8px var(--shadow-color);
}

.chalk-text.color-green {
  color: #95e77e;
  --shadow-color: rgba(149, 231, 126, 0.4);
  text-shadow: 0 0 8px var(--shadow-color);
}

.chalk-text.color-white {
  color: #ffffff;
  --shadow-color: rgba(255, 255, 255, 0.4);
  text-shadow: 0 0 8px var(--shadow-color);
}

/* 軽量なチョーク風エフェクト（シンプル化） */
.chalk-text::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.02);
  pointer-events: none;
  mix-blend-mode: soft-light;
}

/* ホバーエフェクト */
.text-content:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
  z-index: 100; /* TODO: SCROLL_CONFIG.layout.hoverZIndex 使用検討 */
}

/* アニメーション */
.text-content {
  animation: chalkWrite 0.5s ease;
}

@keyframes chalkWrite {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>