import cockpit from 'cockpit';

import { OnPremBaseQuery } from './types';

export const baseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }): OnPremBaseQuery =>
  async (options, _api, _extraOptions) => {
    // we need to wrap this call in a Promise rather than
    // async/await because cockpit rejects the http request
    // with two arguments (error & data/body)
    return new Promise((resolve, reject) => {
      const cloudApi = cockpit.http('/run/cloudapi/api.socket', {
        superuser: 'try',
      });
      return cloudApi
        .request({
          path: baseUrl + options.url,
          body: options.body ?? '',
          method: options.method ?? 'GET',
          params: options.params,
          headers: options.headers,
        })
        .then((result) => {
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
