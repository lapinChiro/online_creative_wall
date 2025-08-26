# PNG Download Feature - Task List

## Task Overview

Total Tasks: 10 (TDD原則に従い分割)
Total Estimated Time: 3.5 hours
Parallel Execution Possible: Yes (see dependency graph)

## CLAUDE.md Compliance

本タスクリストは以下の原則に準拠：
- **TDD原則**: RED-GREEN-BLUEサイクル厳守
- **型安全性**: Any型・Non-null assertion(!)使用禁止
- **品質保証**: 全タスクで`npm run ci`必須
- **SOLID原則**: 単一責任の原則を遵守

## Dependency Graph

```
TASK-001 (Setup)
    ├── TASK-002A (Helper Test:RED) → TASK-002B (Helper Impl:GREEN)
    └── TASK-003A (Composable Test:RED) → TASK-003B (Composable Impl:GREEN)
                                           ├─> TASK-004 (UI Implementation)
                                           ├─> TASK-005 (CORS Handling)
                                           └─> TASK-006 (Integration Tests)
                                               └─> TASK-007 (E2E Tests)
                                                   └─> TASK-008 (Final Validation)
```

---

## TASK-001: Project Dependencies Setup

**Priority**: P0 (Critical)  
**Estimated Time**: 15 minutes  
**Assignee**: Any developer  
**Parallel Execution**: Can run independently  

### Prerequisites
- [ ] Node.js v20.19.0+ installed
- [ ] Write access to package.json
- [ ] npm or yarn available

### Task Description
Install html2canvas library and its TypeScript definitions for PNG capture functionality.

### Implementation Steps
1. Run: `npm install html2canvas@1.4.1`
2. Run: `npm install -D @types/html2canvas`
3. Verify installation: `npm list html2canvas`
4. Run build check: `npm run build`

### Deliverables
- **Modified Files**: 
  - `package.json` (dependencies added)
  - `package-lock.json` (updated)

### Acceptance Criteria
- [ ] html2canvas v1.4.1 is in dependencies
- [ ] @types/html2canvas is in devDependencies
- [ ] `npm run ci` passes without errors
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] `npm run build` passes without errors

### Verification Commands
```bash
npm list html2canvas
npm run ci              # 必須: 型チェック + ビルド
npm run type-check:strict  # 型エラー0件確認
npm run quality:report  # 品質状況確認
```

### CLAUDE.md Compliance Check
- [ ] 開発哲学に準拠している
- [ ] 必須ルールを遵守している

### Related Requirements
- REQ-002: HTML Canvas API usage

---

## TASK-002A: Download Helper Test Implementation (RED Phase)

**Priority**: P0 (Critical)  
**Estimated Time**: 10 minutes  
**Assignee**: Any developer  
**Parallel Execution**: Can start after TASK-001  
**TDD Phase**: RED (失敗するテストを書く)

### Prerequisites
- [ ] TypeScript environment configured
- [ ] Vitest environment configured
- [ ] `/src/utils/__tests__/` directory exists

### Task Description
TDD RED Phase: 失敗するテストを先に作成（テストファースト）

### Implementation Steps
1. Create test file: `src/utils/__tests__/downloadHelper.spec.ts`
2. Write failing tests for `formatDownloadFilename()` function
3. Run tests to confirm they fail (RED phase)
4. Verify test structure follows best practices

### Deliverables
- **New Files**:
  - `src/utils/__tests__/downloadHelper.spec.ts`

### Test Template
```typescript
// src/utils/__tests__/downloadHelper.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDownloadFilename } from '../downloadHelper' // Will fail initially

describe('downloadHelper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDownloadFilename', () => {
    it('should format filename with YYYYMMDD-HHmmss pattern', () => {
      // Test will fail initially (RED)
      vi.setSystemTime(new Date('2025-08-26T15:30:45'))
      expect(formatDownloadFilename()).toBe('creative-wall-20250826-153045.png')
    })
    
    it('should pad single digits with zero', () => {
      vi.setSystemTime(new Date('2025-01-05T09:05:08'))
      expect(formatDownloadFilename()).toBe('creative-wall-20250105-090508.png')
    })
  })
})
```

