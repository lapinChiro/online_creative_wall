/**
 * ロギングユーティリティ
 * AI駆動開発のためのログ出力を一元管理
 * このファイルのみでconsoleを使用し、他の場所ではこのロガーを使用する
 */

/* eslint-disable no-console */

// type LogLevel = 'debug' | 'info' | 'warn' | 'error' // 将来的に使用予定

// Vite環境チェック用の型ガード
function hasViteEnv(meta: ImportMeta): meta is ImportMeta & { env: { DEV: boolean } } {
  return 'env' in meta && typeof (meta as { env?: { DEV?: boolean } }).env?.DEV === 'boolean'
}

// 環境判定の明確な分離
function isDevelopmentEnvironment(): boolean {
  // ブラウザ環境（Vite）
  if (typeof import.meta !== 'undefined' && hasViteEnv(import.meta)) {
    return import.meta.env.DEV
  }
  
  // Node.js環境（テスト等）
  if (typeof process !== 'undefined') {
    return process.env['NODE_ENV'] === 'development'
  }
  
  return false
}

class Logger {
  private isDevelopment: boolean
  private prefix: string

  constructor(prefix = '') {
    this.prefix = prefix
    this.isDevelopment = isDevelopmentEnvironment()
  }

  /**
   * デバッグログ出力
   * 開発環境でのみ出力される
   */
  debug(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('DEBUG'), ...args)
    }
  }

  /**
   * 情報ログ出力
   * 開発環境でのみ出力される
   */
  info(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('INFO'), ...args)
    }
  }

  /**
   * 警告ログ出力
   * 常に出力される
   */
  warn(...args: unknown[]): void {
    console.warn(this.formatMessage('WARN'), ...args)
  }

  /**
   * エラーログ出力
   * 常に出力される
   */
  error(...args: unknown[]): void {
    console.error(this.formatMessage('ERROR'), ...args)
  }

  /**
   * グループログ開始
   * 開発環境でのみ有効
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(this.formatMessage('GROUP'), label)
    }
  }

  /**
   * グループログ終了
   * 開発環境でのみ有効
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }

  /**
   * メッセージフォーマット
   * プレフィックスがある場合は含める
   */
  private formatMessage(level: string): string {
    const timestamp = new Date().toISOString().substring(11, 19)
    const prefix = this.prefix !== '' ? `[${this.prefix}]` : ''
    return `[${timestamp}] ${prefix}[${level}]`
  }

  /**
   * 特定のプレフィックスを持つロガーを作成
   */
  withPrefix(prefix: string): Logger {
    return new Logger(prefix)
  }
}

// デフォルトのロガーインスタンス
export const logger = new Logger()

// 特定モジュール用のロガー作成関数
export function createLogger(prefix: string): Logger {
  return new Logger(prefix)
}

// E2Eテスト用のログ関数（テスト環境でも出力）
export function testLog(...args: unknown[]): void {
  // テスト環境では常にログを出力
  console.log('[TEST]', ...args)
}

/* eslint-enable no-console */