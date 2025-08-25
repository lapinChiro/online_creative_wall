# Creative Wall PAUSE機能 開発タスク一覧

## タスク概要
- **総タスク数**: 14タスク
- **Phase 1 (必須)**: 6タスク
- **Phase 2 (推奨)**: 5タスク  
- **Phase 3 (オプション)**: 3タスク
- **総見積時間**: 約28時間

## Phase 1: 基本機能実装（必須）

### TASK-001: Piniaストアの拡張
**優先度**: 高  
**見積時間**: 2時間

#### 概要
scrollItems.tsストアにPAUSE機能用の状態管理を追加する

#### 事前条件
- src/stores/scrollItems.tsファイルが存在すること
- Piniaストアの基本構造を理解していること

#### 実装内容
1. 状態の追加
   ```typescript
   const isPaused = ref(false)
   const pausedPositions = ref(new Map<string, number>())  // itemId -> translateX値
   const pauseTimestamp = ref<number | null>(null)
   ```

2. アクションの追加
   - `setIsPaused(paused: boolean): void`
   - `togglePause(): void`
   - `getPausedPositionX(id: string): number | undefined`

3. エクスポートに追加
   - State: isPaused, pausedPositions, pauseTimestamp
   - Actions: setIsPaused, togglePause, getPausedPositionX

#### 完了要件
- [ ] isPausedブール値が正しく管理される（UBI-001）
- [ ] pausedPositionsがMap<string, number>形式で実装される（EVT-004）
- [ ] setIsPaused(true)時に全アイテムのx座標が保存される
- [ ] setIsPaused(false)時にタイムスタンプがクリアされる
- [ ] TypeScript型エラーが0件
- [ ] 既存の機能に影響がない

#### 依存関係
- なし（最初に実装）

#### 関連要件
- UBI-001: isPausedブール値管理
- EVT-004: Map<string, number>での位置保存
- COM-001: speedMultiplierと独立
- COM-002: showTextsと独立

#### テスト項目
```typescript
// 実装後、以下のテストが通ること
it('setIsPausedがtrueで位置を保存する')
it('togglePauseが状態を切り替える')
it('getPausedPositionXが正しい値を返す')
```

---

### TASK-002: usePauseControl Composableの実装
**優先度**: 高  
**見積時間**: 3時間

#### 概要
PAUSE機能の制御ロジックをComposableとして実装する

#### 事前条件
- TASK-001が完了していること
- src/composablesディレクトリが存在すること
- animationControllerインターフェースを理解していること

#### 実装内容
1. src/composables/usePauseControl.tsファイルを新規作成

2. インターフェース定義
   ```typescript
   export interface UsePauseControlReturn {
     isPaused: ReturnType<typeof computed<boolean>>
     pauseIcon: ReturnType<typeof computed<string>>
     togglePause: () => void
     pause: () => void
     resume: () => void
   }
   ```

3. 実装する機能
   - pause(): 5ms以内にisPaused設定、20ms以内にアニメーション停止（CPX-001）
   - resume(): 保存位置から再開（EVT-005）
   - togglePause(): pause/resumeの切り替え
   - キーボードイベント処理（スペースキー）

4. パフォーマンス測定（開発環境のみ）
   ```typescript
   if (import.meta.env.DEV) {
     console.assert(elapsed < 50, `PAUSE処理が${elapsed}ms`)
   }
   ```

#### 完了要件
- [ ] PAUSEボタンアイコンが'mdi-play'/'mdi-pause'で切り替わる（UBI-002）
- [ ] スペースキーでトグル可能（EVT-003, USA-003）
- [ ] テキスト入力フィールドではスペースキーが無効
- [ ] 総実行時間が50ms未満（PER-001）
- [ ] TypeScript型エラーが0件

#### 依存関係
- TASK-001: Piniaストアの拡張

#### 関連要件
- UBI-002: アイコン表示
- EVT-003: スペースキー対応
- EVT-005: 位置から再開
- CPX-001: 順序処理と時間要件
- PER-001: 50ms未満の応答
- USA-003: preventDefault実行

#### テスト項目
```typescript
it('pause()が50ms以内に完了する')
it('スペースキーでトグルする')
it('入力フィールドではスペースキーが無効')
```

---

### TASK-003: UIボタンの追加
**優先度**: 高  
**見積時間**: 2時間

#### 概要
CreativeWall.vueにPAUSEボタンUIを追加する

#### 事前条件
- TASK-002が完了していること
- @mdi/fontパッケージがインストール済みであること
- src/components/CreativeWall.vueが存在すること