### Acceptance Criteria
- [ ] テストファイルが作成されている
- [ ] テストが失敗する（RED phase確認）
- [ ] テストケースが要件を網羅している
- [ ] モック（vi.useFakeTimers）が適切に使用されている
- [ ] No TypeScript errors in test file
- [ ] `npm run test:unit -- downloadHelper` で実行可能

### Quality Assurance
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] Any型を使用していない
- [ ] Non-null assertion(!)を使用していない

### Related Requirements
- REQ-005: File naming convention

### CLAUDE.md Compliance
- TDD原則: RED phase実装
- 型安全性: テストコードも型安全

---

## TASK-002B: Download Helper Implementation (GREEN Phase)

**Priority**: P0 (Critical)  
**Estimated Time**: 10 minutes  
**Assignee**: Any developer  
**Parallel Execution**: Depends on TASK-002A  
**TDD Phase**: GREEN (最小限の実装でテストを通す)

### Prerequisites
- [ ] TASK-002A completed (failing tests exist)
- [ ] `/src/utils/` directory exists

### Task Description
TDD GREEN Phase: 最小限の実装でテストを通す

### Implementation Steps
1. Create file: `src/utils/downloadHelper.ts`
2. Implement minimal `formatDownloadFilename()` to pass tests
3. Run tests to confirm they pass (GREEN phase)
4. Run quality checks

### Deliverables
- **New Files**:
  - `src/utils/downloadHelper.ts`

### Code Template
```typescript
// src/utils/downloadHelper.ts
/**
 * Generate filename in format: creative-wall-YYYYMMDD-HHmmss.png
 * @returns Formatted filename with timestamp
 */
export function formatDownloadFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  return `creative-wall-${year}${month}${day}-${hours}${minutes}${seconds}.png`
}
```

### Acceptance Criteria
- [ ] All tests pass (GREEN phase achieved)
- [ ] Function returns correct format
- [ ] Uses local timezone
- [ ] Zero-pads single digits
- [ ] 100% test coverage
- [ ] `npm run ci` passes

### Quality Assurance
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] `npm run build` succeeds
- [ ] Any型を使用していない
- [ ] Non-null assertion(!)を使用していない
- [ ] 単一責任の原則を守っている

### Verification Commands
```bash
npm run test:unit -- downloadHelper
npm run test:unit:coverage -- downloadHelper
npm run ci
```

### Related Requirements
- REQ-005: File naming convention

### CLAUDE.md Compliance
- TDD原則: GREEN phase実装
- KISS原則: 最小限の実装
- DRY原則: 重複なし

---

## TASK-003A: Canvas Download Composable Test Implementation (RED Phase)

**Priority**: P0 (Critical)  
**Estimated Time**: 20 minutes  
**Assignee**: Frontend developer  
**Parallel Execution**: Depends on TASK-001 and TASK-002B  
**TDD Phase**: RED (失敗するテストを書く)

### Prerequisites
- [ ] TASK-001 completed (html2canvas installed)
- [ ] TASK-002B completed (downloadHelper available)
- [ ] Vitest environment configured
- [ ] `/src/composables/__tests__/` directory exists

### Task Description
TDD RED Phase: Composableのテストを先に作成（SOLID原則を考慮）

### Implementation Steps
1. Create test file: `src/composables/__tests__/useCanvasDownload.spec.ts`
2. Write failing tests for composable interface
3. Mock html2canvas library
4. Test timeout behavior (3 seconds)
5. Test error handling scenarios
6. Run tests to confirm they fail (RED phase)

### Deliverables
- **New Files**:
  - `src/composables/__tests__/useCanvasDownload.spec.ts`

