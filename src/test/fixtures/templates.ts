import {
  ApiLinks,
  ApiResponseMetadata,
  ApiTemplateResponse,
  ApiTemplateResponseRead,
  ListTemplatesApiArg,
} from '../../store/contentSourcesApi';

type templateArgs = {
  arch: ListTemplatesApiArg['arch'];
  version: ListTemplatesApiArg['version'];
  limit: ListTemplatesApiArg['limit'];
  offset: ListTemplatesApiArg['offset'];
};

export const mockTemplateResults = (request: templateArgs) => {
  const templates = filterTemplates(request);
  const limit = request.limit ? request.limit : 100;
  const data = templates.slice(request.offset, limit);
  const meta = generateMeta(request.limit, request.offset, templates.length);
  const links = generateLinks(request.limit, request.offset);
  const response = {
    data: data,
    meta: meta,
    links: links,
  };
  return response;
};

const filterTemplates = (args: templateArgs): ApiTemplateResponse[] => {
  let templates = testingTemplates;

  if (args.arch) {
    templates = templates.filter((template) => template.arch === args.arch);
  }

  if (args.version) {
    templates = templates.filter(
      (template) => template.version === args.version
    );
  }

  return templates;
};

const testingTemplates: ApiTemplateResponseRead[] = [
  {
    uuid: 'c40e221b-93d6-4f7e-a704-f3041b8d75c3',
    name: 'template-abc',
    org_id: '13476545',
    description: 'description-abc',
    arch: 'x86_64',
    version: '9',
    date: '0001-01-01T00:00:00Z',
    repository_uuids: [
      '828e7db8-c0d4-48fc-a887-9070e0e75c45',
      'ae39f556-6986-478a-95d1-f9c7e33d066c',
    ],
    snapshots: [
      {
        uuid: '90302927-848a-4fa9-ba44-c58bb162a009',
        created_at: '2025-02-27T16:23:59.148649Z',
        repository_path: 'test/snapshot1',
        content_counts: {
          'rpm.advisory': 5,
          'rpm.package': 5,
          'rpm.repo_metadata_file': 1,
        },
        added_counts: {
          'rpm.advisory': 5,
          'rpm.package': 5,
          'rpm.repo_metadata_file': 1,
        },
        removed_counts: {},
        url: 'http://test.com/test/snapshot1/',
        repository_name: '2zmya',
        repository_uuid: '828e7db8-c0d4-48fc-a887-9070e0e75c45',
      },
      {
        uuid: '80303926-948a-4fa8-ba44-c59bb162a008',
        created_at: '2025-02-27T16:23:59.148649Z',
        repository_path: 'test/snapshot2',
        content_counts: {
          'rpm.advisory': 5,
          'rpm.package': 5,
          'rpm.repo_metadata_file': 1,
        },
        added_counts: {
          'rpm.advisory': 5,
          'rpm.package': 5,
          'rpm.repo_metadata_file': 1,
        },
        removed_counts: {},
        url: 'http://test.com/test/snapshot2/',
        repository_name: '01-test-valid-repo',
        repository_uuid: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
      },
    ],
    rhsm_environment_id: '4202ed8d725e46079cc7454a64b69093',
    created_by: 'test',
    last_updated_by: 'test',
    created_at: '2025-02-28T17:34:33.598161Z',
    updated_at: '2025-02-28T17:34:33.598161Z',
    use_latest: true,
    last_update_snapshot_error: '',
    last_update_task_uuid: '9aa99713-65d1-4057-908e-96150573a22f',
    last_update_task: {
      uuid: '9aa99713-65d1-4057-908e-96150573a22f',
      status: 'completed',
      created_at: '2025-02-28T17:34:33Z',
      ended_at: '2025-02-28T17:34:34Z',
      error: '',
      org_id: '13476545',
      type: 'update-template-content',
      object_type: 'template',
      object_name: 'template-abc',
      object_uuid: 'c40e221b-93d6-4f7e-a704-f3041b8d75c3',
    },
    rhsm_environment_created: true,
  },
  {
    uuid: '4202ed8d-725e-4607-9cc7-454a64b69093',
    name: 'template-xyz',
    org_id: '13476545',
    description: 'description-xyz',
    arch: 'x86_64',
    version: '9',
    date: '2025-02-28T05:00:00Z',
    repository_uuids: ['828e7db8-c0d4-48fc-a887-9070e0e75c45'],
    snapshots: [
      {
        uuid: '90302927-848a-4fa9-ba44-c58bb162a009',
        created_at: '2025-02-27T16:23:59.148649Z',
        repository_path: 'test/snapshot1',
        content_counts: {
          'rpm.advisory': 5,
          'rpm.package': 5,
          'rpm.repo_metadata_file': 1,
        },
        added_counts: {
          'rpm.advisory': 5,
          'rpm.package': 5,
          'rpm.repo_metadata_file': 1,
        },
        removed_counts: {},
        url: 'http://test.com/test/snapshot1/',
        repository_name: '2zmya',
        repository_uuid: '828e7db8-c0d4-48fc-a887-9070e0e75c45',
      },
    ],
    rhsm_environment_id: '4202ed8d725e46079cc7454a64b69093',
    created_by: 'test',
    last_updated_by: 'test',
    created_at: '2025-02-28T18:35:34.792223Z',
    updated_at: '2025-02-28T18:35:34.792223Z',
    use_latest: false,
    last_update_snapshot_error: '',
    last_update_task_uuid: '8bn99713-65d1-4057-908e-96150573a22f',
    last_update_task: {
      uuid: '8bn99713-65d1-4057-908e-96150573a22f',
      status: 'completed',
      created_at: '2025-02-28T17:34:33Z',
      ended_at: '2025-02-28T17:34:34Z',
      error: '',
      org_id: '13476545',
      type: 'update-template-content',
      object_type: 'template',
      object_name: 'template-xyz',
      object_uuid: '4202ed8d-725e-4607-9cc7-454a64b69093',
    },
    rhsm_environment_created: true,
  },
];

const generateMeta = (
  limit: ApiResponseMetadata['limit'],
  offset: ApiResponseMetadata['offset'],
  count: ApiResponseMetadata['count']
): ApiResponseMetadata => {
  return {
    limit: limit,
    offset: offset,
    count: count,
  };
};

const generateLinks = (
  limit: ApiResponseMetadata['limit'],
  offset: ApiResponseMetadata['offset']
): ApiLinks => {
  return {
    first: `/api/content-sources/v1/templates/?limit=${limit}&offset=${offset}`,
    last: `/api/content-sources/v1/templates/?limit=${limit}&offset=${offset}`,
  };
};
