# データ構造

## 基本型定義

### Position
```typescript
interface Position {
  x: number
  y: number
}
```

## スクロールアイテム型

### BaseScrollItem（基底インターフェース）
```typescript
interface BaseScrollItem {
  id: string                    // 一意のID
  position: Position            // 現在の座標
  velocity: number              // スクロール速度 (px/秒)
  zIndex: number                // 重なり順
  rotation: number              // 回転角度（度）
}
```

### ImageScrollItem
```typescript
interface ImageScrollItem extends BaseScrollItem {
  type: 'image'                 // タイプ識別子
  content: ImageContent
}

interface ImageContent {
  url: string                   // 画像URL
  title: string                 // タイトル（alt属性）
  size: 'small' | 'medium' | 'large' | 'xlarge'
}
```

### TextScrollItem
```typescript
interface TextScrollItem extends BaseScrollItem {
  type: 'text'                  // タイプ識別子
  content: TextContent
}

interface TextContent {
  text: string                  // 表示テキスト
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'white'
  fontSize: number              // フォントサイズ（em）
}
```

### ScrollItem（Union型）
```typescript
type ScrollItem = ImageScrollItem | TextScrollItem
```

## 型ガード関数

```typescript
// 画像アイテムかどうかを判定
export const isImageItem = (item: ScrollItem): item is ImageScrollItem => {
  return item.type === 'image'
}

// テキストアイテムかどうかを判定
export const isTextItem = (item: ScrollItem): item is TextScrollItem => {
  return item.type === 'text'
}
```

## 設定値の型

### ImageSize
```typescript
type ImageSize = 'small' | 'medium' | 'large' | 'xlarge'
```

### TextColor
```typescript
type TextColor = 'yellow' | 'pink' | 'blue' | 'green' | 'white'
```

## APIレスポンス型

### MediaData
```typescript
interface MediaData {
  id: string
  url: string
  title: string
  type?: 'image' | 'text'
  text?: string
}
```