import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useLazyLoad(elementRef: Ref<HTMLElement | null>): {
  isIntersecting: Ref<boolean>
  isLoaded: Ref<boolean>
  isLoading: Ref<boolean>
  hasError: Ref<boolean>
  loadImage: (src: string) => Promise<void>
} {
  const isIntersecting = ref(false)
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const hasError = ref(false)
  
  let observer: IntersectionObserver | null = null
  
  const loadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        isLoaded.value = true
        isLoading.value = false
        resolve()
      }
      
      img.onerror = () => {
        hasError.value = true
        isLoading.value = false
        reject(new Error('Failed to load image'))
      }
      
      isLoading.value = true
      img.src = src
    })
  }
  
  onMounted(() => {
    if (elementRef.value === null) {return}
    
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isIntersecting.value = true
            observer?.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    )
    
    observer.observe(elementRef.value)
  })
  
  onUnmounted(() => {
    observer?.disconnect()
  })
  
  return {
    isIntersecting,
    isLoaded,
    isLoading,
    hasError,
    loadImage
  }
}