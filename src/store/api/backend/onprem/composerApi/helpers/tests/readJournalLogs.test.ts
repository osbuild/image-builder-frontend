import cockpit from 'cockpit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readJournalLogs } from '../readJournalLogs';

vi.mock('cockpit', () => ({
  default: {
    spawn: vi.fn(),
  },
}));

describe('readJournalLogs', () => {
  const composeId = 'abc-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns journal output for a compose', async () => {
    vi.mocked(cockpit.spawn).mockResolvedValue(
      'Starting build...\nBuild failed with exit code 1\n',
    );

    const result = await readJournalLogs(composeId);

    expect(result).toBe('Starting build...\nBuild failed with exit code 1');
  });

  it('passes correct journalctl arguments', async () => {
    vi.mocked(cockpit.spawn).mockResolvedValue('');

    await readJournalLogs(composeId);

    expect(cockpit.spawn).toHaveBeenCalledWith(
      [
        'journalctl',
        '-q',
        '--lines=50',
        '--output=cat',
        '--',
        `_SYSTEMD_UNIT=cockpit-image-builder-${composeId}.service`,
      ],
      { superuser: 'try' },
    );
  });

  it('returns undefined when no entries are returned', async () => {
    vi.mocked(cockpit.spawn).mockResolvedValue('');

    const result = await readJournalLogs(composeId);

    expect(result).toBeUndefined();
  });

  it('returns undefined and logs when journalctl rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('access denied');
    vi.mocked(cockpit.spawn).mockRejectedValue(error);

    const result = await readJournalLogs(composeId);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      `Failed to read journal logs for ${composeId}:`,
      error,
    );
  });
});
