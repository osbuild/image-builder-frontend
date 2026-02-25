import fs from 'fs';
import path from 'path';

import react from '@vitejs/plugin-react';

// Packages with broken sourcemaps (reference source files not included in npm package)
const brokenSourcemapPackages = [
  'node_modules/@redhat-cloud-services',
  'node_modules/@scalprum',
];

// Plugin to strip sourcemap comments from problematic packages
const stripSourcemaps = {
  name: 'strip-sourcemaps',
  enforce: 'pre' as const,
  load(id: string) {
    if (
      id.endsWith('.js') &&
      brokenSourcemapPackages.some((pkg) => id.includes(pkg))
    ) {
      const code = fs.readFileSync(id, 'utf-8');
      return {
        code: code.replace(/\/\/# sourceMappingURL=.*/g, ''),
        map: null,
      };
    }
    return null;
  },
};

const config = {
  plugins: [stripSourcemaps, react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
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
    exclude: ['./pkg/lib/**', '**/node_modules/**', '**/dist/**', './playwright/**'],
    retry: 3,
  },
  reporters: ['default', 'junit'],
  outputFile: {
    junit: './coverage/junit.xml',
  },
  resolve: {
    mainFields: ['module'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // we have to point vitest to the mocks for `cockpit` and `cockpit/fsinfo`
      // by using aliases. This allows vitest to resolve these two packages
      // and allows the tests to pass
      cockpit: path.resolve(__dirname, 'src/test/mocks/cockpit'),
      'cockpit/fsinfo': path.resolve(
        __dirname,
        'src/test/mocks/cockpit/fsinfo',
      ),
      'os-release': path.resolve(__dirname, 'src/test/mocks/os-release'),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
};

export default config;
