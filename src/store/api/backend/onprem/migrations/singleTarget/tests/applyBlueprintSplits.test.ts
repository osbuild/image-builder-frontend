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
const backupPath = '/state/cockpit-image-builder-backup-12345678';
const backupTemplate = '/state/cockpit-image-builder-backup-XXXXXXXX';
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
  vi.mocked(getBlueprintSplits).mockImplementation(async () => {
    operations.push('plan');
    return {
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
    };
  });
  vi.mocked(cockpit.spawn).mockImplementation((args) => {
    operations.push(args.join(' '));
    return Promise.resolve(args[0] === 'mktemp' ? backupPath : '') as never;
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
  it('backs up affected directories after planning and before migration writes', async () => {
    const { operations, writes } = setup();

    await applyBlueprintSplits();

    expect(operations).toEqual([
      'plan',
      `mktemp -d ${backupTemplate}`,
      `cp -a -- ${root}/source ${backupPath}`,
      `mkdir -p ${root}/${childId}`,
      `replace ${root}/${childId}/${childId}.json`,
      `replace ${childComposePath}`,
      `replace ${sourceBlueprintPath}`,
      `rm -f ${sourceComposePath}`,
      `rm -rf -- ${backupPath}`,
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

  it('does not write migration data when the backup fails', async () => {
    const { operations } = setup();
    vi.mocked(cockpit.spawn).mockImplementation((args) => {
      operations.push(args.join(' '));
      if (args[0] === 'cp')
        return Promise.reject(new Error('backup failed')) as never;
      return Promise.resolve(backupPath) as never;
    });

    const failure = await applyBlueprintSplits().catch(
      (reason: unknown) => reason,
    );

    expect(failure).toHaveProperty('message', 'backup failed');
    expect(failure).toHaveProperty('stage', 'backup');
    expect(failure).toHaveProperty('backupPath', backupPath);
    expect(operations).toEqual([
      'plan',
      `mktemp -d ${backupTemplate}`,
      `cp -a -- ${root}/source ${backupPath}`,
    ]);
  });

  it('reports a backup creation failure before a path is available', async () => {
    const { operations } = setup();
    vi.mocked(cockpit.spawn).mockImplementation((args) => {
      operations.push(args.join(' '));
      return Promise.reject(new Error('mktemp failed')) as never;
    });

    const failure = await applyBlueprintSplits().catch(
      (reason: unknown) => reason,
    );

    expect(failure).toHaveProperty('message', 'mktemp failed');
    expect(failure).toHaveProperty('stage', 'backup');
    expect(failure).not.toHaveProperty('backupPath');
    expect(operations).toEqual(['plan', `mktemp -d ${backupTemplate}`]);
  });

  it('does not fail a successful migration if backup cleanup fails', async () => {
    const { operations } = setup();
    vi.mocked(cockpit.spawn).mockImplementation((args) => {
      operations.push(args.join(' '));
      if (args[0] === 'rm' && args[1] === '-rf')
        return Promise.reject(new Error('cleanup failed')) as never;
      return Promise.resolve(args[0] === 'mktemp' ? backupPath : '') as never;
    });

    await expect(applyBlueprintSplits()).resolves.toBeUndefined();
    expect(operations[operations.length - 1]).toBe(`rm -rf -- ${backupPath}`);
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

    const failure = await applyBlueprintSplits().catch(
      (reason: unknown) => reason,
    );

    expect(failure).toHaveProperty('message', 'write failed');
    expect(failure).toHaveProperty('stage', 'migration');
    expect(failure).toHaveProperty('backupPath', backupPath);
    expect(operations).not.toContain(`replace ${sourceBlueprintPath}`);
    expect(operations).not.toContain(`rm -f ${sourceComposePath}`);
    expect(operations).not.toContain(`rm -rf -- ${backupPath}`);
  });

  it('does not write when planning reports an error', async () => {
    setup();
    vi.mocked(getBlueprintSplits).mockResolvedValue({
      error: { blueprintId: 'source', code: 'duplicate-target' },
    });

    await expect(applyBlueprintSplits()).rejects.toMatchObject({
      message: 'Could not split blueprint source: duplicate-target',
      stage: 'planning',
    });
    expect(cockpit.spawn).not.toHaveBeenCalled();
    expect(cockpit.file).not.toHaveBeenCalled();
  });
});
