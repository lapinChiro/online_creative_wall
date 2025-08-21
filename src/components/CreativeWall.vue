<template>
  <div class="app-container">
    <div class="controls-container" v-if="!loading && !error">
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
          type="range" 
          v-model.number="scrollItemsStore.itemCount"
          min="5"
          :max="100"
          step="5"
          @change="regenerateItems"
        />
        <span class="post-count-display">{{ scrollItemsStore.itemCount }} / {{ maxDataCount }}</span>
      </div>
      <div class="speed-control">
        <label for="scroll-speed">速度: </label>
        <input 
          id="scroll-speed"
          type="range" 
          v-model.number="scrollItemsStore.globalVelocity"
          min="10"
          max="150"
          step="10"
          @change="updateGlobalSpeed"
        />
        <span class="speed-display">{{ scrollItemsStore.globalVelocity }}%</span>
      </div>
    </div>
    <div class="wall-container">
      <div v-if="loading" class="loading">Loading images...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
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
import type { Position } from '@/types'

const scrollItemsStore = useScrollItemsStore()
const loading = ref(true)
const error = ref<string | null>(null)
const maxDataCount = ref(100)

// Services and factories
let positionService: PositionService | null = null
let velocityService: VelocityService | null = null
let contentFactory: ContentFactory | null = null
let itemFactory: ScrollItemFactory | null = null

// Initialize position service early for animation controller
const boardWidth = window.innerWidth - 60
const boardHeight = window.innerHeight - 120
const initialPositionService = new PositionService(boardWidth, boardHeight)

// Animation management - Initialize at setup level
const animationController = useScrollAnimation(initialPositionService)

// Raw data storage
const fetchedImageData = ref<any[]>([])
const fetchedTextData = ref<string[]>([])

const initializeServices = () => {
  const boardWidth = window.innerWidth - 60
  const boardHeight = window.innerHeight - 120
  
  // Initialize services
  positionService = initialPositionService // Use the already created instance
  velocityService = new VelocityService()
  contentFactory = new ContentFactory()
  itemFactory = new ScrollItemFactory(
    positionService,
    velocityService,
    contentFactory
  )
  
  // Set initial global velocity
  velocityService.setGlobalMultiplier(scrollItemsStore.globalVelocity)
}

const fetchData = async () => {
  try {
    const mediaUrl = import.meta.env.VITE_MEDIA_DATA_URL || new Error("Media URL is not defined");

    const response = await fetch(mediaUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    // Process image data
    fetchedImageData.value = data
      .filter((item: any) => item.media_url_https)
      .map((item: any) => ({
        url: item.media_url_https,
        title: item.text || 'Image'
      }))
    
    // Process text data
    fetchedTextData.value = data
      .filter((item: any) => item.text && item.text.length > 0)
      .map((item: any) => item.text)
      .slice(0, 30) // Limit texts
    
    maxDataCount.value = fetchedImageData.value.length
  } catch (err) {
    console.error('Failed to fetch data:', err)
    error.value = 'Failed to load data'
  }
}

const generateItems = () => {
  // Check if services are initialized
  if (!itemFactory || !velocityService) {
    console.error('Services not initialized yet')
    return
  }
  
  // Clear existing items
  scrollItemsStore.clearItems()
  
  const itemCount = scrollItemsStore.itemCount
  const baseVelocity = velocityService.getDefaultVelocity()
  
  // Calculate how many images and texts to show
  const imageCount = Math.min(itemCount, fetchedImageData.value.length)
  const textCount = Math.min(15, fetchedTextData.value.length)
  
  // Create mixed item list
  const items: Array<{ type: 'image' | 'text', data: any }> = []
  
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
  
  // Shuffle items for random distribution
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]]
  }
  
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

const handlePositionUpdate = (id: string, position: Position) => {
  scrollItemsStore.updateItemPosition(id, position)
}

const handleItemRemove = (id: string) => {
  scrollItemsStore.removeItem(id)
}

const regenerateItems = () => {
  // Smart regeneration - only add/remove items as needed
  if (!itemFactory || !velocityService) {
    console.error('Services not initialized yet')
    return
  }

  const currentItemCount = scrollItemsStore.items.length
  const targetItemCount = scrollItemsStore.itemCount
  const baseVelocity = velocityService.getDefaultVelocity()

  if (targetItemCount > currentItemCount) {
    // Need to add more items
    const itemsToAdd = targetItemCount - currentItemCount
    const newItems: Array<{ type: 'image' | 'text', data: any }> = []
    
    // Calculate available data
    const availableImages = fetchedImageData.value.length
    const availableTexts = fetchedTextData.value.length
    
    // Add items proportionally (roughly 70% images, 30% texts with randomness)
    for (let i = 0; i < itemsToAdd; i++) {
      const shouldAddImage = Math.random() > 0.3 && availableImages > 0
      
      if (shouldAddImage) {
        const imageIndex = Math.floor(Math.random() * availableImages)
        newItems.push({ 
          type: 'image', 
          data: fetchedImageData.value[imageIndex] 
        })
      } else if (availableTexts > 0) {
        const textIndex = Math.floor(Math.random() * availableTexts)
        newItems.push({ 
          type: 'text', 
          data: fetchedTextData.value[textIndex] 
        })
      } else if (availableImages > 0) {
        // Fallback to image if no texts available
        const imageIndex = Math.floor(Math.random() * availableImages)
        newItems.push({ 
          type: 'image', 
          data: fetchedImageData.value[imageIndex] 
        })
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
    const itemsToRemove = currentItemCount - targetItemCount
    const currentItems = scrollItemsStore.items
    
    // Remove items from the end (newest items first)
    const itemsToKeep = currentItems.slice(0, targetItemCount)
    const itemsToDelete = currentItems.slice(targetItemCount)
    
    // Remove excess items
    scrollItemsStore.removeItems(itemsToDelete.map(item => item.id))
  }
  
  // If counts are equal, no changes needed
}

const updateGlobalSpeed = () => {
  // Update velocity service with new global speed
  velocityService.setGlobalMultiplier(scrollItemsStore.globalVelocity)
  
  // Update all existing items' velocities
  scrollItemsStore.updateAllVelocities(velocityService)
}

const initializeApp = async () => {
  loading.value = true
  
  try {
    // Initialize services
    initializeServices()
    
    // Fetch data
    await fetchData()
    
    // Generate initial items
    if (fetchedImageData.value.length > 0) {
      generateItems()
    }
  } catch (err) {
    console.error('Initialization failed:', err)
    error.value = 'Failed to initialize application'
  } finally {
    loading.value = false
  }
}

// Handle window resize
const handleResize = () => {
  const boardWidth = window.innerWidth - 60
  const boardHeight = window.innerHeight - 120
  if (positionService) {
    positionService.updateBoardDimensions(boardWidth, boardHeight)
  }
}

onMounted(async () => {
  await initializeApp()
  
  // Start animation after data is ready
  if (animationController) {
    animationController.start()
  }
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('resize', animationController.handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('resize', animationController.handleResize)
  
  // Stop animation if running
  if (animationController) {
    animationController.stop()
  }
  
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