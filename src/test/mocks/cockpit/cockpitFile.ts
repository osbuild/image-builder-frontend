import path from 'path';

import { mockComposes, mockStatus } from '../../fixtures/composes';
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

export const cockpitFile = (filepath: string, _options?: object) => {
  return {
    read: (): Promise<string> => {
      const file = path.parse(filepath);
      const dir = path.parse(file.dir);

      // with ibcli, when the job is done we save the status
      // to a file named result with `success` or `failure`
      // as the contents
      if (file.name === 'result') {
        const composeId = path.basename(file.dir);
        const composeStatus = mockStatus(composeId);
        return new Promise((resolve) => {
          resolve(composeStatus.image_status.status);
        });
      }

      // this should now resolve the compose request
      // since we've nested the request one more level
      // down: `${blueprintId}/${composeId}/request.json`
      if (file.name === 'request') {
        return readCompose(dir.name);
      }

      // if the directory matches the file it's a blueprint
      if (file.name === dir.name) {
        return readBlueprint(file.name);
      }

      return readCompose(file.name);
    },
    close: () => {},
    replace: async (contents: string) => {
      const file = path.parse(filepath);
      const dir = path.parse(file.dir);
      if (file.name === dir.name) {
        lastRequest.blueprints.push(contents);
      }
    },
    modify: (callback: (contents: string) => string): Promise<string> => {
      return new Promise((resolve) => {
        resolve(callback(''));
      });
    },
  };
};
