<template>
  <div class="app-container">
    <div
      v-if="!loading && !error"
      class="controls-container"
    >
      <button 
        class="toggle-text-btn"
        @click="scrollItemsStore.toggleTexts()"
      >
        {{ scrollItemsStore.showTexts ? 'テキストを隠す' : 'テキストを表示' }}
      </button>
      <div class="post-count-control">
        <label for="post-count">投稿数: </label>
        <input 
          id="post-count"
          v-model.number="scrollItemsStore.itemCount" 
          type="range"
          min="5"
          :max="100"
          step="5"
          @change="regenerateItems"
        >
        <span class="post-count-display">{{ scrollItemsStore.itemCount }} / {{ maxDataCount }}</span>
      </div>
      <div class="speed-control">
        <label for="scroll-speed">速度: </label>
        <input 
          id="scroll-speed"
          v-model.number="scrollItemsStore.globalVelocity" 
          type="range"
          min="10"
          max="150"
          step="10"
          @change="updateGlobalSpeed"
        >
        <span class="speed-display">{{ scrollItemsStore.globalVelocity }}%</span>
      </div>
    </div>
    <div class="wall-container">
      <div
        v-if="loading"
        class="loading"
      >
        Loading images...
      </div>
      <div
        v-else-if="error"
        class="error"
      >
        {{ error }}
      </div>
      <BlackBoard
        v-else
        :items="scrollItemsStore.visibleItems"
        @update-position="handlePositionUpdate"
        @remove-item="handleItemRemove"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BlackBoard from './BlackBoard.vue'
import { useScrollItemsStore } from '@/stores/scrollItems'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import { ScrollItemFactory } from '@/factories/ScrollItemFactory'
import { ContentFactory } from '@/factories/ContentFactory'
import { PositionService } from '@/services/PositionService'
import { VelocityService } from '@/services/VelocityService'
import { DataService, type FetchedImage } from '@/services/DataService'
import { calculateBoardSize, SCROLL_CONFIG } from '@/config/scroll.config'
import type { Position } from '@/types'

const scrollItemsStore = useScrollItemsStore()
const loading = ref(true)
const error = ref<string | null>(null)
const maxDataCount = ref<number>(SCROLL_CONFIG.layout.maxDataCount)

// Initialize services and factories immediately
const boardSize = calculateBoardSize()
const { width: boardWidth, height: boardHeight } = boardSize
const positionService = new PositionService(boardWidth, boardHeight)
const velocityService = new VelocityService()
const dataService = new DataService()
const contentFactory = new ContentFactory()
const itemFactory = new ScrollItemFactory(
  positionService,
  velocityService,
  contentFactory
)

// Set initial global velocity
velocityService.setGlobalMultiplier(scrollItemsStore.globalVelocity)

// Animation management - Initialize at setup level
const animationController = useScrollAnimation(positionService)

// Data storage
const fetchedImageData = ref<FetchedImage[]>([])
const fetchedTextData = ref<string[]>([])


const fetchData = async (): Promise<void> => {
  try {
    const mediaUrl = import.meta.env['VITE_MEDIA_DATA_URL'] as string | undefined
    if (mediaUrl === undefined || mediaUrl === '') {
      throw new Error("Media URL is not defined")
    }

    const mediaData = await dataService.fetchMediaData(mediaUrl)
    
    fetchedImageData.value = mediaData.images
    fetchedTextData.value = mediaData.texts
    maxDataCount.value = fetchedImageData.value.length
  } catch (err) {
    // Error logging should be handled by service layer or monitoring service
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    error.value = `Failed to load data: ${errorMessage}`
  }
}

const generateItems = (): void => {
  
  // Clear existing items
  scrollItemsStore.clearItems()
  
  const itemCount = scrollItemsStore.itemCount
  const baseVelocity = velocityService.getDefaultVelocity()
  
  // Calculate how many images and texts to show
  const imageCount = Math.min(itemCount, fetchedImageData.value.length)
  const textCount = Math.min(15, fetchedTextData.value.length)
  
  // Create mixed item list
  const items: Array<{ type: 'image', data: FetchedImage } | { type: 'text', data: string }> = []
  
  // Add images
  fetchedImageData.value.slice(0, imageCount).forEach(imageData => {
    items.push({ type: 'image', data: imageData })
  })
  
  // Add texts (with probability)
  fetchedTextData.value.slice(0, textCount).forEach(text => {
    if (Math.random() > 0.3) { // 70% chance
      items.push({ type: 'text', data: text })
    }
  })
  
  // Shuffle items for random distribution (Fisher-Yates shuffle)
  items.sort(() => Math.random() - 0.5)
  
  // Create scroll items using factory
  const scrollItems = items.map((item, index) => {
    if (item.type === 'image') {
      return itemFactory.createImageItem(item.data, index, baseVelocity)
    } else {
      return itemFactory.createTextItem(item.data, index, baseVelocity)
    }
  })
  
  // Add items to store in batches for performance
  const BATCH_SIZE = 10
  scrollItemsStore.addItems(scrollItems.slice(0, BATCH_SIZE))
  
  // Add remaining items after a short delay
  if (scrollItems.length > BATCH_SIZE) {
    setTimeout(() => {
      scrollItemsStore.addItems(scrollItems.slice(BATCH_SIZE))
    }, 100)
  }
}

