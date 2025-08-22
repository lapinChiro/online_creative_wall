import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const _env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      // DevTools条件付き有効化 (開発環境でのみ)
      ...(mode === 'development' ? [vueDevTools()] : []),
    ],
    define: {
      // Vue production artifacts完全除去
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    css: {
      devSourcemap: false,
    },
    resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Terser minification for maximum compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,     // console.*完全除去
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.warn'],
      },
      mangle: true,
      format: {
        comments: false,        // コメント除去
      }
    },
    sourcemap: false,           // Source map完全無効化 (-500KB)
    
    // Tree-shaking optimization configuration
    rollupOptions: {
      output: {
        // 改善されたmanualChunks戦略
        manualChunks(id: string) {
          // node_modulesのパッケージを分離
          if (id.includes('node_modules')) {
            // Vue関連
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vue'
            }
            // Pinia（状態管理）
            if (id.includes('pinia')) {
              return 'pinia'
            }
            // その他のvendor
            return 'vendor'
          }
          
          // ユーティリティとサービスを分離
          if (id.includes('/utils/') || id.includes('/services/')) {
            return 'utils'
          }
          
          // コンポーネントを分離（重いコンポーネント用）
          if (id.includes('/components/') && 
              (id.includes('BlackBoard') || id.includes('ScrollItem'))) {
            return 'components'
          }
        },
        // CSS Code Splitting
        assetFileNames: (assetInfo) => {
          // nameからnamesへ移行（nameはdeprecated）
          const fileName = assetInfo.names[0] ?? 'asset'
          if (fileName.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    // Enable aggressive tree-shaking
    target: 'es2020',
    // 追加の最適化設定
    cssCodeSplit: true,         // CSS Code Splitting有効化
    reportCompressedSize: true, // gzip圧縮サイズ表示
    chunkSizeWarningLimit: 500, // チャンクサイズ警告閾値
    // アセット最適化
    assetsInlineLimit: 4096     // 4KB以下のアセットはインライン化
  },
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  },
  // Web Worker設定
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name]-[hash].js'
      }
    }
  },
    // パフォーマンス最適化
    optimizeDeps: {
      include: ['vue', 'pinia'],
      exclude: []
    }
  }
})
