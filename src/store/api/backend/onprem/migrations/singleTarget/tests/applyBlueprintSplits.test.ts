import cockpit from 'cockpit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBlueprintsPath } from '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath';

import { applyBlueprintSplits } from '../applyBlueprintSplits';
import { getBlueprintSplits } from '../getBlueprintSplits';

vi.mock('cockpit', () => ({
  default: { file: vi.fn(), spawn: vi.fn() },
}));
vi.mock(
  '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath',
  () => ({ getBlueprintsPath: vi.fn() }),
);
vi.mock('../getBlueprintSplits', () => ({ getBlueprintSplits: vi.fn() }));

const root = '/state/cockpit-image-builder';
const sourceRequest = { image_type: 'aws', architecture: 'x86_64' };
const childRequest = { image_type: 'gcp', architecture: 'x86_64' };
const composeRequest = { image_requests: [childRequest] };
const sourceBlueprint = {
  name: 'Workstation',
  image_requests: [sourceRequest],
} as never;
const childBlueprint = {
  name: 'Workstation - gcp',
  image_requests: [childRequest],
} as never;
const childId = '11111111-1111-4111-8111-111111111111';
const childComposePath = `${root}/${childId}/compose-child`;
const sourceBlueprintPath = `${root}/source/source.json`;
const sourceComposePath = `${root}/source/compose-child`;

const setup = () => {
  const operations: string[] = [];
  const writes = new Map<string, string>();
  vi.clearAllMocks();
  vi.mocked(getBlueprintsPath).mockResolvedValue(root);
  vi.mocked(getBlueprintSplits).mockResolvedValue({
    splits: [
      {
        sourceId: 'source',
        blueprints: [
          { id: 'source', blueprint: sourceBlueprint },
          { id: childId, blueprint: childBlueprint },
        ],
        composes: [
          {
            id: 'compose-source',
            blueprintId: 'source',
            request: { image_requests: [sourceRequest] } as never,
          },
          {
            id: 'compose-child',
            blueprintId: childId,
            request: composeRequest as never,
          },
        ],
      },
    ],
  });
  vi.mocked(cockpit.spawn).mockImplementation((args) => {
    operations.push(args.join(' '));
    return Promise.resolve('') as never;
  });
  vi.mocked(cockpit.file).mockImplementation(
    (filePath: string) =>
      ({
        replace: vi.fn(async (contents: string) => {
          operations.push(`replace ${filePath}`);
          writes.set(filePath, contents);
        }),
      }) as never,
  );

  return { operations, writes };
};

afterEach(() => vi.restoreAllMocks());

describe('applyBlueprintSplits', () => {
  it('writes child data before replacing the source and removing copied composes', async () => {
    const { operations, writes } = setup();

    await applyBlueprintSplits();

    expect(operations).toEqual([
      `mkdir -p ${root}/${childId}`,
      `replace ${root}/${childId}/${childId}.json`,
      `replace ${childComposePath}`,
      `replace ${sourceBlueprintPath}`,
      `rm -f ${sourceComposePath}`,
    ]);
    expect(JSON.parse(writes.get(childComposePath)!)).toEqual(composeRequest);
    expect(JSON.parse(writes.get(sourceBlueprintPath)!)).toEqual(
      sourceBlueprint,
    );
    expect(
      vi
        .mocked(cockpit.spawn)
        .mock.calls.every(([, options]) => !options?.superuser),
    ).toBe(true);
    expect(
      vi
        .mocked(cockpit.file)
        .mock.calls.every(([, options]) => !options?.superuser),
    ).toBe(true);
  });

  it('leaves source files untouched when staging a child compose fails', async () => {
    const { operations } = setup();
    vi.mocked(cockpit.file).mockImplementation(
      (filePath: string) =>
        ({
          replace: vi.fn(async () => {
            if (filePath === childComposePath) throw new Error('write failed');
            operations.push(`replace ${filePath}`);
          }),
        }) as never,
    );

    await expect(applyBlueprintSplits()).rejects.toThrow('write failed');
    expect(operations).not.toContain(`replace ${sourceBlueprintPath}`);
    expect(operations).not.toContain(`rm -f ${sourceComposePath}`);
  });

  it('does not write when planning reports an error', async () => {
    setup();
    vi.mocked(getBlueprintSplits).mockResolvedValue({
      error: { blueprintId: 'source', code: 'duplicate-target' },
    });

    await expect(applyBlueprintSplits()).rejects.toThrow(
      'Could not split blueprint source: duplicate-target',
    );
    expect(cockpit.spawn).not.toHaveBeenCalled();
    expect(cockpit.file).not.toHaveBeenCalled();
  });
});
