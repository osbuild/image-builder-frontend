/* eslint-disable @typescript-eslint/no-unused-vars */

import path from 'path';

import { mockBlueprintIds } from '../../fixtures/blueprints';
import { mockComposes } from '../../fixtures/composes';

const bpDir = '/default/.cache/cockpit-image-builder/';

type fileinfo = {
  entries?: Record<string, fileinfo>;
  mtime: number;
};

interface FSInfoMap {
  [id: string]: fileinfo;
}

export const listBlueprints = (): Promise<fileinfo> => {
  const result: FSInfoMap = {};
  for (const e of Object.values(mockBlueprintIds)) {
    result[e] = {
      mtime: 1,
    };
  }
  return new Promise((resolve) => {
    resolve({
      entries: result,
      mtime: 1,
    });
  });
};

export const listComposes = (): Promise<fileinfo> => {
  const result: FSInfoMap = {};
  let count = 0;
  for (const e of mockComposes) {
    // hack
    if (count === 10) {
      break;
    }
    count += 1;
    result[e.id] = {
      mtime: new Date(e.created_at).getTime() / 1000,
    };
  }
  return new Promise((resolve) => {
    resolve({
      entries: result,
      mtime: 1,
    });
  });
};

export const fsinfo = (
  filepath: string,
  attributes: (keyof fileinfo)[],
  options: object
): Promise<fileinfo> => {
  if (filepath === bpDir) {
    return listBlueprints();
  }

  // HACK: the composes in fixture don't have blueprints attached, so
  // abuse one blueprint to return all composes.
  if (
    filepath ===
    '/default/.cache/cockpit-image-builder/b3ff8307-18bd-418a-9a91-836ce039b035'
  ) {
    return listComposes();
  }

  return new Promise((resolve) => {
    resolve({
      entries: {},
      mtime: 1,
    });
  });
};
