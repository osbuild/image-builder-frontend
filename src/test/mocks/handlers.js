import { rest } from 'msw';

import {
  CONTENT_SOURCES,
  PROVISIONING_SOURCES_ENDPOINT,
  RHSM_API,
} from '../../constants';
import { mockRepositoryResults } from '../fixtures/repositories';

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
      } else if (provider === 'azure') {
        return res(
          ctx.status(200),
          ctx.json([
            {
              id: '666',
              name: 'azureSource1',
              source_type_id: '3',
              uid: '9f48059c-25db-47ac-81e8-dac7f8a76170',
            },
            {
              id: '667',
              name: 'azureSource2',
              source_type_id: '3',
              uid: '73d5694c-7a28-417e-9fca-55840084f508',
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
  rest.get(
    baseURL.concat(`${PROVISIONING_SOURCES_ENDPOINT}/:sourceId/upload_info`),
    (req, res, ctx) => {
      const { sourceId } = req.params;
      if (sourceId === '666') {
        return res(
          ctx.status(200),
          ctx.json({
            provider: 'azure',
            azure: {
              tenant_id: '2fd7c95c-0d63-4e81-b914-3fbd5288daf7',
              subscription_id: 'dfb83267-e016-4429-ae6e-b0768bf36d65',
              resource_groups: ['myResourceGroup1', 'testResourceGroup'],
            },
          })
        );
      } else if (sourceId === '667') {
        return res(
          ctx.status(200),
          ctx.json({
            provider: 'azure',
            azure: {
              tenant_id: '73d5694c-7a28-417e-9fca-55840084f508',
              subscription_id: 'a66682d2-ce3e-46f7-a127-1d106c34e10c',
              resource_groups: ['theirGroup2'],
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
  rest.get(baseURL.concat(`${RHSM_API}/activation_keys`), (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        body: [
          {
            id: 0,
            name: 'name0',
          },
          {
            id: 1,
            name: 'name1',
          },
        ],
      })
    );
  }),
  rest.get(
    baseURL.concat(`${RHSM_API}/activation_keys/:key`),
    (req, res, ctx) => {
      const { key } = req.params;
      if (key === 'name0') {
        return res(
          ctx.status(200),
          ctx.json({
            body: {
              additionalRepositories: [
                {
                  repositoryLabel: 'repository0',
                },
                {
                  repositoryLabel: 'repository1',
                },
                {
                  repositoryLabel: 'repository2',
                },
              ],
              id: '0',
              name: 'name0',
              releaseVersion: '',
              role: '',
              serviceLevel: 'Self-Support',
              usage: 'Production',
            },
          })
        );
      } else if (key === 'name1') {
        return res(
          ctx.status(200),
          ctx.json({
            body: {
              additionalRepositories: [
                {
                  repositoryLabel: 'repository3',
                },
                {
                  repositoryLabel: 'repository4',
                },
                {
                  repositoryLabel: 'repository5',
                },
              ],
              id: '1',
              name: 'name1',
              releaseVersion: '',
              role: '',
              serviceLevel: 'Premium',
              usage: 'Production',
            },
          })
        );
      }
    }
  ),
  rest.get(
    baseURL.concat(`${CONTENT_SOURCES}/repositories/`),
    (req, res, ctx) => {
      const available_for_arch = req.url.searchParams.get('available_for_arch');
      const available_for_version = req.url.searchParams.get(
        'available_for_version'
      );
      const limit = req.url.searchParams.get('limit');
      const args = { available_for_arch, available_for_version, limit };
      return res(ctx.status(200), ctx.json(mockRepositoryResults(args)));
    }
  ),
];
