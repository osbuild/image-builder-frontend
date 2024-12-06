import react from '@vitejs/plugin-react';
import path from 'path';

const config = {
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
    },
    server: {
      deps: {
        inline: ['vitest-canvas-mock', '@patternfly', '@monaco-editor'],
      },
    },
    testTimeout: 10000,
    fileParallelism: false,
    exclude: ['./pkg/lib/**', '**/node_modules/**', '**/dist/**'],
  },
  reporters: ['default', 'junit'],
  outputFile: {
    junit: './coverage/junit.xml',
  },
  resolve: {
    mainFields: ['module'],
    alias: {
      cockpit: path.resolve(__dirname, 'src/mocks/cockpit'),
      fsinfo: path.resolve(__dirname, 'src/mocks/cockpit'),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
};

export default config;