#### 実装内容
1. template部分に追加
   ```vue
   <button 
     id="pause-button"
     class="pause-button"
     :aria-pressed="pauseControl.isPaused.value"
     :aria-label="pauseControl.isPaused.value ? '再生' : '一時停止'"
     @click="pauseControl.togglePause"
   >
     <i :class="pauseControl.pauseIcon.value" />
   </button>
   ```

2. script部分に追加
   ```typescript
   import { usePauseControl } from '@/composables/usePauseControl'
   const pauseControl = usePauseControl(animationController)
   ```

3. style部分に追加
   - 44x44pxサイズ（USA-001）
   - aria-pressed="true"時の背景色変更
   - ホバー/アクティブ状態のスタイル

4. アクセシビリティ属性の追加（5.4節）
   - tabindex="0"を必ず設定
   - role="button"を設定（必要に応じて）

#### 完了要件
- [ ] ボタンのid="pause-button"が設定される
- [ ] ボタンサイズが44x44pxである（USA-001）
- [ ] aria-pressed/aria-label属性が正しく設定される（USA-002）
- [ ] tabindex="0"が設定される（5.4節）
- [ ] アイコンクラスが動的に切り替わる
- [ ] 速度調整スライダーの左側または右側に配置される（USA-001）
- [ ] CSSスタイルが適用される

#### 依存関係
- TASK-002: usePauseControl Composableの実装

#### 関連要件
- USA-001: ボタン配置とサイズ
- USA-002: アクセシビリティ属性
- 5.3節: アイコン仕様（mdi-pause/mdi-play）
- 5.4節: アクセシビリティ要件

#### テスト項目
```typescript
// E2Eテスト
it('PAUSEボタンが表示される')
it('クリックでアイコンが切り替わる')
it('aria属性が正しく設定される')
```

---

### TASK-004: アニメーション制御の修正
**優先度**: 高  
**見積時間**: 3時間

#### 概要
useScrollAnimation.tsとuseScrollAnimationWorker.tsを修正してPAUSE対応する

#### 事前条件
- TASK-001が完了していること
- src/composables/useScrollAnimation.tsが存在すること
- src/composables/useScrollAnimationWorker.ts（存在する場合）

#### 実装内容
1. useScrollAnimation.tsの修正
   ```typescript
   const animate = (currentTime: number): void => {
     if (!isRunning.value || store.isPaused) {
       animationFrameId = requestAnimationFrame(animate)
       return
     }
     // 既存のロジック
   }
   
   const start = (): void => {
     if (!isRunning.value && !store.isPaused) {
       // 開始処理
     }
   }
   ```

2. useScrollAnimationWorker.tsの修正（存在する場合）
   - 同様のPAUSE判定を追加

3. CreativeWall.vueのonMounted修正
   ```typescript
   if (!scrollItemsStore.isPaused) {
     animationController.start()
   }
   ```

#### 完了要件
- [ ] isPaused=true時にアニメーションが停止する
- [ ] isPaused=false時に位置更新が再開される
- [ ] requestAnimationFrameループは継続する（位置更新のみスキップ）
- [ ] Worker版も同様に動作する（存在する場合）
- [ ] 60fpsが維持される（PER-003）

#### 依存関係
- TASK-001: Piniaストアの拡張

#### 関連要件
- EVT-001/002: アニメーション停止/再開（RAF制御で実装）
- STA-001: 停止状態の維持
- PER-003: 60fps維持

#### テスト項目
```typescript
it('isPaused=true時に位置が更新されない')
it('isPaused=false時に位置更新が再開される')
it('パフォーマンスが60fpsを維持する')
```

---

### TASK-005: 新規アイテム追加時の処理
**優先度**: 中  
**見積時間**: 2時間

#### 概要
PAUSE中に追加されるアイテムを停止状態で追加する処理を実装

#### 事前条件
- TASK-001が完了していること
- src/factories/ScrollItemFactory.tsが存在すること

#### 実装内容
1. ScrollItemFactory.tsの修正
   ```typescript
   createImageItem(data: FetchedImage, index: number, baseVelocity: number): ScrollItem {
     const store = useScrollItemsStore()
     const item = { /* 既存ロジック */ }
     
     // STA-004: PAUSE中の新規アイテムは停止状態
     if (store.isPaused) {
       store.pausedPositions.set(item.id, item.position.x)
     }
     
     return item
   }
   ```

2. createTextItemメソッドも同様に修正

