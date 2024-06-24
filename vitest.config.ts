import react from '@vitejs/plugin-react';

const config = {
  plugins: [react()],
  test: {
    reporters: ['basic'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: 'text',
    },
    server: {
      deps: {
        inline: ['@patternfly', 'clsx'],
      },
    },
    testTimeout: 10000,
  },
  resolve: {
    mainFields: ['module'],
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
};

export default config;
