import cockpit from 'cockpit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listPodmanImages } from '../podmanImages';

vi.mock('cockpit', () => ({
  default: {
    spawn: vi.fn(),
  },
}));

describe('listPodmanImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the result from cockpit.spawn', async () => {
    const mockOutput = '[{"Names":["registry.redhat.io/rhel9/rhel-bootc"]}]';
    vi.mocked(cockpit.spawn).mockResolvedValue(mockOutput);

    const result = await listPodmanImages();

    expect(result).toBe(mockOutput);
    expect(cockpit.spawn).toHaveBeenCalledWith(
      [
        'podman',
        'images',
        '--filter',
        'reference=registry.redhat.io/rhel*/rhel-bootc',
        '--format',
        'json',
      ],
      { superuser: 'require' },
    );
  });

  it('returns an empty JSON array when the result is empty', async () => {
    vi.mocked(cockpit.spawn).mockResolvedValue('  ');

    const result = await listPodmanImages();

    expect(result).toBe('[]');
  });

  it('returns an empty JSON array when the result is a blank string', async () => {
    vi.mocked(cockpit.spawn).mockResolvedValue('');

    const result = await listPodmanImages();

    expect(result).toBe('[]');
  });

  it('throws when cockpit.spawn fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(cockpit.spawn).mockRejectedValue(new Error('spawn failed'));

    await expect(listPodmanImages()).rejects.toThrow(
      'Unable to list local images',
    );
    consoleSpy.mockRestore();
  });
});
