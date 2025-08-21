/**
 * スクロールアニメーション設定
 * すべての設定値はreadonlyで不変性を保証
 */
export const SCROLL_CONFIG = {
  /**
   * 速度設定
   */
  velocity: {
    /** デフォルト速度 (px/秒) */
    default: 150,
    /** 最小速度 (px/秒) */
    min: 15,
    /** 最大速度 (px/秒) */
    max: 225,
    /** アイテムタイプごとのランダム速度係数 */
    randomVariation: {
      /** 画像のランダム速度係数範囲 */
      image: { min: 0.4, max: 1.6 },
      /** テキストのランダム速度係数範囲 */
      text: { min: 0.3, max: 1.3 }
    }
  },
  
  /**
   * 位置設定
   */
  position: {
    /** 画面外開始時のオフセット (px) */
    offscreenOffset: 50,
    /** アイテム間の最小間隔 (px) */
    minSpacing: 150,
    /** ランダムな追加間隔の最大値 (px) */
    randomSpacing: 100,
    /** ループ時の追加バッファ (px) */
    wrapAroundBuffer: 100,
    /** Y座標の最小値 (px) */
    minY: 20,
    /** Y座標の下部マージン (px) */
    bottomMargin: 150
  },
  
  /**
   * アニメーション設定
   */
  animation: {
    /** 目標FPS */
    targetFPS: 60,
    /** バッチ処理サイズ */
    batchSize: 10,
    /** デバウンス時間 (ms) */
    debounceTime: 100
  },
  
  /**
   * サイズ設定
   */
  sizes: {
    /** 画像サイズマッピング */
    image: {
      small: { width: 100, height: 100 },
      medium: { width: 120, height: 120 },
      large: { width: 150, height: 150 },
      xlarge: { width: 180, height: 180 }
    },
    /** テキストフォントサイズ範囲 (em) */
    text: {
      min: 1.2,
      max: 2.0
    }
  },
  
  /**
   * カラー設定
   */
  colors: {
    /** チョークテキストの利用可能色 */
    text: ['yellow', 'pink', 'blue', 'green', 'white'] as const
  },
  
  /**
   * パフォーマンス設定
   */
  performance: {
    /** 遅延読み込みのしきい値 */
    lazyLoadThreshold: '50px',
    /** 最大同時アニメーション数 */
    maxConcurrentAnimations: 50,
    /** メモリ警告しきい値 (MB) */
    memoryWarningThreshold: 500
  },
  
  /**
   * デバッグ設定
   */
  debug: {
    /** デバッグモード有効化 */
    enabled: import.meta.env.DEV,
    /** FPS表示 */
    showFPS: false,
    /** 位置情報表示 */
    showPosition: false,
    /** パフォーマンスログ */
    logPerformance: false
  }
} as const

/**
 * 型定義のエクスポート
 */
export type ScrollConfig = typeof SCROLL_CONFIG
export type ImageSize = keyof typeof SCROLL_CONFIG.sizes.image
export type TextColor = typeof SCROLL_CONFIG.colors.text[number]