### Test Template (SOLID原則を考慮)
```typescript
// src/composables/__tests__/useCanvasDownload.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCanvasDownload } from '../useCanvasDownload' // Will fail initially

describe('useCanvasDownload', () => {
  // Mock html2canvas
  vi.mock('html2canvas', () => ({
    default: vi.fn()
  }))
  
  describe('initialization', () => {
    it('should return correct interface', () => {
      const { isCapturing, captureError, captureProgress, captureBlackboard, clearError } = useCanvasDownload()
      expect(isCapturing.value).toBe(false)
      expect(captureError.value).toBeNull()
      expect(captureProgress.value).toBe(0)
      expect(typeof captureBlackboard).toBe('function')
      expect(typeof clearError).toBe('function')
    })
  })
  
  describe('captureBlackboard', () => {
    it('should handle 3-second timeout', async () => {
      // Test timeout behavior
    })
    
    it('should use quality 1.0 for canvas.toBlob', async () => {
      // Test quality setting
    })
    
    it('should cleanup object URLs', async () => {
      // Test memory cleanup
    })
  })
})
```

### Acceptance Criteria
- [ ] テストファイルが作成されている
- [ ] テストが失敗する（RED phase確認）
- [ ] html2canvasのモックが正しく設定されている
- [ ] タイムアウトテスト（3秒）が含まれている
- [ ] エラーケースのテストが含まれている
- [ ] メモリクリーンアップのテストが含まれている

### Quality Assurance
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] Any型を使用していない
- [ ] Non-null assertion(!)を使用していない
- [ ] SOLID原則（単一責任）を考慮している

### Related Requirements
- REQ-002: Canvas API usage
- REQ-004: Image quality 1.0
- REQ-007: 3-second timeout
- REQ-010: Error handling

### CLAUDE.md Compliance
- TDD原則: RED phase実装
- SOLID原則: インターフェース分離

---

## TASK-003B: Canvas Download Composable Implementation (GREEN Phase)

**Priority**: P0 (Critical)  
**Estimated Time**: 25 minutes  
**Assignee**: Frontend developer  
**Parallel Execution**: Depends on TASK-003A  
**TDD Phase**: GREEN (最小限の実装でテストを通す)

### Prerequisites
- [ ] TASK-003A completed (failing tests exist)
- [ ] `/src/composables/` directory exists
- [ ] `/src/utils/logger.ts` exists
- [ ] `/src/utils/downloadHelper.ts` exists

### Task Description
TDD GREEN Phase: 最小限の実装でテストを通す（SOLID原則を遵守）

### Implementation Steps
1. Create file: `src/composables/useCanvasDownload.ts`
2. Implement interface with minimal code
3. Add 3-second timeout using Promise.race
4. Implement canvas.toBlob with quality 1.0
5. Add proper memory cleanup
6. Run tests to confirm they pass (GREEN phase)

### Deliverables
- **New Files**:
  - `src/composables/useCanvasDownload.ts`

### Implementation Template (SOLID原則適用)
```typescript
// src/composables/useCanvasDownload.ts
import { ref, type Ref } from 'vue'
import html2canvas from 'html2canvas'
import { createLogger } from '@/utils/logger'
import { formatDownloadFilename } from '@/utils/downloadHelper'

const logger = createLogger('useCanvasDownload')

export interface UseCanvasDownloadReturn {
  isCapturing: Ref<boolean>
  captureError: Ref<string | null>
  captureProgress: Ref<number>
  captureBlackboard: (element: HTMLElement) => Promise<void>
  clearError: () => void
}

// 単一責任: DOMキャプチャーとダウンロードの統合
export function useCanvasDownload(): UseCanvasDownloadReturn {
  const isCapturing = ref(false)
  const captureError = ref<string | null>(null)
  const captureProgress = ref(0)
  
  const captureBlackboard = async (element: HTMLElement): Promise<void> => {
    // Minimal implementation to pass tests
    // No any types, no non-null assertions
  }
  
  const clearError = (): void => {
    captureError.value = null
  }
  
  return {
    isCapturing,
    captureError,
    captureProgress,
    captureBlackboard,
    clearError
  }
}
```

### Acceptance Criteria
- [ ] All tests pass (GREEN phase achieved)
- [ ] 3-second timeout implemented
- [ ] Quality 1.0 for canvas.toBlob
- [ ] Object URLs cleaned up properly
- [ ] Japanese error messages
- [ ] Progress updates work
- [ ] 80%+ test coverage
- [ ] `npm run ci` passes

