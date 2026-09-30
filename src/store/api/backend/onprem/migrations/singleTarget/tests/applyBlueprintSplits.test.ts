import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBlueprintsPath } from '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath';

import { applyBlueprintSplits } from '../applyBlueprintSplits';
import { getBlueprintSplits } from '../getBlueprintSplits';

vi.mock('cockpit', () => ({
  default: { file: vi.fn(), spawn: vi.fn() },
}));
vi.mock('cockpit/fsinfo', () => ({ fsinfo: vi.fn() }));
vi.mock(
  '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath',
  () => ({ getBlueprintsPath: vi.fn() }),
);
vi.mock('../getBlueprintSplits', () => ({ getBlueprintSplits: vi.fn() }));

const root = '/state/cockpit-image-builder';
const migrationMarker = '.single-target-migration-complete';
const migrationMarkerPath = `${root}/${migrationMarker}`;
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
  let migrationComplete = false;
  let markerWriteFails = false;
  vi.clearAllMocks();
  vi.mocked(getBlueprintsPath).mockResolvedValue(root);
  vi.mocked(fsinfo).mockImplementation(async (filePath, attributes) => {
    operations.push(`fsinfo ${filePath}`);
    return {
      entries:
        filePath === root && migrationComplete
          ? {
              [migrationMarker]: attributes.includes('type')
                ? { type: 'reg' }
                : {},
            }
          : {},
      mtime: 1,
      type: 'dir',
    } as never;
  });
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
          if (filePath === migrationMarkerPath && markerWriteFails)
            throw new Error('marker write failed');
          writes.set(filePath, contents);
          if (filePath === migrationMarkerPath) migrationComplete = true;
        }),
      }) as never,
  );

  return {
    operations,
    writes,
    setMigrationComplete: () => {
      migrationComplete = true;
    },
    failMarkerWrites: () => {
      markerWriteFails = true;
    },
  };
};

afterEach(() => vi.restoreAllMocks());

describe('applyBlueprintSplits', () => {
  it('skips planning when the migration marker exists', async () => {
    const { operations, setMigrationComplete } = setup();
    setMigrationComplete();

    await applyBlueprintSplits();

    expect(operations).toEqual([`fsinfo ${root}`]);
    expect(fsinfo).toHaveBeenCalledWith(root, ['entries', 'type']);
    expect(getBlueprintSplits).not.toHaveBeenCalled();
    expect(cockpit.spawn).not.toHaveBeenCalled();
  });

  it('writes the marker when there are no blueprints to migrate', async () => {
    const { operations, writes } = setup();
    vi.mocked(getBlueprintSplits).mockImplementation(async () => {
      operations.push('plan');
      return { splits: [] };
    });

    await applyBlueprintSplits();

    expect(operations).toEqual([
      `fsinfo ${root}`,
      'plan',
      `replace ${migrationMarkerPath}`,
    ]);
    expect(writes.get(migrationMarkerPath)).toBe('');
    expect(cockpit.spawn).not.toHaveBeenCalled();
  });

  it('continues when the marker cannot be written', async () => {
    const { operations, writes, failMarkerWrites } = setup();
    vi.mocked(getBlueprintSplits).mockResolvedValue({ splits: [] });
    failMarkerWrites();

    await expect(applyBlueprintSplits()).resolves.toBeUndefined();

    expect(operations).toContain(`replace ${migrationMarkerPath}`);
    expect(writes.has(migrationMarkerPath)).toBe(false);
  });

  it('backs up affected directories after planning and before migration writes', async () => {
    const { operations, writes } = setup();

    await applyBlueprintSplits();

    expect(operations).toEqual([
      `fsinfo ${root}`,
      'plan',
      `mktemp -d ${backupTemplate}`,
      `cp -a -- ${root}/source ${backupPath}`,
      `mkdir -p ${root}/${childId}`,
      `replace ${root}/${childId}/${childId}.json`,
      `replace ${childComposePath}`,
      `replace ${sourceBlueprintPath}`,
      `rm -f ${sourceComposePath}`,
      `replace ${migrationMarkerPath}`,
      `rm -rf -- ${backupPath}`,
    ]);
    expect(writes.get(migrationMarkerPath)).toBe('');
    expect(JSON.parse(writes.get(childComposePath)!)).toEqual(composeRequest);
    expect(JSON.parse(writes.get(sourceBlueprintPath)!)).toEqual(
      sourceBlueprint,
    );
    expect(
      vi
        .mocked(fsinfo)
        .mock.calls.every(([, , options]) => !options?.superuser),
    ).toBe(true);
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
      `fsinfo ${root}`,
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
    expect(operations).toEqual([
      `fsinfo ${root}`,
      'plan',
      `mktemp -d ${backupTemplate}`,
    ]);
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
    expect(operations).not.toContain(`replace ${migrationMarkerPath}`);
    expect(operations).not.toContain(`rm -rf -- ${backupPath}`);
  });

  it('does not write when planning reports an error', async () => {
    const { writes } = setup();
    vi.mocked(getBlueprintSplits).mockResolvedValue({
      error: { blueprintId: 'source', code: 'duplicate-target' },
    });

    await expect(applyBlueprintSplits()).rejects.toMatchObject({
      message: 'Could not split blueprint source: duplicate-target',
      stage: 'planning',
    });
    expect(cockpit.spawn).not.toHaveBeenCalled();
    expect(writes.has(migrationMarkerPath)).toBe(false);
  });
});
