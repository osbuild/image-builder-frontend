/* eslint-disable @typescript-eslint/no-unused-vars */

import path from 'path';

import { cockpitFile } from './cockpitFile';

import { mockStatus } from '../../fixtures/composes';

type userinfo = {
  home: string;
};

export default {
  user: (): Promise<userinfo> => {
    return new Promise((resolve) => {
      resolve({
        home: '/default',
      });
    });
  },
  file: cockpitFile,
  spawn: (args: string[], attributes: object): Promise<string | Uint8Array> => {
    return new Promise((resolve) => {
      resolve('');
    });
  },
  http: (address: string, options: object) => {
    return {
      get: (urlpath: string, headers?: object): string => {
        return JSON.stringify(mockStatus(path.parse(urlpath).name));
      },
      post: (path: string, data: object, headers?: object): string => {
        return '';
      },
    };
  },
};
