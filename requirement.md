# Creative Wall PAUSE機能 要件定義書

## 1. 機能概要
ユーザーが画像・テキストの自動スクロールを一時停止/再開できる機能

## 2. 前提条件
- Creative Wallアプリケーションが起動している
- 少なくとも1つのスクロールアイテムが存在する
- ブラウザがJavaScriptを有効にしている

## 3. EARS形式による要件定義

### 3.1 基本要件 (Ubiquitous Requirements)

**UBI-001**: システムは、isPausedブール値としてPAUSE機能の状態（true=一時停止中/false=再生中）をPiniaストアに常に保持しなければならない

**UBI-002**: システムは、PAUSEボタンのアイコン表示（一時停止中："mdi-play"/再生中："mdi-pause"）により常にPAUSE状態の視覚的フィードバックを提供しなければならない

### 3.2 イベント駆動要件 (Event-driven Requirements)

**EVT-001**: WHEN PAUSEボタン(id="pause-button")がクリックされ、かつisPaused=false、システムは50ms以内に全てのスクロールアイテムのCSSプロパティ「animation-play-state」を「paused」に設定しなければならない

**EVT-002**: WHEN PAUSEボタン(id="pause-button")がクリックされ、かつisPaused=true、システムは50ms以内に全てのスクロールアイテムのCSSプロパティ「animation-play-state」を「running」に設定しなければならない

**EVT-003**: WHEN キーボードのスペースキー(keyCode=32)が押下され、かつフォーカスがテキスト入力フィールドにない、システムはPAUSEボタンのクリックイベントをトリガーしなければならない

**EVT-004**: WHEN isPausedがfalseからtrueに遷移、システムは各スクロールアイテムのtransform:translateX()の現在値をMap<string, number>形式でメモリに保存しなければならない

**EVT-005**: WHEN isPausedがtrueからfalseに遷移、システムは保存されたtranslateX値から各アイテムのアニメーションを再開しなければならない

### 3.3 状態駆動要件 (State-driven Requirements)

**STA-001**: WHILE isPaused=true、全てのスクロールアイテムのCSSプロパティ「animation-play-state」は「paused」でなければならない

**STA-002**: WHILE isPaused=true、PAUSEボタンのアイコンクラスは「mdi-play」でなければならない

**STA-003**: WHILE isPaused=false、PAUSEボタンのアイコンクラスは「mdi-pause」でなければならない

**STA-004**: WHILE isPaused=true、新規追加されたスクロールアイテムの初期「animation-play-state」は「paused」でなければならない

### 3.4 オプション要件 (Optional Requirements)

**OPT-001**: WHERE ユーザー設定で「pauseOverlay」がtrueの場合、システムはisPaused=true時に背景に「rgba(0,0,0,0.3)」のオーバーレイを表示しなければならない

**OPT-002**: WHERE ユーザー設定で「transitionEnabled」がtrueの場合、システムはisPaused切り替え時に200msのフェード効果を適用しなければならない

**OPT-003**: WHERE isPaused=trueの場合、システムはスクロールアイテムのポインターイベントを有効化し、ホバー時にopacity:0.8を適用しなければならない

### 3.5 複雑な要件 (Complex Requirements)

**CPX-001**: WHEN PAUSEボタンがクリックされ、かつisPaused=false、THEN システムは以下の順序で実行しなければならない：
1. isPausedをtrueに設定（5ms以内）
2. 全スクロールアイテムのanimation-play-stateを「paused」に設定（20ms以内）
3. 各アイテムのtranslateX値をMap形式で保存（10ms以内）
4. PAUSEボタンアイコンを「mdi-play」に変更（5ms以内）
5. IF transitionEnabled=true THEN 200msのフェード効果を適用

**CPX-002**: WHEN 速度調整スライダーの値が変更され、かつisPaused=true、THEN システムはspeedMultiplier値を更新するが、animation-play-stateは「paused」を維持しなければならない

## 4. 非機能要件

### 4.1 パフォーマンス要件

