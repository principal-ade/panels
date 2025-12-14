import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Force production JSX runtime to avoid jsxDEV in output
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    }),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
    }),
  ],
  define: {
    // Ensure NODE_ENV is production for React
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'A24ZPanels',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'umd'}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-resizable-panels'
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
          'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
          'react-resizable-panels': 'ReactResizablePanels',
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Force production mode for consistent JSX runtime
  mode: 'production',
}));