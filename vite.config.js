import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // CSS variable'ları optimize et
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    // CSS import sırasını koru
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    cssMinify: true, // CSS minification'ı aktif et
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['xlsx']
        },
        // CSS dosyalarını ayrı chunk'lara böl
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  base: '/',
  server: {
    port: 5173,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    proxy: {
      '/api/rawg': {
        target: 'https://api.rawg.io/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rawg/, ''),
        secure: true,
        headers: {
          'User-Agent': 'VaultTracker/3.6.0'
        }
      },
      '/api/igdb': {
        target: 'https://api.igdb.com/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/igdb/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // IGDB API için gerekli header'ları koru
            if (req.headers['client-id']) {
              proxyReq.setHeader('Client-ID', req.headers['client-id']);
            }
            if (req.headers['authorization']) {
              proxyReq.setHeader('Authorization', req.headers['authorization']);
            }
            proxyReq.setHeader('User-Agent', 'VaultTracker/3.6.0');
          });
        }
      },
      '/api/giantbomb': {
        target: 'https://www.giantbomb.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/giantbomb/, ''),
        secure: true,
        headers: {
          'User-Agent': 'VaultTracker/3.6.0'
        }
      },
      '/api/steam': {
        target: 'https://api.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steam/, ''),
        secure: true,
        headers: {
          'User-Agent': 'VaultTracker/3.6.0'
        }
      },
      '/api/steamstore': {
        target: 'https://store.steampowered.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steamstore/, ''),
        secure: true,
        headers: {
          'User-Agent': 'VaultTracker/3.6.0'
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})
