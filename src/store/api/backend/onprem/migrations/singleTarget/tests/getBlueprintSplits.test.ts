import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBlueprintsPath } from '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath';

import { getBlueprintSplits } from '../getBlueprintSplits';

vi.mock('cockpit', () => ({ default: { file: vi.fn() } }));
vi.mock('cockpit/fsinfo', () => ({ fsinfo: vi.fn() }));
vi.mock(
  '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath',
  () => ({
    getBlueprintsPath: vi.fn(),
  }),
);

const root = '/state/cockpit-image-builder';
const awsX86 = { image_type: 'aws', architecture: 'x86_64' };
const awsArm = { image_type: 'aws', architecture: 'aarch64' };
const gcpX86 = { image_type: 'gcp', architecture: 'x86_64' };
const blueprint = (name: string, image_requests: unknown[]) => ({
  name,
  image_requests,
  customizations: { packages: ['vim'] },
  future_field: { preserved: true },
});

const setup = (
  blueprints: Record<string, unknown>,
  composes: Record<string, Record<string, unknown>> = {},
  nonRegularComposeId?: string,
) => {
  const directories = new Map<string, unknown>([
    [
      root,
      {
        type: 'dir',
        entries: Object.fromEntries(
          Object.keys(blueprints).map((id) => [id, { type: 'dir' }]),
        ),
      },
    ],
  ]);
  const files = new Map<string, string>();

  for (const [id, definition] of Object.entries(blueprints)) {
    const dirname = `${root}/${id}`;
    const requests = composes[id] ?? {};
    directories.set(dirname, {
      entries: {
        [`${id}.json`]: { type: 'reg' },
        ...Object.fromEntries(
          Object.keys(requests).map((name) => [
            name,
            { type: name === nonRegularComposeId ? 'dir' : 'reg' },
          ]),
        ),
      },
    });
    files.set(`${dirname}/${id}.json`, JSON.stringify(definition));
    for (const [composeId, request] of Object.entries(requests)) {
      files.set(`${dirname}/${composeId}`, JSON.stringify(request));
    }
  }

  vi.clearAllMocks();
  vi.mocked(getBlueprintsPath).mockResolvedValue(root);
  vi.mocked(fsinfo).mockImplementation(async (filename, attributes) => {
    const info = directories.get(filename) as
      | { type?: string; entries?: Record<string, { type?: string }> }
      | undefined;
    if (!info) throw new Error('unavailable');
    if (attributes.includes('type')) return info as never;
    return {
      ...info,
      type: undefined,
      entries: Object.fromEntries(
        Object.entries(info.entries ?? {}).map(([name, entry]) => [
          name,
          { ...entry, type: undefined },
        ]),
      ),
    } as never;
  });
  vi.mocked(cockpit.file).mockImplementation(
    (filename: string) =>
      ({
        read: vi.fn().mockResolvedValue(files.get(filename)),
      }) as never,
  );
};

afterEach(() => vi.restoreAllMocks());

describe('getBlueprintSplits', () => {
  it('splits targets and assigns composes by image type and architecture', async () => {
    setup(
      {
        source: blueprint('Workstation', [awsX86, awsArm, gcpX86]),
        existing: blueprint('Existing', [gcpX86]),
      },
      {
        source: {
          'aws-x86': { image_requests: [awsX86] },
          'aws-arm': { image_requests: [awsArm] },
          'gcp-x86': { image_requests: [gcpX86] },
        },
      },
    );
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
      .mockReturnValueOnce('22222222-2222-4222-8222-222222222222');

    const result = await getBlueprintSplits();

    expect(result).toEqual({
      splits: [
        {
          sourceId: 'source',
          blueprints: [
            {
              id: 'source',
              blueprint: blueprint('Workstation - aws', [awsX86]),
            },
            {
              id: '11111111-1111-4111-8111-111111111111',
              blueprint: blueprint('Workstation - aws-aarch64', [awsArm]),
            },
            {
              id: '22222222-2222-4222-8222-222222222222',
              blueprint: blueprint('Workstation - gcp', [gcpX86]),
            },
          ],
          composes: [
            { id: 'aws-x86', blueprintId: 'source' },
            {
              id: 'aws-arm',
              blueprintId: '11111111-1111-4111-8111-111111111111',
            },
            {
              id: 'gcp-x86',
              blueprintId: '22222222-2222-4222-8222-222222222222',
            },
          ],
        },
      ],
    });
  });

  it('uses architecture suffixes when the image type name is taken', async () => {
    setup({
      source: blueprint('Workstation', [gcpX86, awsX86, awsArm]),
      existing: blueprint('Workstation - aws', [gcpX86]),
    });
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('22222222-2222-4222-8222-222222222222')
      .mockReturnValueOnce('33333333-3333-4333-8333-333333333333');

    const result = await getBlueprintSplits();

    if ('error' in result) throw new Error('Expected a successful result');

    expect(
      result.splits[0].blueprints
        .slice(1)
        .map(({ blueprint }) => blueprint.name),
    ).toEqual(['Workstation - aws-x86_64', 'Workstation - aws-aarch64']);
  });

  it('does not assign an unmatched compose to the first target', async () => {
    setup(
      { source: blueprint('Workstation', [awsX86, gcpX86]) },
      {
        source: {
          'unmatched-compose': {
            image_requests: [{ image_type: 'azure', architecture: 'x86_64' }],
          },
        },
      },
    );

    await expect(getBlueprintSplits()).resolves.toEqual({
      error: {
        blueprintId: 'source',
        composeId: 'unmatched-compose',
        code: 'unmatched-compose',
      },
    });
  });

  it('reads blueprint data without superuser escalation', async () => {
    setup(
      { source: blueprint('Workstation', [awsX86, gcpX86]) },
      { source: { 'compose-aws': { image_requests: [awsX86] } } },
    );

    await getBlueprintSplits();

    expect(fsinfo).toHaveBeenNthCalledWith(1, root, ['entries', 'type']);
    expect(fsinfo).toHaveBeenNthCalledWith(2, `${root}/source`, [
      'entries',
      'type',
    ]);
    expect(cockpit.file).toHaveBeenNthCalledWith(
      1,
      `${root}/source/source.json`,
    );
    expect(cockpit.file).toHaveBeenNthCalledWith(
      2,
      `${root}/source/compose-aws`,
    );
  });

  it('reports the path and type for invalid compose entries', async () => {
    const composeId = 'compose-directory';
    setup(
      { source: blueprint('Workstation', [awsX86, gcpX86]) },
      { source: { [composeId]: { image_requests: [awsX86] } } },
      composeId,
    );

    await expect(getBlueprintSplits()).rejects.toThrow(
      `Invalid compose file ${root}/source/${composeId}: expected a regular file, found dir`,
    );
  });

  it('does not read composes for single-target blueprints', async () => {
    setup({ source: blueprint('Single', [awsX86]) });

    await expect(getBlueprintSplits()).resolves.toEqual({
      splits: [],
    });
    expect(fsinfo).toHaveBeenCalledTimes(1);
  });
});
