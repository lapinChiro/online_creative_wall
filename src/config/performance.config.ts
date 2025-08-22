/**
 * パフォーマンス最適化のFeature Flags設定
 * 各最適化機能を段階的に有効化するための設定
 */
import { createLogger } from '@/utils/logger'

const logger = createLogger('PerformanceConfig')

export interface PerformanceFlags {
  USE_OBJECT_POOL: boolean      // Phase 1: オブジェクトプール使用
  USE_CSS_VARIABLES: boolean     // Phase 1: CSS Variables最適化
  USE_VIRTUAL_SCROLL: boolean    // Phase 2: Virtual Scrolling
  USE_WEB_WORKER: boolean        // Phase 3: Web Worker使用
  USE_MEMORY_OPT: boolean        // Phase 2: メモリ最適化
  USE_DYNAMIC_IMPORT: boolean    // Phase 3: Dynamic Import
  DEBUG_MODE: boolean            // デバッグモード（統計情報出力）
}

/**
 * 環境変数から設定を読み込み
 * 本番環境では全機能有効、開発環境では段階的に有効化
 */
const isDevelopment = import.meta.env.DEV

/**
 * デフォルトのFeature Flags設定
 */
export const PERFORMANCE_FLAGS: PerformanceFlags = {
  // Phase 1: 完了済み機能（常に有効）
  USE_OBJECT_POOL: true,        // オブジェクトプール実装済み
  USE_CSS_VARIABLES: true,      // CSS Variables実装済み
  
  // Phase 2: 完了済み機能（常に有効）
  USE_VIRTUAL_SCROLL: true,     // Virtual Scrolling実装済み
  USE_MEMORY_OPT: true,         // メモリ最適化実装済み
  
  // Phase 3: 実装中の機能（開発環境でテスト可能）
  USE_WEB_WORKER: isDevelopment ? Boolean(import.meta.env['VITE_USE_WEB_WORKER'] ?? false) : false,
  USE_DYNAMIC_IMPORT: false,    // 未実装
  
  // デバッグモード（開発環境のみ）
  DEBUG_MODE: isDevelopment
}

/**
 * Feature Flagsの状態を取得
 */
export function getPerformanceFlags(): PerformanceFlags {
  return { ...PERFORMANCE_FLAGS }
}

/**
 * 特定のFeature Flagを更新（開発用）
 */
export function updatePerformanceFlag(flag: keyof PerformanceFlags, value: boolean): void {
  if (isDevelopment) {
    PERFORMANCE_FLAGS[flag] = value
    logger.info(`${flag} = ${String(value)}`)
  }
}

/**
 * 全Feature Flagsの状態をコンソールに出力
 */
export function logPerformanceFlags(): void {
  logger.group('Current Feature Flags')
  Object.entries(PERFORMANCE_FLAGS).forEach(([key, value]) => {
    logger.info(`${key}: ${String(value)}`)
  })
  logger.groupEnd()
}

/**
 * パフォーマンス設定のサマリーを取得
 */
export function getPerformanceSummary(): string {
  const enabledFeatures = Object.entries(PERFORMANCE_FLAGS)
    .filter(([_, value]) => value === true)
    .map(([key]) => key)
  
  return `Enabled: ${enabledFeatures.join(', ')}`
}

// 開発環境では起動時にFeature Flagsを出力
if (isDevelopment) {
  logger.info('Initializing with flags:', PERFORMANCE_FLAGS)
}