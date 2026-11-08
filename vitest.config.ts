import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Reusa la config de Vite (plugin de React) y le suma lo de los tests unitarios.
export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // solo src/: los e2e de Playwright (e2e/*.spec.ts) los corre Playwright, no Vitest
    include: ['src/**/*.test.{ts,tsx}'],
    // las fechas se manejan en hora local: se fija la de Argentina para que el resultado
    // sea el mismo en cualquier máquina
    env: { TZ: 'America/Argentina/Buenos_Aires' },
  },
}))
