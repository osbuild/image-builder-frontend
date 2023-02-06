import { rest } from 'msw';

import { PROVISIONING_SOURCES_ENDPOINT } from '../../constants';

const baseURL = 'http://localhost';

export const handlers = [
  rest.get(baseURL.concat(PROVISIONING_SOURCES_ENDPOINT), (req, res, ctx) => {
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
  }),
];
