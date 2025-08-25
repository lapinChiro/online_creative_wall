/**
 * ブラウザ互換性チェックユーティリティ
 * PAUSE機能で使用する主要APIの互換性を確認
 */

import { hasQuerySelector, getNavigatorVendor } from './deprecatedAPIs'

export interface BrowserCompatibilityResult {
  compatible: boolean
  features: {
    getComputedStyle: boolean
    DOMMatrix: boolean
    requestAnimationFrame: boolean
    Map: boolean
    performanceNow: boolean
    querySelector: boolean
  }
  warnings: string[]
  browserInfo: {
    userAgent: string
    vendor: string
    language: string
  }
}

/**
 * PAUSE機能で使用するブラウザAPIの互換性をチェック
 * @returns 互換性チェック結果
 */
export function checkBrowserCompatibility(): BrowserCompatibilityResult {
  const warnings: string[] = []
  
  // 各機能の存在確認
  const features = {
    getComputedStyle: typeof window !== 'undefined' && typeof window.getComputedStyle === 'function',
    DOMMatrix: typeof DOMMatrix !== 'undefined' || typeof WebKitCSSMatrix !== 'undefined',
    requestAnimationFrame: typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function',
    Map: typeof Map !== 'undefined',
    performanceNow: typeof performance !== 'undefined' && typeof performance.now === 'function',
    querySelector: hasQuerySelector()
  }
  
  // 警告メッセージの生成
  if (!features.getComputedStyle) {
    warnings.push('getComputedStyle is not supported. Position accuracy may be affected.')
  }
  
  if (!features.DOMMatrix) {
    warnings.push('DOMMatrix is not supported. Using fallback for transform matrix parsing.')
  }
  
  if (!features.requestAnimationFrame) {
    warnings.push('requestAnimationFrame is not supported. Animation may not be smooth.')
  }
  
  if (!features.Map) {
    warnings.push('Map is not supported. Position storage may not work correctly.')
  }
  
  if (!features.performanceNow) {
    warnings.push('performance.now() is not supported. Performance metrics will be unavailable.')
  }
  
  if (!features.querySelector) {
    warnings.push('querySelector is not supported. Element selection may fail.')
  }
  
  // ブラウザ情報の取得
  const browserInfo = {
    userAgent: navigator.userAgent !== '' ? navigator.userAgent : 'unknown',
    vendor: getNavigatorVendor(),
    language: navigator.language !== '' ? navigator.language : 'unknown'
  }
  
  // 全体的な互換性判定（必須機能が全て利用可能か）
  const compatible = features.getComputedStyle && 
                     features.requestAnimationFrame && 
                     features.Map && 
                     features.querySelector
  
  return {
    compatible,
    features,
    warnings,
    browserInfo
  }
}

/**
 * DOMMatrixのポリフィル（必要に応じて）
 * Safari 14以前やIE向けの互換性対応
 */
export function getDOMMatrixPolyfill(): typeof DOMMatrix {
  if (typeof DOMMatrix !== 'undefined') {
    return DOMMatrix
  }
  
  // WebKitCSSMatrixをフォールバックとして使用（Safari向け）
  interface WindowWithWebKit extends Window {
    WebKitCSSMatrix?: new (transform?: string) => { m41: number }
  }
  const windowWithWebKit = window as unknown as WindowWithWebKit
  if (typeof windowWithWebKit.WebKitCSSMatrix !== 'undefined') {
    return windowWithWebKit.WebKitCSSMatrix as unknown as typeof DOMMatrix
  }
  
  // 簡易的なポリフィル実装
  return class DOMMatrixPolyfill {
    m41: number = 0
    
    constructor(transform?: string) {
      if (transform !== undefined && transform !== '' && transform !== 'none') {
        // matrix(a, b, c, d, tx, ty) または matrix3d からtranslateXを抽出
        const match = transform.match(/matrix\(([^)]+)\)/)
        if (match !== null && match[1] !== undefined) {
          const values = match[1].split(',').map(v => parseFloat(v.trim()))
          if (values.length >= 5) {
            const translateX = values[4]
            if (translateX !== undefined && !isNaN(translateX)) {
              this.m41 = translateX // translateX
            }
          }
        }
      }
    }
  } as unknown as typeof DOMMatrix
}

/**
 * ブラウザ互換性レポートを生成
 * @returns フォーマット済みのレポート文字列
 */
export function generateCompatibilityReport(): string {
  const result = checkBrowserCompatibility()
  
  const report = [
    '=== Browser Compatibility Report for PAUSE Feature ===',
    '',
    `Overall Compatibility: ${result.compatible ? '✅ Compatible' : '❌ Not Compatible'}`,
    '',
    '--- Feature Support ---',
    `getComputedStyle: ${result.features.getComputedStyle ? '✅' : '❌'}`,
    `DOMMatrix: ${result.features.DOMMatrix ? '✅' : '❌'}`,
    `requestAnimationFrame: ${result.features.requestAnimationFrame ? '✅' : '❌'}`,
    `Map: ${result.features.Map ? '✅' : '❌'}`,
    `performance.now(): ${result.features.performanceNow ? '✅' : '❌'}`,
    `querySelector: ${result.features.querySelector ? '✅' : '❌'}`,
    '',
    '--- Browser Information ---',
    `User Agent: ${result.browserInfo.userAgent}`,
    `Vendor: ${result.browserInfo.vendor}`,
    `Language: ${result.browserInfo.language}`,
  ]
  
  if (result.warnings.length > 0) {
    report.push('', '--- Warnings ---')
    result.warnings.forEach(warning => {
      report.push(`⚠️ ${warning}`)
    })
  }
  
  report.push('', '=== End of Report ===')
  
  return report.join('\n')
}

/**
 * 最小ブラウザバージョンの確認
 * @returns サポート状況
 */
export function checkMinimumBrowserVersions(): {
  chrome: boolean
  firefox: boolean
  safari: boolean
  edge: boolean
} {
  const ua = navigator.userAgent.toLowerCase()
  
  // Chrome 90+
  const chromeMatch = ua.match(/chrome\/(\d+)/)
  const chrome = chromeMatch !== null && chromeMatch[1] !== undefined ? parseInt(chromeMatch[1]) >= 90 : false
  
  // Firefox 88+
  const firefoxMatch = ua.match(/firefox\/(\d+)/)
  const firefox = firefoxMatch !== null && firefoxMatch[1] !== undefined ? parseInt(firefoxMatch[1]) >= 88 : false
  
  // Safari 14+
  const safariMatch = ua.match(/version\/(\d+).*safari/)
  const safari = safariMatch !== null && safariMatch[1] !== undefined ? parseInt(safariMatch[1]) >= 14 : false
  
  // Edge 90+
  const edgeMatch = ua.match(/edg\/(\d+)/)
  const edge = edgeMatch !== null && edgeMatch[1] !== undefined ? parseInt(edgeMatch[1]) >= 90 : false
  
  return { chrome, firefox, safari, edge }
}