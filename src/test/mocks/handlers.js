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
  rest.post(
    baseURL.concat('/api/content-sources/v1/rpms/names'),
    async (req, res, ctx) => {
      const { search } = await req.json();
      if (search === 'test') {
        return res(
          ctx.status(200),
          ctx.json([
            {
              name: 'testPkg',
              summary: 'test package summary',
              version: '1.0',
            },
            {
              name: 'lib-test',
              summary: 'lib-test package summary',
              version: '1.0',
            },
            {
              name: 'test',
              summary: 'summary for test package',
              version: '1.0',
            },
          ])
        );
      } else if (search === 'asdf') {
        return res(ctx.status(200), ctx.json([]));
      }
    }
  ),
  rest.get(
    baseURL.concat('/api/image-builder/v1/packages'),
    (req, res, ctx) => {
      const search = req.url.searchParams.get('search');
      if (search === 'test') {
        return res(
          ctx.status(200),
          ctx.json({
            data: [
              {
                name: 'testPkg',
                summary: 'test package summary',
                version: '1.0',
              },
              {
                name: 'lib-test',
                summary: 'lib-test package summary',
                version: '1.0',
              },
              {
                name: 'test',
                summary: 'summary for test package',
                version: '1.0',
              },
            ],
            meta: {
              count: 3,
            },
          })
        );
      } else if (search === 'asdf') {
        return res(ctx.status(200), ctx.json({ data: [], meta: 0 }));
      }
    }
  ),
  rest.get(
    baseURL.concat('/api/image-builder/v1/architectures/:distro'),
    (req, res, ctx) => {
      const { distro } = req.params;
      if (distro === 'rhel-91') {
        return res(
          ctx.status(200),
          ctx.json([
            {
              arch: 'x86_64',
              repositories: [
                {
                  baseurl:
                    'https://cdn.redhat.com/content/dist/rhel9/9.1/x86_64/baseos/os',
                  rhsm: true,
                },
              ],
            },
            {
              arch: 'aarch64',
              repositories: [
                {
                  baseurl:
                    'https://cdn.redhat.com/content/dist/rhel9/9.1/aarch64/baseos/os',
                  rhsm: true,
                },
              ],
            },
          ])
        );
      } else if (distro === 'rhel-87') {
        return res(
          ctx.status(200),
          ctx.json([
            {
              arch: 'x86_64',
              repositories: [
                {
                  baseurl:
                    'https://cdn.redhat.com/content/dist/rhel8/8.7/x86_64/baseos/os',
                  rhsm: true,
                },
              ],
            },
            {
              arch: 'aarch64',
              repositories: [
                {
                  baseurl:
                    'https://cdn.redhat.com/content/dist/rhel8/8.7/aarch64/baseos/os',
                  rhsm: true,
                },
              ],
            },
          ])
        );
      } else if (distro === 'centos-8') {
        return res(
          ctx.status(200),
          ctx.json([
            {
              arch: 'x86_64',
              repositories: [
                {
                  baseurl:
                    'http://mirror.centos.org/centos/8-stream/BaseOS/x86_64/os/',
                  rhsm: false,
                },
              ],
            },
            {
              arch: 'aarch64',
              repositories: [
                {
                  baseurl:
                    'http://mirror.centos.org/centos/8-stream/BaseOS/aarch64/os/',
                  rhsm: false,
                },
              ],
            },
          ])
        );
      }
    }
  ),
];
