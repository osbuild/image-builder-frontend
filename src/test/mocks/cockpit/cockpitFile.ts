/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';

import { mockComposes } from '../../fixtures/composes';
import { getMockBlueprintResponse } from '../../fixtures/editMode';

const readBlueprint = (id: string): Promise<string> => {
  return new Promise((resolve) => {
    resolve(JSON.stringify(getMockBlueprintResponse(id) || {}));
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

// Contains a list of all blueprint create or edit requests
const lastRequest = {
  blueprints: [] as string[],
};

export const getLastBlueprintReq = () => {
  return lastRequest.blueprints[lastRequest.blueprints.length - 1];
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
    replace: (contents: string) => {
      const file = path.parse(filepath);
      const dir = path.parse(file.dir);
      if (file.name === dir.name) {
        lastRequest.blueprints.push(contents);
      }
    },
  };
};