### Quality Assurance
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] `npm run build` succeeds
- [ ] Any型を使用していない
- [ ] Non-null assertion(!)を使用していない
- [ ] 単一責任の原則を守っている
- [ ] DRY原則を守っている

### Verification Commands
```bash
npm run test:unit -- useCanvasDownload
npm run test:unit:coverage -- useCanvasDownload  
npm run ci
npm run quality:report
```

### Related Requirements
- REQ-002: Canvas API usage
- REQ-004: Image quality 1.0
- REQ-007: 3-second timeout
- REQ-010: Error handling

### CLAUDE.md Compliance
- TDD原則: GREEN phase実装
- SOLID原則: 単一責任
- KISS原則: シンプルな実装
- DRY原則: 重複なし

---

## TASK-004: UI Component Integration

**Priority**: P1 (High)  
**Estimated Time**: 40 minutes  
**Assignee**: Frontend developer  
**Parallel Execution**: Depends on TASK-003  

### Prerequisites
- [ ] TASK-003 completed (useCanvasDownload available)
- [ ] Access to CreativeWall.vue
- [ ] Understanding of existing pause functionality

### Task Description
Add download button and notification UI to CreativeWall component with full accessibility support.

### Implementation Steps
1. Import useCanvasDownload composable
2. Add download button HTML (after pause button)
3. Add ref to BlackBoard component
4. Implement handleDownload function
5. Add success/error notifications
6. Implement keyboard support (Enter/Space)
7. Add ARIA attributes
8. Add CSS styles for button and notifications

### Deliverables
- **Modified Files**:
  - `src/components/CreativeWall.vue`

### UI Specifications
```vue
<!-- Button placement (line ~18) -->
<button id="pause-button">...</button>
<button v-if="isPaused" id="download-button">...</button>

<!-- Notification placement (line ~24) -->
<Transition name="fade">
  <div v-if="showSuccessMessage">...</div>
</Transition>

<!-- BlackBoard ref (line ~70) -->
<BlackBoard ref="blackboardRef" />
```

### Acceptance Criteria
- [ ] Download button only visible when paused
- [ ] Button has loading state during capture
- [ ] Keyboard navigation works (Enter/Space)
- [ ] ARIA labels are descriptive
- [ ] Success notification shows for 3 seconds
- [ ] Error messages auto-clear after 5 seconds
- [ ] Focus management is correct
- [ ] CSS matches existing button styles
- [ ] `npm run ci` passes

### Quality Assurance
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] `npm run build` succeeds
- [ ] Any型を使用していない
- [ ] Non-null assertion(!)を使用していない
- [ ] Optional chaining(?.) を適切に使用
- [ ] コンポーネントの単一責任を維持

### Accessibility Requirements
- aria-label changes based on state
- aria-busy during capture
- Minimum touch target: 44x44px
- Focus indicator visible
- Keyboard operable

### Verification Commands
```bash
npm run ci
npm run type-check:strict
npm run lint
```

### Related Requirements
- REQ-001: Button display when paused
- REQ-006: Visual feedback
- REQ-009: Accessibility
- REQ-011: Disabled when not paused

### CLAUDE.md Compliance
- Orthogonality: UIとロジックの分離
- 型安全性: strict mode遵守

---

## TASK-005: CORS Configuration

**Priority**: P2 (Medium)  
**Estimated Time**: 20 minutes  
**Assignee**: Any developer  
**Parallel Execution**: Can start after TASK-003  

### Prerequisites
- [ ] Understanding of CORS implications
- [ ] Access to ImageContent.vue

### Task Description
Configure cross-origin settings for S3 images to enable canvas capture.

### Implementation Steps
1. Modify ImageContent.vue img tag
2. Add crossOrigin="anonymous" attribute
3. Update error handling for CORS failures
4. Add fallback behavior documentation

### Deliverables
- **Modified Files**:
  - `src/components/ImageContent.vue`

