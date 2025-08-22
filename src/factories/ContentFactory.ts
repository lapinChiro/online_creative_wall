import type { ImageContent, TextContent } from '@/types/scroll-item'
import { SCROLL_CONFIG } from '@/config/scroll.config'
import { randomChoice, randomRange } from '@/utils/random'

/**
 * スクロールアイテムのコンテンツ生成を担当するファクトリー
 * 画像とテキストのコンテンツを適切な形式で生成
 */
export class ContentFactory {
  /**
   * 画像コンテンツを生成
   * @param data 画像データ（url, titleを含むオブジェクト）
   * @returns 画像コンテンツ
   */
  createImageContent(data: { url: string; title?: string }): ImageContent {
    // サイズをランダムに選択
    const sizes: ImageContent['size'][] = ['small', 'medium', 'large', 'xlarge']
    const size = randomChoice(sizes)
    
    return {
      url: data.url,
      title: data.title || 'Creative Wall Image',
      size
    }
  }
  
  /**
   * テキストコンテンツを生成
   * @param text 表示するテキスト
   * @returns テキストコンテンツ
   */
  createTextContent(text: string): TextContent {
    // カラーをランダムに選択
    const color = randomChoice(SCROLL_CONFIG.colors.text)
    
    // フォントサイズをランダムに決定
    const { min, max } = SCROLL_CONFIG.sizes.text
    const fontSize = randomRange(min, max)
    
    return {
      text: this.truncateText(text),
      color,
      fontSize
    }
  }
  
  /**
   * 画像サイズを指定して画像コンテンツを生成
   * @param data 画像データ
   * @param size 指定サイズ
   * @returns 画像コンテンツ
   */
  createImageContentWithSize(
    data: { url: string; title?: string },
    size: ImageContent['size']
  ): ImageContent {
    return {
      url: data.url,
      title: data.title || 'Creative Wall Image',
      size
    }
  }
  
  /**
   * カラーを指定してテキストコンテンツを生成
   * @param text 表示するテキスト
   * @param color 指定カラー
   * @param fontSize フォントサイズ（省略時はランダム）
   * @returns テキストコンテンツ
   */
  createTextContentWithColor(
    text: string,
    color: TextContent['color'],
    fontSize?: number
  ): TextContent {
    const size = fontSize ?? randomRange(
      SCROLL_CONFIG.sizes.text.min,
      SCROLL_CONFIG.sizes.text.max
    )
    
    return {
      text: this.truncateText(text),
      color,
      fontSize: size
    }
  }
  
  /**
   * バッチで画像コンテンツを生成
   * @param dataList 画像データの配列
   * @returns 画像コンテンツの配列
   */
  createImageContentBatch(
    dataList: Array<{ url: string; title?: string }>
  ): ImageContent[] {
    return dataList.map(data => this.createImageContent(data))
  }
  
  /**
   * バッチでテキストコンテンツを生成
   * @param textList テキストの配列
   * @returns テキストコンテンツの配列
   */
  createTextContentBatch(textList: string[]): TextContent[] {
    return textList.map(text => this.createTextContent(text))
  }
  
  /**
   * テキストを適切な長さに切り詰める
   * @param text 元のテキスト
   * @param maxLength 最大文字数
   * @returns 切り詰められたテキスト
   */
  private truncateText(text: string, maxLength: number = 30): string {
    if (text.length <= maxLength) {
      return text
    }
    return text.substring(0, maxLength) + '...'
  }
  
  /**
   * コンテンツのバリデーション
   * @param content コンテンツオブジェクト
   * @returns 有効な場合true
   */
  validateImageContent(content: ImageContent): boolean {
    if (!content.url || typeof content.url !== 'string') {
      return false
    }
    if (!content.title || typeof content.title !== 'string') {
      return false
    }
    const validSizes: ImageContent['size'][] = ['small', 'medium', 'large', 'xlarge']
    if (!validSizes.includes(content.size)) {
      return false
    }
    return true
  }
  
  /**
   * テキストコンテンツのバリデーション
   * @param content コンテンツオブジェクト
   * @returns 有効な場合true
   */
  validateTextContent(content: TextContent): boolean {
    if (!content.text || typeof content.text !== 'string') {
      return false
    }
    const validColors = SCROLL_CONFIG.colors.text as readonly string[]
    if (!validColors.includes(content.color)) {
      return false
    }
    if (typeof content.fontSize !== 'number' || content.fontSize <= 0) {
      return false
    }
    return true
  }
}