**PER-001**: PAUSEボタンクリックから全アニメーション停止までの総実行時間は50ms未満でなければならない

**PER-002**: isPaused=true時のメモリ使用量はisPaused=false時の±5%以内でなければならない

**PER-003**: 100個のスクロールアイテムの一時停止/再開操作は60fpsを維持しなければならない

### 4.2 ユーザビリティ要件

**USA-001**: PAUSEボタンはコントロールパネル内で速度調整スライダーの左側または右側に配置され、最小サイズ44x44pxでなければならない

**USA-002**: isPaused状態はアイコン変更およびaria-pressed属性により識別可能でなければならない

**USA-003**: スペースキー(keyCode=32)はpreventDefault()を呼びページスクロールを防ぎ、PAUSE機能のみをトリガーしなければならない

### 4.3 互換性要件

**COM-001**: speedMultiplier値の変更はisPaused状態に影響を与えてはならない

**COM-002**: showTextフラグの変更はisPaused状態に影響を与えてはならない

**COM-003**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+で動作しなければならない

## 5. 実装詳細

### 5.1 状態管理
```typescript
interface PauseState {
  isPaused: boolean;
  pausedPositions: Map<string, number>; // itemId -> translateX value
  pauseTimestamp: number | null;
}
```

### 5.2 CSSクラス名
- 一時停止ボタン: `.pause-button` (id="pause-button")
- 一時停止中アイテム: `.scroll-item.paused`
- オーバーレイ: `.pause-overlay`

### 5.3 アイコン仕様
- 一時停止アイコン: `mdi-pause` (24x24px)
- 再生アイコン: `mdi-play` (24x24px)
- 色: currentColor (コントロールパネルのテキスト色を継承)

### 5.4 アクセシビリティ
- role="button"
- aria-pressed="true/false"
- aria-label="一時停止" / "再生"
- tabindex="0"

## 6. 受け入れ基準

### 6.1 機能テスト
| ID | テスト項目 | 期待結果 | 判定基準 |
|----|---------|--------|--------|
| AC-001 | PAUSEボタンクリック | 全スクロール停止 | 50ms以内に停止 |
| AC-002 | 再生ボタンクリック | 停止位置から再開 | 位置のズレが±5px以内 |
| AC-003 | スペースキー押下 | PAUSE/再生切り替え | ボタンクリックと同一動作 |
| AC-004 | アイコン表示 | 状態に応じたアイコン | mdi-pause/mdi-playが正確 |
| AC-005 | 速度調整との共存 | 独立動作 | 相互干渉なし |
| AC-006 | テキスト表示との共存 | 独立動作 | 相互干渉なし |

### 6.2 技術テスト
| ID | テスト項目 | 判定基準 |
|----|---------|--------|
| TC-001 | TypeScript型チェック | エラー0件 |
| TC-002 | ビルド | npm run build成功 |
| TC-003 | パフォーマンス | 60fps維持 |

## 7. リスクと緩和策

| リスクID | リスク内容 | 発生確率 | 影響度 | 緩和策 | 検証方法 |
|---------|---------|--------|--------|------|--------|
| R-001 | translateX位置のずれ | 低 | 中 | getComputedStyleで正確な値を取得 | ±5px以内を検証 |
| R-002 | メモリリーク | 極低 | 高 | WeakMap使用、不要な参照をクリア | Chrome DevToolsで監視 |
| R-003 | イベント競合 | 低 | 中 | デバウンス処理(50ms) | 連打テスト |

## 8. 今後の拡張可能性

### 8.1 段階的実装
| フェーズ | 機能 | 優先度 |
|----------|------|--------|
| Phase 1 | 基本PAUSE機能 | 必須 |
| Phase 2 | ホバー効果・オーバーレイ | 中 |
| Phase 3 | アイテムクリック詳細表示 | 低 |
| Phase 4 | 自動一時停止 | 低 |

## 9. 事後条件
- isPaused状態が正しく更新されている
- 全アイテムのanimation-play-stateが適切に設定されている  
- ボタンアイコンが状態を反映している
- ユーザーが次のアクションを実行可能