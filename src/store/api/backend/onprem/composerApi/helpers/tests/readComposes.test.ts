import { fsinfo } from 'cockpit/fsinfo';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBlueprintsPath } from '../getBlueprintsPath';
import { readComposes } from '../readComposes';
import { safeReadJsonFile } from '../safeReadJsonFile';

vi.mock('cockpit/fsinfo', () => ({
  fsinfo: vi.fn(),
}));

vi.mock('../getBlueprintsPath', () => ({
  getBlueprintsPath: vi.fn(),
}));

vi.mock('../safeReadJsonFile', () => ({
  safeReadJsonFile: vi.fn(),
}));

const mockRequest = (distro: string) => ({
  distribution: distro,
  image_requests: [],
});

describe('readComposes', () => {
  const bpID = 'my-blueprint';
  const blueprintsDir = '/var/lib/image-builder/blueprints';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(getBlueprintsPath).mockResolvedValue(blueprintsDir);
  });

  it('returns all composes when all files are readable', async () => {
    vi.mocked(fsinfo).mockResolvedValue({
      entries: {
        [`${bpID}.json`]: { mtime: 1000 },
        'compose-1': { mtime: 2000 },
        'compose-2': { mtime: 3000 },
      },
    } as never);

    vi.mocked(safeReadJsonFile)
      .mockResolvedValueOnce(mockRequest('rhel-9'))
      .mockResolvedValueOnce(mockRequest('centos-9'));

    const result = await readComposes(bpID);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'compose-1',
      request: mockRequest('rhel-9'),
      created_at: new Date(2000 * 1000).toString(),
      blueprint_id: bpID,
    });
    expect(result[1]).toEqual({
      id: 'compose-2',
      request: mockRequest('centos-9'),
      created_at: new Date(3000 * 1000).toString(),
      blueprint_id: bpID,
    });
  });

  it('skips unreadable files and returns the rest', async () => {
    vi.mocked(fsinfo).mockResolvedValue({
      entries: {
        [`${bpID}.json`]: { mtime: 1000 },
        'compose-1': { mtime: 2000 },
        'compose-2': { mtime: 3000 },
        'compose-3': { mtime: 4000 },
      },
    } as never);

    vi.mocked(safeReadJsonFile)
      .mockResolvedValueOnce(mockRequest('rhel-9'))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockRequest('centos-9'));

    const result = await readComposes(bpID);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'compose-1',
      request: mockRequest('rhel-9'),
      created_at: new Date(2000 * 1000).toString(),
      blueprint_id: bpID,
    });
    expect(result[1]).toEqual({
      id: 'compose-3',
      request: mockRequest('centos-9'),
      created_at: new Date(4000 * 1000).toString(),
      blueprint_id: bpID,
    });
  });

  it('returns empty array when all compose files are unreadable', async () => {
    vi.mocked(fsinfo).mockResolvedValue({
      entries: {
        [`${bpID}.json`]: { mtime: 1000 },
        'compose-1': { mtime: 2000 },
        'compose-2': { mtime: 3000 },
      },
    } as never);

    vi.mocked(safeReadJsonFile)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const result = await readComposes(bpID);

    expect(result).toEqual([]);
  });

  it('skips the blueprint JSON file', async () => {
    vi.mocked(fsinfo).mockResolvedValue({
      entries: {
        [`${bpID}.json`]: { mtime: 1000 },
        'compose-1': { mtime: 2000 },
      },
    } as never);

    vi.mocked(safeReadJsonFile).mockResolvedValueOnce(mockRequest('rhel-9'));

    const result = await readComposes(bpID);

    expect(result).toHaveLength(1);
    expect(safeReadJsonFile).toHaveBeenCalledTimes(1);
    expect(safeReadJsonFile).toHaveBeenCalledWith(
      `${blueprintsDir}/${bpID}/compose-1`,
    );
  });
});
