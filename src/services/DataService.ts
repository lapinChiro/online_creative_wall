/**
 * データ取得を担当するサービス
 * 外部APIからのデータ取得処理を抽象化
 */
export interface MediaData {
  images: FetchedImage[]
  texts: string[]
}

export interface FetchedImage {
  url: string
  title: string
}

interface MediaItem {
  media_url_https?: string
  text?: string
}

/**
 * 外部データソースからメディアデータを取得するサービス
 */
export class DataService {
  /**
   * 指定されたURLからメディアデータを取得
   * @param mediaUrl データソースのURL
   * @returns メディアデータ
   * @throws データ取得に失敗した場合
   */
  async fetchMediaData(mediaUrl: string): Promise<MediaData> {
    try {
      const response = await fetch(mediaUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`)
      }
      
      const data = await response.json() as MediaItem[]
      
      // データ構造の検証
      if (!this.validateRawMediaData(data)) {
        throw new Error('Invalid media data structure')
      }
      
      // Process image data
      const images: FetchedImage[] = data
        .filter((item: MediaItem): item is MediaItem & { media_url_https: string } => 
          item.media_url_https !== undefined)
        .map((item) => ({
          url: item.media_url_https,
          title: item.text ?? 'Creative Wall Image'
        }))
        .slice(0, 80) // 最大80件の画像データ
      
      // Process text data
      const texts: string[] = data
        .filter((item: MediaItem): item is MediaItem & { text: string } => 
          item.text !== undefined && item.text.length > 0)
        .map((item) => item.text)
        .slice(0, 15) // テキストは最大15件
      
      return { images, texts }
    } catch (error) {
      throw new Error(`Failed to fetch media data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * 生メディアデータの構造を検証
   * @param data 検証対象のデータ
   * @returns 有効な構造の場合true
   */
  private validateRawMediaData(data: unknown): data is MediaItem[] {
    if (!Array.isArray(data)) {
      return false
    }
    
    return data.every(item => 
      typeof item === 'object' && 
      item !== null
    )
  }
  
  /**
   * 画像データの有効性をチェック
   * @param image チェック対象の画像データ
   * @returns 有効な場合true
   */
  validateImageData(image: FetchedImage): boolean {
    return (
      typeof image.url === 'string' && 
      image.url.length > 0 &&
      typeof image.title === 'string'
    )
  }
  
  /**
   * テキストデータの有効性をチェック
   * @param text チェック対象のテキストデータ
   * @returns 有効な場合true
   */
  validateTextData(text: string): boolean {
    return typeof text === 'string' && text.trim().length > 0
  }
}