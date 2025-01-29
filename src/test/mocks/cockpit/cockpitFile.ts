/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';

import { mockGetBlueprints } from '../../fixtures/blueprints';
import { mockComposes } from '../../fixtures/composes';

const readBlueprint = (id: string): Promise<string> => {
  for (const bp of mockGetBlueprints.data) {
    if (bp.id === id) {
      return new Promise((resolve) => {
        resolve(JSON.stringify(bp));
      });
    }
  }
  return new Promise((resolve) => {
    resolve('{}');
  });
};

const readCompose = (id: string): Promise<string> => {
  for (const compose of mockComposes) {
    if (compose.id === id) {
      return new Promise((resolve) => {
        resolve(JSON.stringify(compose.request));
      });
    }
  }
  return new Promise((resolve) => {
    resolve('{}');
  });
};

export const cockpitFile = (filepath: string) => {
  return {
    read: (): Promise<string> => {
      const file = path.parse(filepath);
      const dir = path.parse(file.dir);

      // if the directory matches the file it's a blueprint
      if (file.name === dir.name) {
        return readBlueprint(file.name);
      }
      return readCompose(file.name);
    },
    close: () => {},
    replace: (contents: string) => {},
  };
};
