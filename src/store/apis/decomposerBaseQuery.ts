import { BaseQueryFn } from '@reduxjs/toolkit/query';
import cockpit from 'cockpit';

import { Headers, Method, Params } from './decomposerTypes';

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
    // Prepare the body for sending
    const body =
      typeof options.body === 'object' && options.body !== null
        ? JSON.stringify(options.body)
        : (options.body ?? '');

    // TODO: maybe there is a cleaner way of doing this
    const headers = ['POST', 'PUT'].includes(options.method!)
      ? {
          ...options.headers,
          // we need this for post & put requests
          // otherwise decomposer doesn't reqcognise
          // the request body
          'Content-Type': 'application/json',
        }
      : options.headers;

    // we need to wrap this call in a Promise rather than
    // async/await because cockpit rejects the http request
    // with two arguments (error & data/body)
    return new Promise((resolve, reject) => {
      const cloudApi = cockpit.http('/tmp/decomposer-httpd.sock', {
        superuser: 'try',
      });
      return cloudApi
        .request({
          path: baseUrl + options.url,
          body: body,
          method: options.method ?? 'GET',
          params: options.params,
          headers: headers,
        })
        .then((result) => {
          // Log the successful response
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
