/* eslint-disable @typescript-eslint/no-unused-vars */
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
      if (args.length && args[0] === 'image-builder' && args[1] === 'list') {
        // Mock image-builder list response for on-premise mode
        const mockImageTypes = [
          {
            arch: { name: 'x86_64' },
            image_type: { name: 'qcow2' },
          },
          {
            arch: { name: 'x86_64' },
            image_type: { name: 'image-installer' },
          },
          {
            arch: { name: 'aarch64' },
            image_type: { name: 'qcow2' },
          },
          {
            arch: { name: 'aarch64' },
            image_type: { name: 'image-installer' },
          },
        ];
        resolve(JSON.stringify(mockImageTypes));
      }
      resolve('');
    });
  },
  http: cockpitHTTP,
  permission: cockpitPermission,
};