#### 完了要件
- [ ] PAUSE中に追加されたアイテムが動かない（STA-004）
- [ ] 新規アイテムの位置がpausedPositionsに保存される
- [ ] PAUSE解除後に他のアイテムと同期して動き始める
- [ ] 既存の動作に影響がない

#### 依存関係
- TASK-001: Piniaストアの拡張

#### 関連要件
- STA-004: 新規アイテムの初期状態

#### テスト項目
```typescript
it('PAUSE中に追加したアイテムが停止状態になる')
it('PAUSE解除後に新規アイテムも動き始める')
```

---

### TASK-006: 速度調整時の処理
**優先度**: 中  
**見積時間**: 1時間

#### 概要
PAUSE中の速度調整が独立して動作することを保証する

#### 事前条件
- TASK-001が完了していること
- src/components/CreativeWall.vueのupdateGlobalSpeed関数が存在すること

#### 実装内容
1. CreativeWall.vueのupdateGlobalSpeed修正
   ```typescript
   const updateGlobalSpeed = (): void => {
     // CPX-002: PAUSE中も速度は更新するがアニメーションは開始しない
     velocityService.setGlobalMultiplier(scrollItemsStore.globalVelocity)
     scrollItemsStore.updateAllVelocities(velocityService)
     
     // PAUSE中は再開しない
     if (!scrollItemsStore.isPaused) {
       // アニメーション中のみ速度変更を適用
     }
   }
   ```

2. ストア側の独立性確認
   - updateGlobalVelocityがisPausedに触れない（COM-001）
   - toggleTextsがisPausedに触れない（COM-002）

#### 完了要件
- [ ] PAUSE中に速度調整してもアニメーションが開始されない（CPX-002）
- [ ] 速度値は正しく更新される
- [ ] PAUSE解除後に新しい速度で動作する
- [ ] 速度調整とPAUSE機能が独立している（COM-001）

#### 依存関係
- TASK-001: Piniaストアの拡張

#### 関連要件
- CPX-002: PAUSE中の速度調整
- COM-001: speedMultiplier独立性
- COM-002: showTexts独立性

#### テスト項目
```typescript
it('PAUSE中の速度変更でアニメーションが開始されない')
it('速度変更がisPausedに影響しない')
it('isPaused変更が速度に影響しない')
```

---

## Phase 2: 品質向上（推奨）

### TASK-007: 単体テストの実装
**優先度**: 中  
**見積時間**: 3時間

#### 概要
PAUSE機能の単体テストを実装する

#### 事前条件
- Phase 1の全タスクが完了していること
- Vitestがセットアップ済みであること

#### 実装内容
1. src/stores/__tests__/scrollItems.spec.tsに追加
   - setIsPausedのテスト
   - togglePauseのテスト
   - getPausedPositionXのテスト

2. src/composables/__tests__/usePauseControl.spec.tsを新規作成
   - pause/resume/togglePauseのテスト
   - キーボードイベントのテスト
   - パフォーマンステスト（50ms以内）

#### 完了要件
- [ ] カバレッジ80%以上
- [ ] 全テストがパスする
- [ ] 50ms以内の処理時間を検証するテストが含まれる

#### 依存関係
- Phase 1の全タスク

#### 関連要件
- 6.1節: 機能テスト項目
- PER-001: 50ms未満の処理時間

#### テスト項目
設計書の4.1節参照

---

### TASK-008: E2Eテストの実装
**優先度**: 中  
**見積時間**: 3時間

#### 概要
PAUSE機能のE2Eテストを実装する

#### 事前条件
- Phase 1の全タスクが完了していること
- Playwrightがセットアップ済みであること

#### 実装内容
1. e2e/pause.spec.tsを新規作成
   - PAUSEボタンクリックテスト
   - スペースキーテスト
   - 位置保持テスト
   - アイコン切り替えテスト

#### 完了要件
- [ ] AC-001〜006の受け入れ基準を全て検証
- [ ] 位置のズレが±5px以内であることを検証
- [ ] 全テストがパスする

#### 依存関係
- Phase 1の全タスク

#### 関連要件
- 6.1節: 機能テスト（AC-001〜006）
- 設計書4.2節: E2Eテスト

#### テスト項目
設計書の4.2節参照

---

### TASK-009: パフォーマンス計測とリスク対策
**優先度**: 中  
**見積時間**: 2時間

#### 概要
パフォーマンス計測の実装とリスク対策を実装する

#### 事前条件
- Phase 1の全タスクが完了していること

