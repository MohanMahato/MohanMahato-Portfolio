import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { findForbiddenEnv } from './src/lib/keyGuard.js'

export default defineConfig(({ mode }) => {
  // Stop the build if a secret key was put into a VITE_ variable (it would be shipped to every visitor).
  const problems = findForbiddenEnv(loadEnv(mode, import.meta.dirname, 'VITE_'))
  if (problems.length > 0) {
    throw new Error(`\nUNSAFE ENVIRONMENT VARIABLES - build stopped:\n - ${problems.join('\n - ')}\n`)
  }

  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  }
})
