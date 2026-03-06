import type { ApiTemplateResponseRead } from '@/store/api/contentSources';

export const mockTemplates: ApiTemplateResponseRead[] = [
  {
    uuid: 'c40e221b-93d6-4f7e-a704-f3041b8d75c3',
    name: 'template-abc',
    arch: 'x86_64',
    version: '10',
    date: '0001-01-01T00:00:00Z',
    use_latest: true,
    last_update_task: {
      status: 'completed',
    },
  },
  {
    uuid: '80b958f8-37f7-4b91-b992-c8f84c05ea2a',
    name: 'template-def',
    arch: 'x86_64',
    version: '10',
    date: '2026-01-01T00:00:00Z',
    use_latest: true,
    last_update_task: {
      status: 'completed',
    },
  },
  {
    uuid: '4202ed8d-725e-4607-9cc7-454a64b69093',
    name: 'template-xyz',
    arch: 'x86_64',
    version: '10',
    date: '2025-02-28T05:00:00Z',
    use_latest: false,
    last_update_task: {
      status: 'completed',
    },
  },
];