#### 実装内容
1. R-001対策: getComputedStyleで正確な値取得
   ```typescript
   function savePositions(): void {
     items.value.forEach(item => {
       const element = document.querySelector(`[data-item-id="${item.id}"]`)
       if (element) {
         const computed = window.getComputedStyle(element)
         const matrix = new DOMMatrix(computed.transform)
         pausedPositions.value.set(item.id, matrix.m41)
       }
     })
   }
   ```

2. R-002対策: メモリリーク防止
   - removeItem時にpausedPositionsからも削除

3. R-003対策: デバウンス処理（オプション）
   - lodash-esのdebounce使用

4. パフォーマンスログ実装
   ```typescript
   logger.debug('PAUSE toggled', {
     isPaused: store.isPaused,
     itemCount: store.items.length,
     elapsed: performance.now() - startTime
   })
   ```

#### 完了要件
- [ ] 位置のズレが±5px以内（R-001）
- [ ] メモリリークが発生しない（R-002）
- [ ] 連打してもエラーが発生しない（R-003）
- [ ] パフォーマンスログが出力される

#### 依存関係
- Phase 1の全タスク

#### 関連要件
- R-001〜003: リスク対策
- PER-002: メモリ使用量
- 10.1節: 監視項目

#### テスト項目
```typescript
it('getComputedStyleで正確な位置を取得する')
it('アイテム削除時にMapからも削除される')
it('連続クリックでもエラーが発生しない')
```

---

### TASK-013: ブラウザ互換性テスト
**優先度**: 高  
**見積時間**: 2時間

#### 概要
各ブラウザでPAUSE機能が正しく動作することを確認する

#### 事前条件
- Phase 1の全タスクが完了していること
- 各ブラウザの最新版がインストール済みであること

#### 実装内容
1. 以下のブラウザでテスト実施
   - Chrome 90以上
   - Firefox 88以上  
   - Safari 14以上
   - Edge 90以上

2. テスト項目
   - PAUSEボタンの動作
   - スペースキーの動作
   - アニメーション停止/再開
   - アイコン表示
   - アクセシビリティ属性

3. 不具合が見つかった場合
   - ブラウザ固有の対応を実装
   - ポリフィルの追加（必要に応じて）

#### 完了要件
- [ ] Chrome 90+で全機能が動作する（COM-003）
- [ ] Firefox 88+で全機能が動作する（COM-003）
- [ ] Safari 14+で全機能が動作する（COM-003）
- [ ] Edge 90+で全機能が動作する（COM-003）
- [ ] ブラウザ固有の不具合が解消されている

#### 依存関係
- Phase 1の全タスク

#### 関連要件
- COM-003: ブラウザ互換性

#### テスト項目
```typescript
// 各ブラウザで手動テスト
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
browsers.forEach(browser => {
  console.log(`Testing in ${browser}...`)
  // AC-001〜006の全項目をテスト
})
```

---

### TASK-014: 統合テストと最終確認
**優先度**: 高  
**見積時間**: 2時間

#### 概要
全機能の統合テストを実施し、事後条件を満たすことを確認する

#### 事前条件
- Phase 1の全タスクが完了していること
- TASK-007〜009が完了していること

#### 実装内容
1. 統合テストシナリオの実施
   ```typescript
   // e2e/integration.spec.ts
   test('統合シナリオ: 完全な操作フロー', async ({ page }) => {
     // 1. アプリケーション起動
     // 2. PAUSE機能の一連の操作
     // 3. 速度調整との組み合わせ
     // 4. テキスト表示切り替えとの組み合わせ
     // 5. 新規アイテム追加
     // 6. 長時間動作確認
   })
   ```

2. 事後条件の確認
   - isPaused状態が正しく更新されている
   - 全アイテムのanimation-play-state（RAF制御）が適切
   - ボタンアイコンが状態を反映している
   - ユーザーが次のアクションを実行可能

3. 最終ビルド確認
   ```bash
   npm run ci  # TypeScript型チェック + ビルド
   npm run test:unit
   npm run test:e2e
   ```

#### 完了要件
- [ ] 統合シナリオが全てパスする
- [ ] isPaused状態が正しく管理される（事後条件）
- [ ] アイコンが状態を正しく反映する（事後条件）
- [ ] TypeScript型エラーが0件（TC-001）
- [ ] npm run buildが成功する（TC-002）
- [ ] 60fpsが維持される（TC-003）
- [ ] ユーザーが全ての操作を問題なく実行できる（事後条件）

#### 依存関係
- Phase 1の全タスク
- TASK-007〜009

#### 関連要件
- 9節: 事後条件
- TC-001〜003: 技術テスト
- 全受け入れ基準（AC-001〜006）

