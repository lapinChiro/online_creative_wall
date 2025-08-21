# アーキテクチャ & プロジェクト構造

## 📁 プロジェクト構造

```
creative-wall-vue/
├── .env                            # 環境変数設定（S3 URLなど）
├── .env.example                    # 環境変数のテンプレート
├── src/
│   ├── App.vue                    # ルートコンポーネント
│   ├── components/
│   │   ├── CreativeWall.vue       # メインコンテナ（データ管理・UIコントロール）
│   │   ├── BlackBoard.vue         # 黒板UI（表示領域）
│   │   ├── ScrollItem.vue         # スクロールアイテムコンテナ
│   │   ├── ImageContent.vue       # 画像コンテンツコンポーネント
│   │   └── TextContent.vue        # チョーク風テキストコンポーネント
│   ├── composables/
│   │   ├── useScrollAnimation.ts  # スクロールアニメーション機能
│   │   ├── useLazyLoad.ts        # 画像遅延読み込み機能
│   │   └── useItemManagement.ts  # アイテム管理ロジック
│   ├── config/
│   │   └── scroll.config.ts      # スクロール設定の集約
│   ├── factories/
│   │   ├── ContentFactory.ts     # コンテンツオブジェクト生成
│   │   └── ScrollItemFactory.ts  # スクロールアイテム生成
│   ├── services/
│   │   ├── PositionService.ts    # 位置計算ロジック
│   │   └── VelocityService.ts    # 速度計算ロジック
│   ├── stores/
│   │   └── scrollItems.ts        # Piniaストア（アイテム状態管理）
│   ├── types/
│   │   ├── index.ts              # 基本型定義
│   │   └── scroll-item.ts        # スクロールアイテム型定義
│   └── utils/
│       ├── array.ts              # 配列ユーティリティ
│       └── random.ts             # ランダム値生成
```

## 🏗️ レイヤードアーキテクチャ

### プレゼンテーション層
- **components/**: Vue.jsコンポーネント
  - UI表示とユーザーインタラクション
  - ScrollItem.vueが共通コンテナとして機能
  - ImageContent/TextContentが特化した表示を担当

### アプリケーション層
- **composables/**: ビジネスロジックのカプセル化
  - useScrollAnimation: アニメーション制御
  - useLazyLoad: パフォーマンス最適化
  - useItemManagement: アイテム操作

### ドメイン層
- **services/**: ドメインロジック
  - PositionService: 位置計算
  - VelocityService: 速度計算
- **factories/**: オブジェクト生成パターン
  - 一貫性のあるオブジェクト生成
  - デフォルト値の管理

### インフラストラクチャ層
- **stores/**: 状態管理（Pinia）
- **config/**: 設定値の集約
- **utils/**: 汎用ユーティリティ

## 🔄 データフロー

```
外部API → CreativeWall → Factory → Store → ScrollItem → Content Components
                ↑                      ↓
            UIControls ← useScrollAnimation
```

## 📦 依存関係の方向

- コンポーネント → Composables → Services/Factories
- すべての層 → Types（共通型定義）
- Services/Factories → Config（設定値）