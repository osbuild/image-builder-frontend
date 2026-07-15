#!/usr/bin/env node

import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import copy from "esbuild-plugin-copy";
import { reactRouterShimPlugin } from "./react-router-plugin.js";

// import child_process from 'child_process';
// import fs from 'node:fs';
// import os from 'node:os';
import path from 'path';
import process from 'process';

// import { getFiles, getTestFiles, all_subdirs } from './files.js';

const production = process.env.NODE_ENV === 'production';

// // ensure node_modules is present and up to date
// child_process.spawnSync('tools/node-modules', ['make_package_lock_json'], { stdio: 'inherit' });

// List of directories to use when resolving import statements
const nodePaths = ['pkg/lib'];

// context options for distributed pages in dist/
const context = await esbuild.context({
  ...!production ? { sourcemap: "linked" } : {},
  alias: {
    "path": "path-browserify",
  },
  bundle: true,
  define: {
    'process.env.IS_ON_PREMISE': 'true',
  },
  entryPoints: ["./src/AppCockpit.tsx"],
  external: [
    '*.woff', // Allow external font files which live in ../static/fonts
    '*.woff2',
    '*.jpg',
    '*.svg',
    '../assets*',
  ],
  legalComments: 'external', // Move all legal comments to a .LEGAL.txt file
  loader: {
    ".js": "jsx",
  },
  minify: production,
  nodePaths,
  outbase: ".",
  outdir: "cockpit/dist",
  plugins: [
    reactRouterShimPlugin,
    copy({
      assets: [
        { from: ["./cockpit/public/index.html"], to: ["index.html"] },
        { from: ["./cockpit/public/manifest.json"], to: ["manifest.json"] },
        { from: ["./cockpit/public/org.image-builder.cockpit-image-builder.metainfo.xml"], to: ["org.image-builder.cockpit-image-builder.metainfo.xml"] },
      ]
    }),
    sassPlugin({
      loadPaths: [...nodePaths, "node_modules"],
      quietDeps: true,
    }),
  ],
  target: ['es2020'],
});

try {
  await context.rebuild();
} catch (e) {
  console.error(e);
  process.exit(1);
}

context.dispose();
