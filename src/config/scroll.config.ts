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
   * レイアウト設定
   */
  layout: {
    /** ボード周りのパディング (px) */
    boardPadding: 60,
    /** コントロール領域の高さ (px) */
    controlsHeight: 120,
    /** 最大データ数 */
    maxDataCount: 100,
    /** テキスト最大長 */
    maxTextLength: 30,
    /** ホバー時のz-index */
    hoverZIndex: 100
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
    text: ['yellow', 'pink', 'blue', 'green', 'white'] as const,
    /** UIカラーパレット */
    ui: {
      background: '#1a1a1a',
      boardBackground: '#2a2d3a',
      boardBorder: '#8b4513',
      controlBackground: 'rgba(255, 255, 255, 0.9)',
      controlBorder: '#333',
      controlText: '#333',
      errorText: '#ff6b6b',
      white: '#ffffff',
      whiteTransparent: {
        '01': 'rgba(255, 255, 255, 0.01)',
        '03': 'rgba(255, 255, 255, 0.03)',
        '05': 'rgba(255, 255, 255, 0.05)',
        '1': 'rgba(255, 255, 255, 0.1)',
        '2': 'rgba(255, 255, 255, 0.2)',
        '5': 'rgba(255, 255, 255, 0.5)',
        '8': 'rgba(255, 255, 255, 0.8)',
        '9': 'rgba(255, 255, 255, 0.9)'
      },
      blackTransparent: {
        '2': 'rgba(0, 0, 0, 0.2)',
        '3': 'rgba(0, 0, 0, 0.3)',
        '5': 'rgba(0, 0, 0, 0.5)',
        '8': 'rgba(0, 0, 0, 0.8)'
      }
    },
    /** チョークテキストの詳細色定義 */
    chalk: {
      yellow: {
        primary: '#ffe066',
        shadow: {
          strong: 'rgba(255, 224, 102, 0.3)',
          medium: 'rgba(255, 224, 102, 0.2)',
          soft: 'rgba(255, 224, 102, 0.1)'
        }
      },
      pink: {
        primary: '#ff6b9d',
        shadow: {
          strong: 'rgba(255, 107, 157, 0.3)',
          medium: 'rgba(255, 107, 157, 0.2)',
          soft: 'rgba(255, 107, 157, 0.1)'
        }
      },
      blue: {
        primary: '#4ecdc4',
        shadow: {
          strong: 'rgba(78, 205, 196, 0.3)',
          medium: 'rgba(78, 205, 196, 0.2)',
          soft: 'rgba(78, 205, 196, 0.1)'
        }
      },
      green: {
        primary: '#95e77e',
        shadow: {
          strong: 'rgba(149, 231, 126, 0.3)',
          medium: 'rgba(149, 231, 126, 0.2)',
          soft: 'rgba(149, 231, 126, 0.1)'
        }
      },
      white: {
        primary: '#ffffff',
        shadow: {
          strong: 'rgba(255, 255, 255, 0.3)',
          medium: 'rgba(255, 255, 255, 0.2)',
          soft: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
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
 * ボードサイズ計算ヘルパー
 */
export const calculateBoardSize = (): { width: number; height: number } => {
  return {
    width: window.innerWidth - SCROLL_CONFIG.layout.boardPadding,
    height: window.innerHeight - SCROLL_CONFIG.layout.controlsHeight
  }
}

/**
 * 型定義のエクスポート（Tree-shaking最適化: 使用されない型を削除）
 */
// export type ScrollConfig = typeof SCROLL_CONFIG - unused
// export type ImageSize = keyof typeof SCROLL_CONFIG.sizes.image - unused  
// export type TextColor = typeof SCROLL_CONFIG.colors.text[number] - unused