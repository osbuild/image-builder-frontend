/* eslint-disable @typescript-eslint/no-unused-vars */

import path from 'path';

import { cockpitFile } from './cockpitFile';
import { cockpitHTTP } from './cockpitHTTP';

type userinfo = {
  home: string;
};

export default {
  transport: {
    host: '',
  },
  jump: (url: string, host: string) => {},
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
      if (args.length && args[0] === 'uname') {
        resolve('x86_64');
      }
      resolve('');
    });
  },
  http: cockpitHTTP,
};
