<template>
  <div
    ref="blackboardRef"
    class="blackboard"
  >
    <div class="logo-watermark">
      🎨 Creative Wall
    </div>
    <div 
      ref="scrollAreaRef" 
      class="scroll-area"
    >
      <!-- TransitionGroup削除でパフォーマンス向上 -->
      <ScrollItem
        v-for="item in virtualItems"
        :key="item.id"
        :ref="(el) => handleItemRef(el)"
        :item="item"
        @update-position="(pos: Position) => handlePositionUpdate(item.id, pos)"
        @wrap-around="() => handleWrapAround(item.id)"
        @remove="() => handleItemRemove(item.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRef } from 'vue'
import ScrollItem from './ScrollItem.vue'
import type { ScrollItem as ScrollItemType } from '@/types/scroll-item'
import type { Position } from '@/types'
import { useVirtualScroll } from '@/composables/useVirtualScroll'
import { createLogger } from '@/utils/logger'

const logger = createLogger('BlackBoard')

interface Props {
  items: ScrollItemType[]
}

interface Emits {
  (e: 'update-position', id: string, position: Position): void
  (e: 'remove-item', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Virtual Scrolling統合
const { 
  virtualItems, 
  observeItem, 
  unobserveItem,
  getRenderingStats 
} = useVirtualScroll(toRef(props, 'items'))

const blackboardRef = ref<HTMLElement | null>(null)
const scrollAreaRef = ref<HTMLElement | null>(null)

// Handle position updates from ScrollItem components
const handlePositionUpdate = (id: string, position: Position): void => {
  emit('update-position', id, position)
}

// Handle item removal
const handleItemRemove = (id: string): void => {
  emit('remove-item', id)
}

// Handle wrap-around (item going off-screen and returning)
const handleWrapAround = (_id: string): void => {
  // Optional: Add any wrap-around specific logic here
  // For now, position update will handle it
}

// Virtual Scrolling: ScrollItemコンポーネントの参照を処理
const itemRefs = new Map<string, Element>()

// Vue3のテンプレートrefの型定義
interface ComponentPublicInstance {
  $el: Element
}

const handleItemRef = (el: ComponentPublicInstance | Element | null): void => {
  // nullチェック
  if (el === null) {
    return
  }

  // DOM要素を取得
  let element: Element | null = null
  
  if (el instanceof Element) {
    // 直接Element型の場合
    element = el
  } else if (typeof el === 'object' && '$el' in el && el.$el instanceof Element) {
    // Vueコンポーネントインスタンスの場合
    element = el.$el
  }
  
  if (element !== null) {
    // data-item-idから ID を取得
    const itemId = element.getAttribute('data-item-id')
    if (itemId !== null) {
      // 既存の要素があれば監視解除
      const existingEl = itemRefs.get(itemId)
      if (existingEl !== undefined) {
        unobserveItem(existingEl)
      }
      // 新しい要素を監視
      itemRefs.set(itemId, element)
      observeItem(element)
    }
  }
}

// Handle resize events
const handleResize = (): void => {
  // Notify children about resize if needed
  // This could trigger position recalculation
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // デバッグ用: Virtual Scrolling統計を定期出力（開発環境のみ）
  if (import.meta.env.DEV) {
    const intervalId = setInterval(() => {
      const stats = getRenderingStats()
      logger.debug('VirtualScroll', {
        rendering: `${String(stats.virtualItems)}/${String(stats.totalItems)}`,
        reduction: `${String(stats.reductionRate)}%`
      })
    }, 10000)
    
    onUnmounted(() => { clearInterval(intervalId); })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.blackboard {
  width: 100%;
  height: 100%;
  flex: 1;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.01), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.01), transparent 50%),
    #2a2d3a;
  background-size: 100% 100%;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  border: 15px solid #8b4513;
  box-shadow: 
    inset 0 0 100px rgba(0, 0, 0, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
}

.blackboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 50px,
      rgba(255, 255, 255, 0.01) 50px,
      rgba(255, 255, 255, 0.01) 51px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 50px,
      rgba(255, 255, 255, 0.01) 50px,
      rgba(255, 255, 255, 0.01) 51px
    );
  pointer-events: none;
  opacity: 0.3;
}

.logo-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3em;
  color: rgba(255, 255, 255, 0.05);
  font-weight: bold;
  pointer-events: none;
  z-index: 1;
  letter-spacing: 3px;
  text-align: center;
}

.scroll-area {
  width: 100%;
  height: 100%;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>