const handlePositionUpdate = (id: string, position: Position): void => {
  scrollItemsStore.updateItemPosition(id, position)
}

const handleItemRemove = (id: string): void => {
  scrollItemsStore.removeItem(id)
}

const regenerateItems = (): void => {
  // Smart regeneration - only add/remove items as needed

  const currentItemCount = scrollItemsStore.items.length
  const targetItemCount = scrollItemsStore.itemCount
  const baseVelocity = velocityService.getDefaultVelocity()

  if (targetItemCount > currentItemCount) {
    // Need to add more items
    const itemsToAdd = targetItemCount - currentItemCount
    const newItems: Array<{ type: 'image', data: FetchedImage } | { type: 'text', data: string }> = []
    
    // Calculate available data
    const availableImages = fetchedImageData.value.length
    const availableTexts = fetchedTextData.value.length
    
    // Add items proportionally (roughly 70% images, 30% texts with randomness)
    for (let i = 0; i < itemsToAdd; i++) {
      const shouldAddImage = Math.random() > 0.3 && availableImages > 0
      
      if (shouldAddImage) {
        const imageIndex = Math.floor(Math.random() * availableImages)
        const imageData = fetchedImageData.value[imageIndex]
        if (imageData !== undefined) {
          newItems.push({ 
            type: 'image', 
            data: imageData 
          })
        }
      } else if (availableTexts > 0) {
        const textIndex = Math.floor(Math.random() * availableTexts)
        const textData = fetchedTextData.value[textIndex]
        if (textData !== undefined) {
          newItems.push({ 
            type: 'text', 
            data: textData 
          })
        }
      } else if (availableImages > 0) {
        // Fallback to image if no texts available
        const imageIndex = Math.floor(Math.random() * availableImages)
        const imageData = fetchedImageData.value[imageIndex]
        if (imageData !== undefined) {
          newItems.push({ 
            type: 'image', 
            data: imageData 
          })
        }
      }
    }
    
    // Create scroll items using factory with higher starting index
    const scrollItems = newItems.map((item, index) => {
      const itemIndex = currentItemCount + index
      if (item.type === 'image') {
        return itemFactory.createImageItem(item.data, itemIndex, baseVelocity)
      } else {
        return itemFactory.createTextItem(item.data, itemIndex, baseVelocity)
      }
    })
    
    // Add new items to store
    scrollItemsStore.addItems(scrollItems)
    
  } else if (targetItemCount < currentItemCount) {
    // Need to remove items
    const currentItems = scrollItemsStore.items
    
    // Remove items from the end (newest items first)
    const itemsToDelete = currentItems.slice(targetItemCount)
    
    // Remove excess items
    scrollItemsStore.removeItems(itemsToDelete.map(item => item.id))
  }
  
  // If counts are equal, no changes needed
}

const updateGlobalSpeed = (): void => {
  // Update velocity service with new global speed
  velocityService.setGlobalMultiplier(scrollItemsStore.globalVelocity)
  
  // Update all existing items' velocities
  scrollItemsStore.updateAllVelocities(velocityService)
}

const initializeApp = async (): Promise<void> => {
  loading.value = true
  
  try {
    // Services are already initialized at the top level
    // initializeServices() - No longer needed
    
    // Fetch data
    await fetchData()
    
    // Generate initial items
    if (fetchedImageData.value.length > 0) {
      generateItems()
    }
  } catch (err) {
    // Error logging should be handled by monitoring service
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    error.value = `Failed to initialize application: ${errorMessage}`
  } finally {
    loading.value = false
  }
}

// Handle window resize
const handleResize = (): void => {
  const newBoardSize = calculateBoardSize()
  positionService.updateBoardDimensions(newBoardSize.width, newBoardSize.height)
}

onMounted(async () => {
  await initializeApp()
  
  // Start animation after data is ready
  animationController.start()
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('resize', animationController.handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('resize', animationController.handleResize)
  
  // Stop animation if running
  animationController.stop()
  
  scrollItemsStore.clearItems()
})
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.wall-container {
  width: 100%;
  flex: 1;
  position: relative;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.controls-container {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.toggle-text-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.post-count-control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #333;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.post-count-control label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.post-count-control input[type="range"] {
  width: 150px;
  cursor: pointer;
}

.post-count-display {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  min-width: 60px;
  text-align: right;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #333;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.speed-control label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.speed-control input[type="range"] {
  width: 150px;
  cursor: pointer;
}

.speed-display {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  min-width: 40px;
  text-align: right;
}

.toggle-text-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toggle-text-btn:active {
  transform: translateY(0);
}

.loading, .error {
  color: white;
  font-size: 1.5rem;
  text-align: center;
  padding: 20px;
}

.error {
  color: #ff6b6b;
}

</style>