#### テスト項目
```typescript
it('全ての事後条件を満たす')
it('TypeScript型エラーが0件')
it('ビルドが成功する')
it('パフォーマンス要件を満たす')
```

---

## Phase 3: 拡張機能（オプション）

### TASK-010: オーバーレイ表示機能
**優先度**: 低  
**見積時間**: 2時間

#### 概要
PAUSE時に半透明オーバーレイを表示する機能を実装

#### 事前条件
- Phase 1の全タスクが完了していること
- pauseOverlayユーザー設定が実装済み（または固定値で実装）

#### 実装内容
1. BlackBoard.vueに追加
   ```vue
   <div v-if="store.isPaused && pauseOverlay" class="pause-overlay" />
   ```

2. CSSスタイル追加
   ```css
   .pause-overlay {
     position: absolute;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background: rgba(0, 0, 0, 0.3);
     pointer-events: none;
     z-index: 9999;
   }
   ```

#### 完了要件
- [ ] pauseOverlay=true時にオーバーレイが表示される（OPT-001）
- [ ] 背景色がrgba(0,0,0,0.3)である
- [ ] pointer-events: noneでクリックが透過する

#### 依存関係
- Phase 1の全タスク

#### 関連要件
- OPT-001: オーバーレイ表示

---

### TASK-011: トランジション効果
**優先度**: 低  
**見積時間**: 1時間

#### 概要
PAUSE切り替え時のトランジション効果を実装

#### 事前条件
- Phase 1の全タスクが完了していること
- transitionEnabledユーザー設定が実装済み（または固定値で実装）

#### 実装内容
1. PAUSEボタンのCSS修正
   ```css
   .pause-button {
     transition: all 200ms ease;
   }
   ```

2. 条件付き適用（オプション）
   - transitionEnabled=true時のみ適用

#### 完了要件
- [ ] 200msのフェード効果が適用される（OPT-002）
- [ ] トランジションがスムーズに動作する

#### 依存関係
- TASK-003: UIボタンの追加

#### 関連要件
- OPT-002: トランジション効果

---

### TASK-012: ホバー効果
**優先度**: 低  
**見積時間**: 1時間

#### 概要
PAUSE中のアイテムホバー効果を実装

#### 事前条件
- Phase 1の全タスクが完了していること

#### 実装内容
1. ScrollItem.vueまたはグローバルCSSに追加
   ```css
   .scroll-item.paused:hover {
     opacity: 0.8;
     cursor: pointer;
   }
   ```

2. pausedクラスの動的付与
   ```vue
   <div :class="{ paused: store.isPaused }">
   ```

#### 完了要件
- [ ] PAUSE中のアイテムホバー時にopacity: 0.8が適用される（OPT-003）
- [ ] カーソルがpointerになる
- [ ] PAUSE中のみ効果が有効

#### 依存関係
- Phase 1の全タスク

#### 関連要件
- OPT-003: ホバー効果

---

## 開発順序とマイルストーン

### マイルストーン1: 基本機能完成（Phase 1）
**期限**: 2日間  
**完了条件**: TASK-001〜006が完了し、基本的なPAUSE機能が動作する

### マイルストーン2: 品質保証（Phase 2）
**期限**: 1.5日間  
**完了条件**: TASK-007〜009, TASK-013〜014が完了し、全要件が満たされている

### マイルストーン3: 拡張機能（Phase 3）
**期限**: 0.5日間  
**完了条件**: TASK-010〜012が完了（オプション）

## 注意事項

### 開発者への共通指示
1. 各タスク開始前に最新のmainブランチをpullすること
2. タスクごとにfeatureブランチを作成すること（例: feature/pause-task-001）
3. コミットメッセージは「TASK-XXX: 実装内容」の形式とすること
4. TypeScript型エラーは0件を維持すること
5. npm run ci（型チェック+ビルド）が成功することを確認すること

### コードレビューチェックリスト
- [ ] 要件定義の該当項目を満たしているか
- [ ] TypeScript型エラーが0件か
- [ ] テストが追加されているか（Phase 2以降）
- [ ] 既存機能への影響がないか
- [ ] パフォーマンス要件を満たしているか

### リスク管理
- 並行開発によるコンフリクトを避けるため、TASK-001を最優先で完了させる
- TASK-002とTASK-003は密接に関連するため、同一開発者が担当することを推奨
- Phase 2は品質保証のため、Phase 1完了後に必ず実施する
- TASK-013（ブラウザ互換性）とTASK-014（統合テスト）は最終品質保証として必須とする