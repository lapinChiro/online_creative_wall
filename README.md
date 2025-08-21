# Creative Wall Vue

クリエイティブウォールを再現したデジタル版インタラクティブボードアプリケーション。黒板風の背景に画像やテキストがステッカーのように右から左へ自動スクロールします。

## ✨ 主要機能

- 🎨 **黒板風インターフェース** - リアルな黒板のビジュアルと木枠デザイン
- 🎬 **自動スクロールアニメーション** - 画像とテキストが右から左へ流れる
- 🎮 **リアルタイムUIコントロール** - 投稿数、スクロール速度、表示内容の調整
- 📸 **画像コンテンツ** - 複数サイズ対応、遅延読み込み、ホバーエフェクト
- ✏️ **チョーク風テキスト** - 5色のカラーバリエーション、テクスチャエフェクト
- 🎯 **インタラクティブ要素** - クリックでアイテムを前面表示、フォーカスアニメーション

## 🚀 クイックスタート

### 前提条件

- Node.js 16.x以上
- npm または yarn

### セットアップ

1. **リポジトリのクローン**

```bash
git clone <repository-url>
cd creative-wall-vue
```

2. **依存関係のインストール**

```bash
npm install
```

3. **環境変数の設定**

```bash
cp .env.example .env
```

`.env`ファイルを編集して、S3上のメディアデータURLを設定：

```
VITE_MEDIA_DATA_URL=https://your-s3-bucket.s3.amazonaws.com/path/to/media_data.json
```

4. **開発サーバーの起動**

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

## 📖 使用方法

### UIコントロール

アプリケーション上部のコントロールパネルで以下を調整可能：

- **投稿数**: 5〜100件（5刻み） - 表示するアイテムの総数
- **スクロール速度**: 10%〜150%（10%刻み） - アニメーション速度の調整
- **テキスト表示**: ON/OFF - チョーク風テキストの表示切り替え

### 開発コマンド

```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview

# 型チェック
npm run type-check

# Lintチェック
npm run lint

# ユニットテスト（Vitest）
npm run test:unit

# E2Eテスト（Playwright）
npm run test:e2e
```

## 🛠 技術スタック

- **フレームワーク**: Vue 3 (Composition API)
- **言語**: TypeScript
- **状態管理**: Pinia
- **ビルドツール**: Vite
- **スタイリング**: CSS3 with Animations
- **テスト**: Vitest, Playwright
- **リンター**: ESLint

## 📁 プロジェクト構造

```
src/
├── components/          # Vueコンポーネント
│   ├── CreativeWall.vue   # メインコンテナ
│   ├── BlackBoard.vue     # 黒板UI
│   ├── ScrollItem.vue     # スクロールアイテム
│   ├── ImageContent.vue   # 画像コンテンツ
│   └── TextContent.vue    # テキストコンテンツ
├── composables/         # ビジネスロジック
│   ├── useScrollAnimation.ts
│   ├── useLazyLoad.ts
│   └── useItemManagement.ts
├── services/           # ドメインロジック
│   ├── PositionService.ts
│   └── VelocityService.ts
├── factories/          # オブジェクト生成
│   ├── ContentFactory.ts
│   └── ScrollItemFactory.ts
├── stores/            # 状態管理（Pinia）
│   └── scrollItems.ts
├── types/             # TypeScript型定義
├── config/            # 設定ファイル
└── utils/             # ユーティリティ関数
```

## 🎨 カスタマイズ

### デザインのカスタマイズ

- **黒板の背景色**: `src/components/BlackBoard.vue`
- **画像サイズ**: `src/config/scroll.config.ts`
- **チョークの色**: `src/components/TextContent.vue`
- **枠線スタイル**: `src/components/BlackBoard.vue`

### アニメーションの調整

- **スクロール速度**: `src/composables/useScrollAnimation.ts`
- **初期位置**: `src/services/PositionService.ts`
- **エフェクト**: 各コンポーネントのCSSアニメーション

詳細なカスタマイズ方法は [カスタマイズガイド](./docs/customization.md) を参照してください。

## 📚 ドキュメント

- [アーキテクチャ](./docs/architecture.md) - プロジェクト構造とデータフロー
- [コンポーネント詳細](./docs/components.md) - 各コンポーネントの役割と機能
- [データ構造](./docs/data-structures.md) - 型定義とAPIレスポンス形式
- [カスタマイズガイド](./docs/customization.md) - デザインとアニメーションのカスタマイズ

## 🔧 トラブルシューティング

### 画像が表示されない

- ブラウザコンソールでCORSエラーを確認
- `.env`ファイルの`VITE_MEDIA_DATA_URL`設定を確認
- S3バケットのCORS設定を確認

### アニメーションが動作しない

- ブラウザがrequestAnimationFrameをサポートしているか確認
- `scroll.config.ts`の設定値を確認
- スクロール速度が0%になっていないか確認

### パフォーマンスの問題

- 表示アイテム数を減らす
- 画像サイズを最適化
- `maxConcurrentAnimations`設定を調整

## 🤝 貢献

プルリクエストは歓迎します。大きな変更の場合は、まずissueを開いて変更内容について議論してください。

## 📄 ライセンス

[MIT](LICENSE)
