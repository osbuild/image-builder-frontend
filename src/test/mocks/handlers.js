import { rest } from 'msw';

import { PROVISIONING_SOURCES_ENDPOINT } from '../../constants';

const baseURL = 'http://localhost';

export const handlers = [
  rest.get(
    baseURL.concat(`${PROVISIONING_SOURCES_ENDPOINT}`),
    (req, res, ctx) => {
      const provider = req.url.searchParams.get('provider');
      if (provider === 'aws') {
        return res(
          ctx.status(200),
          ctx.json([
            {
              id: '123',
              name: 'my_source',
              source_type_id: '1',
              uid: 'de5e35d4-4c1f-49d7-9ef3-7d08e6b9c76a',
            },
          ])
        );
      }
    }
  ),
  rest.get(
    baseURL.concat(
      `${PROVISIONING_SOURCES_ENDPOINT}/:accountId/account_identity`
    ),
    (req, res, ctx) => {
      const { accountId } = req.params;
      if (accountId === '123') {
        return res(
          ctx.status(200),
          ctx.json({
            aws: {
              account_id: '123456789012',
            },
          })
        );
      } else {
        return res(ctx.status(404));
      }
    }
  ),
];
