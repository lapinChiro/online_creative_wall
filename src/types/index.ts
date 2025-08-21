export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/**
 * @deprecated Use ImageScrollItem from '@/types/scroll-item' instead
 * 旧実装の型定義。新規実装では scroll-item.ts の型を使用してください。
 */
export interface StickerItem {
  id: string;
  url: string;
  title: string;
  position: Position;
  size: 'size-1' | 'size-2' | 'size-3' | 'size-4';
  rotation: number;
  zIndex: number;
  scrollSpeed?: number;
}

/**
 * @deprecated Use TextScrollItem from '@/types/scroll-item' instead
 * 旧実装の型定義。新規実装では scroll-item.ts の型を使用してください。
 */
export interface ChalkTextItem {
  id: string;
  text: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'white';
  position: Position;
  fontSize: number;
  rotation: number;
  zIndex: number;
  scrollSpeed?: number;
}

/**
 * @deprecated No longer used in the refactored implementation
 * ドラッグ機能は削除されました。
 */
export interface DragState {
  isDragging: boolean;
  draggedElement: HTMLElement | null;
  offset: Position;
  currentTouch: number | null;
}

export interface BoardConfig {
  gridCols: number;
  gridRows: number;
  overlapFactor: number;
}

