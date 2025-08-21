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