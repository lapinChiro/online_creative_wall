<template>
  <div
    ref="itemRef"
    class="scroll-item"
    :class="{ focused: isFocused }"
    :style="cssVars"
    :data-item-id="item.id"
    :data-visible="isVisible"
    @click="handleClick"
  >
    <ImageContent
      v-if="item.type === 'image'"
      :content="item.content as ImageContentType"
    />
    <TextContent
      v-else
      :content="item.content as TextContentType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ScrollItem } from '@/types/scroll-item'
import type { ImageContent as ImageContentType, TextContent as TextContentType } from '@/types/scroll-item'
import ImageContent from './ImageContent.vue'
import TextContent from './TextContent.vue'

interface Props {
  item: ScrollItem
}

interface Emits {
  (e: 'click' | 'wrap-around' | 'remove', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const itemRef = ref<HTMLElement | null>(null)
const isFocused = ref(false)
const isVisible = ref(true)

// CSS Variables使用（文字列変換最小化）
const cssVars = computed(() => ({
  '--x': props.item.position.x,
  '--y': props.item.position.y,
  '--r': props.item.rotation,
  '--z': props.item.zIndex
}))

// 位置変更の監視（画面外判定用）
watch(() => props.item.position.x, (newX) => {
  if (itemRef.value !== null) {
    const width = itemRef.value.offsetWidth
    if (newX < -width) {
      emit('wrap-around', props.item.id)
    }
    
    // ビューポート内判定
    const viewportWidth = window.innerWidth
    isVisible.value = newX > -width && newX < viewportWidth
  }
})

// マウスイベント
const handleClick = (): void => {
  isFocused.value = true
  emit('click', props.item.id)
  
  // フォーカス解除
  setTimeout(() => {
    isFocused.value = false
  }, 300)
}

</script>

<style scoped>
.scroll-item {
  position: absolute;
  /* GPU合成レイヤー強制 */
  will-change: transform;
  transform: translate3d(
    calc(var(--x) * 1px), 
    calc(var(--y) * 1px), 
    0
  ) rotate(calc(var(--r) * 1deg));
  z-index: var(--z);
  
  /* Containment API によるレンダリング最適化 */
  contain: layout style paint;
  
  /* ポインターイベント有効化 */
  pointer-events: auto;
  
  /* パフォーマンス最適化 */
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  
}

.scroll-item:hover {
  /* GPUフレンドリーなエフェクト */
  transform: translate3d(
    calc(var(--x) * 1px), 
    calc(var(--y) * 1px), 
    0
  ) rotate(calc(var(--r) * 1deg)) scale(1.05);
  filter: brightness(1.1);
}

/* フォーカス時のエフェクト */
.scroll-item.focused {
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%, 100% {
    transform: translate3d(
      calc(var(--x) * 1px), 
      calc(var(--y) * 1px), 
      0
    ) rotate(calc(var(--r) * 1deg)) scale(1);
  }
  50% {
    transform: translate3d(
      calc(var(--x) * 1px), 
      calc(var(--y) * 1px), 
      0
    ) rotate(calc(var(--r) * 1deg)) scale(1.05);
  }
}
</style>