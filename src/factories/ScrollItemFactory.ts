import type { ScrollItem, ImageScrollItem, TextScrollItem } from '@/types/scroll-item'
import { type PositionService } from '@/services/PositionService'
import { type VelocityService } from '@/services/VelocityService'
import { type ContentFactory } from './ContentFactory'
import { randomRange } from '@/utils/random'

/**
 * スクロールアイテムの生成を担当するファクトリー
 * 各種サービスと連携してアイテムを生成
 */
export class ScrollItemFactory {
  private itemCounter = 0
  
  /**
   * コンストラクタ
   * @param positionService 位置管理サービス
   * @param velocityService 速度管理サービス
   * @param contentFactory コンテンツファクトリー
   */
  constructor(
    private positionService: PositionService,
    private velocityService: VelocityService,
    private contentFactory: ContentFactory
  ) {}
  
  /**
   * 画像スクロールアイテムを生成
   * @param data 画像データ
   * @param index アイテムのインデックス（位置計算用）
   * @param baseVelocity 基準速度
   * @returns 画像スクロールアイテム
   */
  createImageItem(
    data: { url: string; title?: string },
    index: number,
    baseVelocity: number
  ): ImageScrollItem {
    const id = this.generateId('img', index)
    
    return {
      id,
      type: 'image',
      position: this.positionService.generateOffscreenPosition(index),
      velocity: this.velocityService.calculateItemVelocity(baseVelocity, 'image'),
      zIndex: this.generateZIndex(),
      rotation: this.generateImageRotation(),
      content: this.contentFactory.createImageContent(data)
    }
  }
  
  /**
   * テキストスクロールアイテムを生成
   * @param text 表示テキスト
   * @param index アイテムのインデックス（位置計算用）
   * @param baseVelocity 基準速度
   * @returns テキストスクロールアイテム
   */
  createTextItem(
    text: string,
    index: number,
    baseVelocity: number
  ): TextScrollItem {
    const id = this.generateId('txt', index)
    
    return {
      id,
      type: 'text',
      position: this.positionService.generateOffscreenPosition(index),
      velocity: this.velocityService.calculateItemVelocity(baseVelocity, 'text'),
      zIndex: this.generateZIndex(),
      rotation: this.generateTextRotation(),
      content: this.contentFactory.createTextContent(text)
    }
  }
  
  /**
   * 複数のアイテムをバッチ生成
   * @param items アイテムデータの配列
   * @param startIndex 開始インデックス
   * @param baseVelocity 基準速度
   * @returns スクロールアイテムの配列
   */
  createBatch(
    items: Array<{ type: 'image'; data: { url: string; title?: string } } | { type: 'text'; data: string }>,
    startIndex: number,
    baseVelocity: number
  ): ScrollItem[] {
    return items.map((item, i) => {
      const index = startIndex + i
      if (item.type === 'image') {
        return this.createImageItem(item.data, index, baseVelocity)
      } else {
        return this.createTextItem(item.data, index, baseVelocity)
      }
    })
  }
  
  /**
   * 画像データの配列から一括生成
   * @param imageDataList 画像データの配列
   * @param startIndex 開始インデックス
   * @param baseVelocity 基準速度
   * @returns 画像スクロールアイテムの配列
   */
  createImageBatch(
    imageDataList: Array<{ url: string; title?: string }>,
    startIndex: number,
    baseVelocity: number
  ): ImageScrollItem[] {
    return imageDataList.map((data, i) => 
      this.createImageItem(data, startIndex + i, baseVelocity)
    )
  }
  
  /**
   * テキストの配列から一括生成
   * @param textList テキストの配列
   * @param startIndex 開始インデックス
   * @param baseVelocity 基準速度
   * @returns テキストスクロールアイテムの配列
   */
  createTextBatch(
    textList: string[],
    startIndex: number,
    baseVelocity: number
  ): TextScrollItem[] {
    return textList.map((text, i) => 
      this.createTextItem(text, startIndex + i, baseVelocity)
    )
  }
  
  /**
   * アイテムIDを生成
   * @param prefix プレフィックス
   * @param index インデックス
   * @returns 一意のID
   */
  private generateId(prefix: string, index: number): string {
    this.itemCounter++
    return `${prefix}-${String(Date.now())}-${String(index)}-${String(this.itemCounter)}`
  }
  
  /**
   * z-indexを生成
   * @returns ランダムなz-index値
   */
  private generateZIndex(): number {
    return 10 + Math.floor(randomRange(0, 30))
  }
  
  /**
   * 画像の回転角度を生成
   * @returns ランダムな回転角度（-20〜20度）
   */
  private generateImageRotation(): number {
    return randomRange(-20, 20)
  }
  
  /**
   * テキストの回転角度を生成
   * @returns ランダムな回転角度（-10〜10度）
   */
  private generateTextRotation(): number {
    return randomRange(-10, 10)
  }
  
  /**
   * カウンターをリセット
   */
  resetCounter(): void {
    this.itemCounter = 0
  }
  
  /**
   * 現在のカウンター値を取得
   * @returns カウンター値
   */
  getCounter(): number {
    return this.itemCounter
  }
}