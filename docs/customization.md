# カスタマイズガイド

## デザインカスタマイズ

### 黒板の背景色変更
- **ファイル**: `src/components/BlackBoard.vue`
- **場所**: `.blackboard`のbackgroundプロパティ（65-68行目）
```css
background: #2a2d3a;  /* この色を変更 */
```

### 画像サイズの調整

#### CSSで調整
- **ファイル**: `src/components/ImageContent.vue`
- **場所**: スタイルセクション（109-128行目）
```css
.size-small { width: 100px; height: 100px; }
.size-medium { width: 120px; height: 120px; }
.size-large { width: 150px; height: 150px; }
.size-xlarge { width: 180px; height: 180px; }
```

#### 設定ファイルで調整
- **ファイル**: `src/config/scroll.config.ts`
- **場所**: sizesセクション（59-65行目）
```typescript
image: {
  small: { width: 100, height: 100 },
  medium: { width: 120, height: 120 },
  large: { width: 150, height: 150 },
  xlarge: { width: 180, height: 180 }
}
```

### チョークテキストの色追加
- **ファイル**: `src/components/TextContent.vue`
- **場所**: スタイルセクション（60-99行目）
```css
.chalk-text.color-新色名 {
  color: #カラーコード;
  text-shadow: 
    2px 2px 4px rgba(R, G, B, 0.3),
    0 0 10px rgba(R, G, B, 0.2),
    0 0 20px rgba(R, G, B, 0.1);
}
```

### 枠線（木枠）のスタイル
- **ファイル**: `src/components/BlackBoard.vue`
- **場所**: `.blackboard`のborderプロパティ（73行目）
```css
border: 15px solid #8b4513;  /* 幅と色を変更 */
```

## データソースの変更

### 環境変数でAPIエンドポイントを変更
`.env`ファイルで`VITE_MEDIA_DATA_URL`を変更

### データ処理のカスタマイズ
- **ファイル**: `src/components/CreativeWall.vue`
- **場所**: `fetchData`関数（95-126行目）

## アニメーション制御

### スクロール速度の調整
- **ファイル**: `src/composables/useScrollAnimation.ts`
- **デフォルト速度**: 50px/秒

### 初期位置の設定
- **ファイル**: `src/services/PositionService.ts`
- **場所**: `generateOffscreenPosition`関数（28-50行目）

### スクロール方向を変更
`useScrollAnimation.ts`の`direction`パラメータを`'right'`に変更

### エフェクトの追加
`src/components/ScrollItem.vue`、`ImageContent.vue`、`TextContent.vue`のCSSアニメーションを編集

## UIコントロールの調整

### 投稿数の範囲変更
- **ファイル**: `src/components/CreativeWall.vue`
- **デフォルト**: 5〜100（5刻み）

### 速度調整の範囲変更
- **ファイル**: `src/components/CreativeWall.vue`
- **デフォルト**: 10%〜150%（10%刻み）

## デバッグのヒント

### 画像が表示されない場合
1. ブラウザのコンソールでCORSエラーを確認
2. 環境変数の設定を確認
3. APIレスポンスの形式を確認

### スクロールアニメーションが動かない場合
1. requestAnimationFrameのサポートを確認
2. スクロール速度の設定を確認
3. `scroll.config.ts`の設定値を確認

### レイアウトが崩れる場合
1. ビューポートのメタタグを確認
2. CSSのbox-sizingがborder-boxになっているか確認
3. 親要素のposition設定を確認

### パフォーマンスの問題
1. `scroll.config.ts`の`maxConcurrentAnimations`を調整
2. 画像サイズを最適化
3. 遅延読み込みが機能しているか確認