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
      <TransitionGroup name="fade">
        <ScrollItem
          v-for="item in items"
          :key="item.id"
          :item="item"
          @update-position="(pos: Position) => handlePositionUpdate(item.id, pos)"
          @wrap-around="() => handleWrapAround(item.id)"
          @remove="() => handleItemRemove(item.id)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ScrollItem from './ScrollItem.vue'
import type { ScrollItem as ScrollItemType } from '@/types/scroll-item'
import type { Position } from '@/types'

interface Props {
  items: ScrollItemType[]
}

interface Emits {
  (e: 'update-position', id: string, position: Position): void
  (e: 'remove-item', id: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

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

// Handle resize events
const handleResize = (): void => {
  // Notify children about resize if needed
  // This could trigger position recalculation
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
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