import RawPlugin from 'esbuild-plugin-raw'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/main/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  target: 'node16',
  outDir: 'dist',
  splitting: false,
  esbuildPlugins: [RawPlugin()]
})
