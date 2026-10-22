/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base: './' keeps every asset path relative, so the build works from any
// GitHub Pages subfolder. Routing is hash-based (see main.tsx), so a direct
// link to /#/kabinet or a page refresh never hits a server-side 404.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})
