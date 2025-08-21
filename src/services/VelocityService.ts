import { SCROLL_CONFIG } from '@/config/scroll.config'
import { randomRange } from '@/utils/random'

/**
 * アイテムの速度管理を担当するサービス
 * グローバル速度係数の管理と個別アイテムの速度計算を行う
 */
export class VelocityService {
  private globalMultiplier = 1.0
  
  /**
   * アイテムタイプに応じた速度を計算
   * @param baseVelocity 基準速度
   * @param itemType アイテムタイプ（画像 or テキスト）
   * @returns 計算された速度値
   */
  calculateItemVelocity(
    baseVelocity: number,
    itemType: 'image' | 'text'
  ): number {
    const variation = SCROLL_CONFIG.velocity.randomVariation[itemType]
    const randomMultiplier = randomRange(variation.min, variation.max)
    return baseVelocity * this.globalMultiplier * randomMultiplier
  }
  
  /**
   * グローバル速度係数を設定
   * @param multiplier 速度係数（パーセント値 10-150）
   */
  setGlobalMultiplier(multiplier: number): void {
    const { min, max } = SCROLL_CONFIG.velocity
    // 範囲内に収める（10-150を0.1-1.5に変換）
    this.globalMultiplier = Math.max(min, Math.min(max, multiplier)) / 100
  }
  
  /**
   * 現在のグローバル速度係数を取得
   * @returns 速度係数（パーセント値）
   */
  getGlobalMultiplier(): number {
    return this.globalMultiplier * 100
  }
  
  /**
   * デフォルト速度を取得
   * @returns デフォルト速度値
   */
  getDefaultVelocity(): number {
    return SCROLL_CONFIG.velocity.default
  }
  
  /**
   * 速度範囲を取得
   * @returns 最小値と最大値
   */
  getVelocityRange(): { min: number; max: number } {
    return {
      min: SCROLL_CONFIG.velocity.min,
      max: SCROLL_CONFIG.velocity.max
    }
  }
  
  /**
   * グローバル速度をリセット
   */
  resetGlobalMultiplier(): void {
    this.globalMultiplier = 1.0
  }
  
  /**
   * アイテムタイプごとのランダム係数範囲を取得
   * @param itemType アイテムタイプ
   * @returns ランダム係数の最小値と最大値
   */
  getVariationRange(itemType: 'image' | 'text'): { min: number; max: number } {
    return SCROLL_CONFIG.velocity.randomVariation[itemType]
  }
}