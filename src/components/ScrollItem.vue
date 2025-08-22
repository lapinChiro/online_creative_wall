<template>
  <div
    ref="itemRef"
    class="scroll-item"
    :class="{ focused: isFocused }"
    :style="itemStyle"
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

// スタイル計算（位置はストアから直接参照）
const itemStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${String(props.item.position.x)}px`,
  top: `${String(props.item.position.y)}px`,
  transform: `rotate(${String(props.item.rotation)}deg)`,
  zIndex: props.item.zIndex,
  transition: isFocused.value ? 'transform 0.2s ease' : 'none',
  cursor: 'pointer' as const
}))

// 位置変更の監視（画面外判定用）
watch(() => props.item.position.x, (newX) => {
  if (itemRef.value !== null) {
    const width = itemRef.value.offsetWidth
    if (newX < -width) {
      emit('wrap-around', props.item.id)
    }
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

// 要素の幅を取得（外部から参照可能）
const getWidth = (): number => {
  return itemRef.value?.offsetWidth ?? 0
}

// パブリックメソッドの公開
defineExpose({
  getWidth
})
</script>

<style scoped>
.scroll-item {
  position: absolute;
  will-change: transform, left, top;
  pointer-events: auto;
}

.scroll-item:hover {
  filter: brightness(1.1);
}

/* フォーカス時のエフェクト */
.scroll-item.focused {
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>