### Code Changes
```vue
<!-- Line ~14 in ImageContent.vue -->
<img 
  :src="content.url" 
  :alt="content.title"
  crossorigin="anonymous"  <!-- Add this -->
  loading="lazy"
  @load="handleImageLoad"
  @error="handleImageError"
>
```

### Acceptance Criteria
- [ ] crossOrigin attribute is set
- [ ] Images still load correctly
- [ ] CORS errors are caught
- [ ] Fallback message shown for tainted canvas
- [ ] No breaking changes to existing functionality
- [ ] `npm run ci` passes

### Quality Assurance  
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] Any型を使用していない
- [ ] アトリビュート名のタイポミスがない

### S3 CORS Configuration (Documentation)
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }]
}
```

### Verification Commands
```bash
npm run ci
npm run dev  # Manual test for image loading
```

### Related Requirements
- REQ-012: CORS constraint handling

### CLAUDE.md Compliance
- KISS原則: 最小限の変更
- Don't Reinvent the Wheel: 標準のCORSメカニズム使用

---

## TASK-006: Integration Test Implementation

**Priority**: P2 (Medium)  
**Estimated Time**: 20 minutes  
**Assignee**: Any developer  
**Parallel Execution**: Can start after TASK-003B and TASK-004  

### Prerequisites
- [ ] TASK-002B completed (downloadHelper implemented)
- [ ] TASK-003B completed (useCanvasDownload implemented)
- [ ] TASK-004 completed (UI integrated)
- [ ] Vitest environment configured

### Task Description
統合テストの実装（TDDのリファクタリング/BLUE phaseの一部）

### Implementation Steps
1. Create integration test file
2. Test composable with actual DOM elements
3. Test download flow end-to-end
4. Verify file naming and quality
5. Run coverage report

### Deliverables
- **Test Files**:
  - `src/composables/__tests__/useCanvasDownload.integration.spec.ts`

### Test Scenarios
```typescript
// useCanvasDownload.integration.spec.ts
- ✓ captures real DOM element and downloads
- ✓ filename format is correct
- ✓ handles timeout with real timer
- ✓ cleanup works properly
- ✓ error messages are in Japanese
```

### Acceptance Criteria
- [ ] All integration tests pass
- [ ] Combined coverage ≥ 80%
- [ ] Real DOM interaction tested
- [ ] Download flow validated
- [ ] `npm run ci` passes

### Quality Assurance
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] Any型を使用していない
- [ ] Non-null assertion(!)を使用していない

### Test Commands
```bash
npm run test:unit
npm run test:unit:coverage
npm run ci
```

### Related Requirements
- All functional requirements

### CLAUDE.md Compliance
- TDD原則: BLUE phase (リファクタリングと統合)
- 型安全性: テストコードも型安全

---

## TASK-007: E2E Test Implementation

**Priority**: P3 (Low)  
**Estimated Time**: 25 minutes  
**Assignee**: QA/Developer  
**Parallel Execution**: Depends on TASK-004 completion  

### Prerequisites
- [ ] All UI implementation complete
- [ ] Playwright installed and configured
- [ ] Dev server running

### Task Description
Create end-to-end tests for the complete download workflow.

### Implementation Steps
1. Create test file: `e2e/download.spec.ts`
2. Test pause → download flow
3. Verify filename format
4. Test keyboard navigation
5. Test error scenarios

### Deliverables
- **New Files**:
  - `e2e/download.spec.ts`

### Test Scenarios
```typescript
test.describe('PNG Download Feature', () => {
  test('downloads PNG when paused')
  test('button only visible when paused')
  test('keyboard navigation works')
  test('filename has correct format')
  test('shows error for failed capture')
  test('success notification appears and disappears')
})
```

### Acceptance Criteria
- [ ] All E2E tests pass
- [ ] Download event is captured
- [ ] Filename validation works
- [ ] Tests run in CI pipeline
- [ ] No flaky tests
- [ ] `npm run ci` passes

### Quality Assurance
- [ ] テストが安定している（flakyでない）
- [ ] CI環境で動作確認済み
- [ ] 適切なwait処理がされている

### Test Commands
```bash
npm run test:e2e -- download.spec.ts
npm run test:e2e:headed -- download.spec.ts
```

### Related Requirements
- All user-facing requirements

### CLAUDE.md Compliance
- 品質保証: E2Eテストによる検証
- Test-Driven: 全機能の動作確認

---

## TASK-008: Final Validation & Optimization

**Priority**: P3 (Low)  
**Estimated Time**: 15 minutes  
**Assignee**: Tech lead/Senior developer  
**Parallel Execution**: Final task after all others  

### Prerequisites
- [ ] All previous tasks completed
- [ ] All tests passing
- [ ] Code reviewed

### Task Description
Perform final quality checks and optimizations before deployment.

### Implementation Steps
1. Run memory profiler during capture
2. Check for memory leaks
3. Verify performance (< 3 seconds)
4. Run full CI pipeline
5. Update documentation if needed

### Validation Checklist
- [ ] `npm run ci` passes
- [ ] `npm run type-check:strict` passes (型エラー0件)
- [ ] `npm run lint` has no errors
- [ ] `npm run quality:report` shows good metrics
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Memory usage is acceptable
- [ ] No console errors in production build
- [ ] Download works on all target browsers

### Code Quality Checklist (CLAUDE.md準拠)
- [ ] Any型が使用されていない
- [ ] Non-null assertion(!)が使用されていない
- [ ] 型エラーが0件
- [ ] ビルドが成功する
- [ ] TDDサイクルが完了している
- [ ] SOLID原則が守られている

### Performance Metrics
- Capture time: < 3 seconds (1920x1080)
- Memory peak: < 200MB increase
- File size: Reasonable for viewport

### Browser Testing Matrix
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | [ ] |
| Firefox | 88+ | [ ] |
| Safari | 14+ | [ ] |
| Edge | 90+ | [ ] |

### Final Commands
```bash
npm run ci
npm run build
npm run preview
# Manual testing in preview mode
```

### Related Requirements
- REQ-007: Performance constraints
- REQ-008: Browser compatibility

### CLAUDE.md Compliance
- 必須ルール: 全項目チェック
- 品質保証: CIパイプライン完走
- TDD: 全サイクル完了確認

---

## Notes for Project Manager

### TDDサイクルに基づく実装フロー

**重要**: 全タスクはCLAUDE.mdのTDD原則（RED-GREEN-BLUE）に従います

### Parallel Execution Strategy
- **Phase 1**: TASK-001 (Setup)
- **Phase 2**: TASK-002A, TASK-003A (RED: テスト作成) [並列]
- **Phase 3**: TASK-002B, TASK-003B (GREEN: 実装) [並列]
- **Phase 4**: TASK-004, TASK-005 (UI/CORS) [並列]
- **Phase 5**: TASK-006 (Integration)
- **Phase 6**: TASK-007 (E2E)
- **Phase 7**: TASK-008 (Final Validation)

### Risk Factors
1. **CORS Issues**: May require backend S3 configuration
2. **Large Images**: Memory constraints on mobile devices
3. **Browser Compatibility**: Some older browsers may not support all APIs

### Success Metrics
- All 12 requirements implemented ✓
- Zero TypeScript errors (npm run type-check:strict) ✓
- Zero Any types, Zero Non-null assertions ✓
- Test coverage > 80% ✓
- Performance < 3 seconds ✓
- Works on all target browsers ✓
- TDDサイクル完了 (RED-GREEN-BLUE) ✓
- npm run ci 全タスクで成功 ✓

### CLAUDE.md準拠チェックリスト

| 原則 | 適用状況 |
|------|----------|
| TDD (RED-GREEN-BLUE) | 全タスクで適用 |
| 型エラー0件 | 各タスクで確認 |
| Any型禁止 | 明示的にチェック |
| Non-null assertion禁止 | 明示的にチェック |
| SOLID原則 | Composable設計に適用 |
| KISS原則 | 最小限の実装 |
| DRY原則 | 重複排除 |