/**
 * 非推奨APIのラッパーユーティリティ
 * ブラウザ互換性チェックで必要な非推奨APIを一元管理
 * これらのAPIは将来的に代替手段に置き換える必要がある
 */

/* eslint-disable @typescript-eslint/no-deprecated */

/**
 * document.querySelector のラッパー
 * 将来的に代替手段への移行が必要
 * @deprecated 
 */
export function getQuerySelectorFunction(): typeof document.querySelector | undefined {
  if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
    return document.querySelector.bind(document)
  }
  return undefined
}

/**
 * navigator.vendor のラッパー
 * ブラウザベンダー情報の取得（非推奨）
 */
export function getNavigatorVendor(): string {
  // vendorプロパティの存在をチェック
  if ('vendor' in navigator && typeof (navigator as Navigator & { vendor: unknown }).vendor === 'string') {
    return (navigator as Navigator & { vendor: string }).vendor
  }
  return 'unknown'
}

/**
 * navigator.platform のラッパー
 * プラットフォーム情報の取得（非推奨）
 * @deprecated
 */
export function getNavigatorPlatform(): string {
  // platformプロパティの存在をチェック
  if ('platform' in navigator && typeof (navigator as Navigator & { platform: unknown }).platform === 'string') {
    return (navigator as Navigator & { platform: string }).platform
  }
  return 'unknown'
}

/**
 * querySelector互換性チェック
 */
export function hasQuerySelector(): boolean {
  return typeof document !== 'undefined' && typeof document.querySelector === 'function'
}

/* eslint-enable @typescript-eslint/no-deprecated */