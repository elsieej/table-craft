import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-table-craft': path.resolve(__dirname, '../../dist/index.mjs'),
    },
  },
})
