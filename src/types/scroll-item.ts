import type { Position } from './index'

/**
 * スクロールアイテムの基底インターフェース
 * すべてのスクロールアイテムが共通で持つプロパティ
 */
export interface BaseScrollItem {
  /** 一意のID */
  id: string
  /** 現在の座標 */
  position: Position
  /** スクロール速度 (pixels per second) */
  velocity: number
  /** 重なり順 */
  zIndex: number
  /** 回転角度 (degrees) */
  rotation: number
}

/**
 * 画像コンテンツの型定義
 */
export interface ImageContent {
  /** 画像URL */
  url: string
  /** 画像タイトル（alt属性用） */
  title: string
  /** サイズクラス */
  size: 'small' | 'medium' | 'large' | 'xlarge'
}

/**
 * テキストコンテンツの型定義
 */
export interface TextContent {
  /** 表示テキスト */
  text: string
  /** テキストカラー */
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'white'
  /** フォントサイズ (em) */
  fontSize: number
}

/**
 * 画像スクロールアイテム
 */
export interface ImageScrollItem extends BaseScrollItem {
  /** アイテムタイプ識別子 */
  type: 'image'
  /** 画像コンテンツ */
  content: ImageContent
}

/**
 * テキストスクロールアイテム
 */
export interface TextScrollItem extends BaseScrollItem {
  /** アイテムタイプ識別子 */
  type: 'text'
  /** テキストコンテンツ */
  content: TextContent
}

/**
 * スクロールアイテムのUnion型
 */
export type ScrollItem = ImageScrollItem | TextScrollItem

/**
 * 画像アイテムかどうかを判定する型ガード
 * @param item スクロールアイテム
 * @returns 画像アイテムの場合true
 */
export const isImageItem = (item: ScrollItem): item is ImageScrollItem => {
  return item.type === 'image'
}

/**
 * テキストアイテムかどうかを判定する型ガード
 * @param item スクロールアイテム
 * @returns テキストアイテムの場合true
 */
export const isTextItem = (item: ScrollItem): item is TextScrollItem => {
  return item.type === 'text'
}

// 互換性のためのエイリアス（nullチェック付き）
export const isImageScrollItem = (item: unknown): item is ImageScrollItem => {
  return item !== null && 
    item !== undefined && 
    typeof item === 'object' && 
    'type' in item && 
    (item as Record<string, unknown>)['type'] === 'image'
}

export const isTextScrollItem = (item: unknown): item is TextScrollItem => {
  return item !== null && 
    item !== undefined && 
    typeof item === 'object' && 
    'type' in item && 
    (item as Record<string, unknown>)['type'] === 'text'
}
export const isScrollItem = (item: unknown): item is ScrollItem => {
  if (item === null || item === undefined || typeof item !== 'object') {
    return false
  }
  const obj = item as Record<string, unknown>
  
  // Check for required fields
  if (obj['type'] === undefined || obj['id'] === undefined || obj['position'] === undefined) {
    return false
  }
  
  // Check type validity
  const hasValidType = obj['type'] === 'image' || obj['type'] === 'text'
  if (!hasValidType) {
    return false
  }
  
  // Check structure validity
  const hasValidStructure = (
    typeof obj['id'] === 'string' &&
    typeof obj['position'] === 'object' &&
    obj['position'] !== null &&
    typeof (obj['position'] as Record<string, unknown>)['x'] === 'number' &&
    typeof (obj['position'] as Record<string, unknown>)['y'] === 'number' &&
    typeof obj['velocity'] === 'number' &&
    typeof obj['zIndex'] === 'number' &&
    typeof obj['rotation'] === 'number'
  )
  
  return hasValidStructure
}