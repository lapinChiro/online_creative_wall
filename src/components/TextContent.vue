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

interface Props {
  content: TextContent
}

const props = defineProps<Props>()

const displayText = computed(() => {
  // テキストが長すぎる場合は切り詰める
  const maxLength = 30
  if (props.content.text.length > maxLength) {
    return props.content.text.substring(0, maxLength) + '...'
  }
  return props.content.text
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
}

.chalk-text {
  position: relative;
}

.chalk-text::before {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  filter: blur(3px);
  opacity: 0.7;
}

/* カラーバリエーション */
.chalk-text.color-yellow {
  color: #ffe066;
  text-shadow: 
    2px 2px 4px rgba(255, 224, 102, 0.3),
    0 0 10px rgba(255, 224, 102, 0.2),
    0 0 20px rgba(255, 224, 102, 0.1);
}

.chalk-text.color-pink {
  color: #ff6b9d;
  text-shadow: 
    2px 2px 4px rgba(255, 107, 157, 0.3),
    0 0 10px rgba(255, 107, 157, 0.2),
    0 0 20px rgba(255, 107, 157, 0.1);
}

.chalk-text.color-blue {
  color: #4ecdc4;
  text-shadow: 
    2px 2px 4px rgba(78, 205, 196, 0.3),
    0 0 10px rgba(78, 205, 196, 0.2),
    0 0 20px rgba(78, 205, 196, 0.1);
}

.chalk-text.color-green {
  color: #95e77e;
  text-shadow: 
    2px 2px 4px rgba(149, 231, 126, 0.3),
    0 0 10px rgba(149, 231, 126, 0.2),
    0 0 20px rgba(149, 231, 126, 0.1);
}

.chalk-text.color-white {
  color: #ffffff;
  text-shadow: 
    2px 2px 4px rgba(255, 255, 255, 0.3),
    0 0 10px rgba(255, 255, 255, 0.2),
    0 0 20px rgba(255, 255, 255, 0.1);
}

/* チョークのテクスチャ風エフェクト */
.chalk-text::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.03) 2px,
      rgba(255, 255, 255, 0.03) 4px
    );
  pointer-events: none;
}

/* ホバーエフェクト */
.text-content:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
  z-index: 100;
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