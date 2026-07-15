import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hacky plugin to patch react-router-dom with missing v5 exports
export const reactRouterShimPlugin = {
  name: 'react-router-shim',
  setup(build) {
    build.onLoad({ filter: /node_modules\/react-router-dom\/dist\/index\.js$/ }, async (args) => {
      // Read the actual module
      const contents = await fs.promises.readFile(args.path, 'utf8');

      // Append stub exports for missing v5 hooks
      const shimmedContents = contents + `
export const useHistory = () => {
  throw new Error('useHistory (React Router v5) is not supported');
};
export const useRouteMatch = () => {
  throw new Error('useRouteMatch (React Router v5) is not supported');
};
`;

      return {
        contents: shimmedContents,
        loader: 'js',
      };
    });
  }
};
