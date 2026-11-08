import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function normalizeBase(value: string | undefined) {
  if (!value || value === '/') return '/'
  const withLead = value.startsWith('/') ? value : `/${value}`
  return withLead.endsWith('/') ? withLead : `${withLead}/`
}

function githubPagesFallback(): Plugin {
  return {
    name: 'github-pages-fallback',
    apply: 'build',
    writeBundle() {
      const indexPath = fileURLToPath(new URL('./dist/index.html', import.meta.url))
      copyFileSync(indexPath, indexPath.replace(/index\.html$/, '404.html'))
    },
  }
}

export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE_PATH),
  plugins: [react(), githubPagesFallback()],
  server: {
    host: '0.0.0.0',
    port: 4731,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        features: fileURLToPath(new URL('./features/index.html', import.meta.url)),
        prototype: fileURLToPath(new URL('./prototype/index.html', import.meta.url)),
      },
    },
  },
})
