import type { Position } from '@/types'
import { SCROLL_CONFIG } from '@/config/scroll.config'
import { randomRange } from '@/utils/random'

/**
 * アイテムの位置管理を担当するサービス
 * 初期位置生成、位置更新、画面端判定などを処理
 */
export class PositionService {
  private boardWidth: number
  private boardHeight: number
  
  /**
   * コンストラクタ
   * @param boardWidth ボードの幅（ピクセル）
   * @param boardHeight ボードの高さ（ピクセル）
   */
  constructor(boardWidth: number, boardHeight: number) {
    this.boardWidth = boardWidth
    this.boardHeight = boardHeight
  }
  
  /**
   * 画面外（右側）の初期位置を生成
   * @param index アイテムのインデックス（間隔計算用）
   * @returns 生成された位置座標
   */
  generateOffscreenPosition(index: number): Position {
    const { minSpacing, randomSpacing } = SCROLL_CONFIG.position
    
    let x: number
    
    // 初期表示を早くするため、最初のいくつかのアイテムは画面内に配置
    if (index === 0) {
      // 最初のアイテムは画面中央付近から開始（即座に表示）
      x = this.boardWidth * 0.6 + randomRange(-100, 100)
    } else if (index === 1) {
      // 2番目のアイテムは画面の右寄りから開始
      x = this.boardWidth * 0.8 + randomRange(-50, 50)
    } else if (index === 2) {
      // 3番目のアイテムは画面端付近から開始
      x = this.boardWidth - 50 + randomRange(0, 100)
    } else if (index === 3) {
      // 4番目のアイテムは画面端から少し外
      x = this.boardWidth + randomRange(50, 150)
    } else if (index === 4) {
      // 5番目のアイテムはもう少し外
      x = this.boardWidth + randomRange(200, 300)
    } else {
      // 6番目以降は通常の間隔で配置（インデックス調整）
      const adjustedIndex = index - 5 // 最初の5個分をスキップ
      x = this.boardWidth + 350 + // 5番目の後から開始
          (adjustedIndex * minSpacing) + 
          randomRange(0, randomSpacing)
    }
    
    // Y座標は画面内でランダムに配置
    const minY = SCROLL_CONFIG.position.minY
    const maxY = this.boardHeight - SCROLL_CONFIG.position.bottomMargin
    const y = randomRange(minY, maxY)
    
    return { x, y }
  }
  
  /**
   * 次フレームの位置を計算
   * @param current 現在の位置
   * @param velocity 速度（px/秒）
   * @param deltaTime 前フレームからの経過時間（秒）
   * @returns 新しい位置座標
   */
  calculateNextPosition(
    current: Position, 
    velocity: number, 
    deltaTime: number
  ): Position {
    // 左方向へのスクロール（x座標を減少）
    return {
      x: current.x - (velocity * deltaTime),
      y: current.y // Y座標は固定
    }
  }
  
  /**
   * アイテムが画面左端から完全に出たかを判定
   * @param position アイテムの位置
   * @param itemWidth アイテムの幅
   * @returns 画面外に出た場合true
   */
  shouldWrapAround(position: Position, itemWidth: number): boolean {
    // アイテムの右端が画面左端（x=0）より左にある場合
    return position.x < -itemWidth
  }
  
  /**
   * ループ時の再配置位置を生成（画面右側の外）
   * @returns 新しい位置座標
   */
  getWrapAroundPosition(): Position {
    const { offscreenOffset, wrapAroundBuffer } = SCROLL_CONFIG.position
    
    // 画面外右側にランダムな位置で再配置
    const x = this.boardWidth + offscreenOffset + randomRange(0, wrapAroundBuffer)
    
    // Y座標も新たにランダムに設定
    const minY = SCROLL_CONFIG.position.minY
    const maxY = this.boardHeight - SCROLL_CONFIG.position.bottomMargin
    const y = randomRange(minY, maxY)
    
    return { x, y }
  }
  
  /**
   * ボードのサイズを更新（ウィンドウリサイズ時など）
   * @param width 新しい幅
   * @param height 新しい高さ
   */
  updateBoardDimensions(width: number, height: number): void {
    this.boardWidth = width
    this.boardHeight = height
  }
  
  /**
   * 現在のボードサイズを取得
   * @returns ボードの幅と高さ
   */
  getBoardDimensions(): { width: number; height: number } {
    return {
      width: this.boardWidth,
      height: this.boardHeight
    }
  }
  
  /**
   * 位置が画面内にあるかを判定
   * @param position チェックする位置
   * @param itemWidth アイテムの幅
   * @param itemHeight アイテムの高さ
   * @returns 画面内にある場合true
   */
  isInViewport(position: Position, itemWidth: number, itemHeight: number): boolean {
    const inHorizontalRange = 
      position.x + itemWidth > 0 && position.x < this.boardWidth
    const inVerticalRange = 
      position.y + itemHeight > 0 && position.y < this.boardHeight
      
    return inHorizontalRange && inVerticalRange
  }
  
  /**
   * 複数のアイテムの初期位置を一括生成
   * @param count 生成するアイテム数
   * @returns 位置座標の配列
   */
  generateMultipleOffscreenPositions(count: number): Position[] {
    const positions: Position[] = []
    for (let i = 0; i < count; i++) {
      positions.push(this.generateOffscreenPosition(i))
    }
    return positions
  }
}