import { BaseQueryFn } from '@reduxjs/toolkit/query';
import cockpit from 'cockpit';

import type { Headers, Method, Params } from './types.js';

export const baseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string;
      method?: Method;
      body?: unknown;
      params?: Params;
      headers?: Headers;
    },
    // we have to explicitly set the result type as `any`,
    // since each of the endpoints might have a slightly
    // different output. Unfortunately, typescript still
    // complains if we try set the result type as `unknown`
    // see the above comment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    unknown
  > =>
  async (options) => {
    // we need to wrap this call in a Promise rather than
    // async/await because cockpit rejects the http request
    // with two arguments (error & data/body)
    return new Promise((resolve, reject) => {
      const cloudApi = cockpit.http('/run/cloudapi/api.socket', {
        superuser: 'try',
      });

      let body: string;
      try {
        body = JSON.stringify(options.body);
      } catch {
        body = '';
      }

      return cloudApi
        .request({
          path: baseUrl + options.url,
          body: body ?? '',
          method: options.method ?? 'GET',
          params: options.params ?? {},
          headers: options.headers ?? {},
        })
        .then((result: string) => {
          resolve({ data: JSON.parse(result) });
        })
        .catch(
          // cockpit rejects the promise with two arguments.
          // The first argument is the error, the second is the
          // data object from the `osbuild-composer` error.
          // This makes typescript unhappy.
          // @ts-expect-error see above comment
          (error: { message: string; problem: string }, data: string) => {
            let body = data;
            try {
              body = JSON.parse(body);
            } finally {
              reject({
                problem: error.problem,
                message: error.message,
                options,
                body,
              });
            }
          },
        );
    });
  };
