# Creative Wall Vue.js アプリケーション

## 🎯 プロジェクト概要

クリエイティブウォールを再現したデジタル版インタラクティブボード。
黒板風の背景に画像やテキストがステッカーのように右から左へ自動スクロールする。

## 🤖 AI駆動開発

**このプロジェクトは全てのソースコードをClaude Codeが生成します。**

### 品質保証コマンド

```bash
# 必須チェック（CI/CDで実行）
npm run ci              # 型チェック + ビルド（必須）
npm run type-check:strict  # 型エラー0を保証
npm run build           # ビルド成功を保証

# 品質向上チェック
npm run lint            # Lintチェック（エラー削減中）
npm run test:unit       # 単体テスト（カバレッジ向上中）
npm run quality:report  # 品質状況レポート
```

### 開発時の必須ルール

1. **型エラー: 0件を維持**
2. **ビルド: 常に成功**
3. **Any型: 使用禁止**
4. **Non-null assertion(!): 使用禁止**

## 🏛 開発哲学

### UNIX Philosophy

Write programs that do one thing and do it well. Write programs to work together. Choose portability over efficiency, clarity over cleverness.

### Don't Reinvent the Wheel

Leverage existing, proven solutions before implementing custom alternatives. Research available libraries, frameworks, and tools first.

### Orthogonality Principle

Design independent, loosely coupled components where changes to one component have minimal impact on others. Maintain clear separation of concerns and avoid unexpected interdependencies.

### Type-Driven Development

Apply TDD principles to static type checking:

1. **Incremental Type Checking**: Check only implemented packages
2. **Early Error Detection**: Find type errors as you develop
3. **Progressive Integration**: Add packages to type check as they're implemented

### DRY (Don't Repeat Yourself)

Each piece of knowledge must have a single, unambiguous, authoritative representation within the system.

### KISS (Keep It Simple, Stupid)

Choose the simplest solution that fully addresses the problem. Avoid over-engineering.

### SOLID Principles

- **S**: One class, one responsibility
- **O**: Open for extension, closed for modification
- **L**: Subtypes substitutable for base types
- **I**: Many specific interfaces over one general
- **D**: Depend on abstractions, not concretions

### Test-Driven Development (t_wada's TDD)

Follow the RED-GREEN-BLUE cycle for all development:

1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **BLUE**: Refactor while keeping tests green

## 📚 ドキュメント構成

### [アーキテクチャ](./docs/architecture.md)

- プロジェクト構造
- レイヤードアーキテクチャ
- データフロー
- 依存関係

### [コンポーネント詳細](./docs/components.md)

- 主要コンポーネントの責務
- Composablesの機能
- サービス・ファクトリー層
- ストア（状態管理）

### [データ構造](./docs/data-structures.md)

- 型定義（BaseScrollItem, ImageScrollItem, TextScrollItem）
- 型ガード関数
- APIレスポンス型

### [カスタマイズガイド](./docs/customization.md)

- デザインカスタマイズ
- アニメーション制御
- デバッグのヒント

## ⚙️ 環境設定

`.env`ファイルで環境変数を設定：

```bash
# S3上のメディアデータURL
VITE_MEDIA_DATA_URL=https://your-s3-bucket.s3.amazonaws.com/path/to/media_data.json
```

`.env.example`を`.env`にコピーして使用。

## 🚀 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run preview  # プレビュー
```

## 🎮 UIコントロール

CreativeWallコンポーネント上部で以下を調整可能：

- **投稿数**: 5〜100（5刻み）
- **スクロール速度**: 10%〜150%（10%刻み）
- **テキスト表示**: ON/OFF切り替え

## 💡 主要な技術選択

- **Vue 3 Composition API**: リアクティブなUI構築
- **Pinia**: 状態管理
- **TypeScript**: 型安全性の確保
- **Factory Pattern**: オブジェクト生成の統一
- **Service Layer**: ビジネスロジックの分離

---

このドキュメントはClaude Codeが理解しやすいように構造化されています。
詳細な実装は各ドキュメントファイルと対応するソースコードを参照してください。
