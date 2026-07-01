/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';

import type { Headers, Method, Params } from '@/store/api/shared';

import { mockStatus } from '../../fixtures/composes';

type requestOptions = {
  path: string;
  method: Method;
  body: unknown;
  headers: Headers | undefined;
  params: Params | undefined;
};

export const cockpitHTTP = (address: string, attr: object) => {
  return {
    request: (request: requestOptions): Promise<string> => {
      if (request.path.startsWith('/api/image-builder-composer/v2/composes/')) {
        return new Promise((resolve) => {
          resolve(JSON.stringify(mockStatus(path.parse(request.path).name)));
        });
      }
      if (
        request.path.startsWith('/api/image-builder-composer/v2/distributions/')
      ) {
        const distro = path.parse(request.path).base;
        return new Promise((resolve) => {
          resolve(
            JSON.stringify({
              name: distro,
              architectures: {},
            }),
          );
        });
      }
      return new Promise((resolve) => {
        resolve('');
      });
    },
  };
};
