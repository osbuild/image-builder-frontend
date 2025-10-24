/* eslint-disable @typescript-eslint/no-unused-vars */

import path from 'path';

import { cockpitFile } from './cockpitFile';
import { cockpitHTTP } from './cockpitHTTP';
import { cockpitPermission } from './cockpitPermission';

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
  script: (script: string): Promise<string | Uint8Array> => {
    return new Promise((resolve) => {
      if (script === 'echo -n $XDG_STATE_HOME') {
        resolve('/default/.local/state');
      }
      resolve('');
    });
  },
  http: cockpitHTTP,
  permission: cockpitPermission,
};
