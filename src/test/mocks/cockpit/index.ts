/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Method, Headers, Params } from '../../../store/cockpit/types';

type userinfo = {
  home: string;
};

type requestOptions = {
  path: string;
  method: Method;
  body: unknown;
  headers: Headers | undefined;
  params: Params | undefined;
};

export default {
  transport: {
    host: '',
  },
  jump: (url: string, host: string) => {},
  user: (): Promise<userinfo> => {
    return new Promise((resolve) => {
      resolve({
        home: '',
      });
    });
  },
  file: (path: string) => {
    return {
      read: (): Promise<string> => {
        return new Promise((resolve) => {
          resolve('');
        });
      },
      close: () => {},
      replace: (contents: string): Promise<void> => {
        return new Promise((resolve) => {
          resolve();
        });
      },
    };
  },
  spawn: (args: string[], attributes: object): Promise<string | Uint8Array> => {
    return new Promise((resolve) => {
      resolve('');
    });
  },
  http: (address: string, options: object) => {
    return {
      get: (path?: string, headers?: object): string => {
        return '';
      },
      post: (path: string, data: object, headers?: object): string => {
        return '';
      },
      request: (request: requestOptions): Promise<string> => {
        return new Promise((resolve) => {
          resolve('');
        });
      },
    };
  },
};
