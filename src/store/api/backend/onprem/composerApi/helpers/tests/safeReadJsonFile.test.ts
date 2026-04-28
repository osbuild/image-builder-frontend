import cockpit from 'cockpit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { safeReadJsonFile } from '../safeReadJsonFile';

vi.mock('cockpit', () => ({
  default: {
    file: vi.fn(),
  },
}));

type TestData = {
  name: string;
  value: number;
};

describe('safeReadJsonFile', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns parsed JSON when file read succeeds', async () => {
    const mockData: TestData = { name: 'test', value: 42 };
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
    } as never);

    const result = await safeReadJsonFile<TestData>('/path/to/file.json');

    expect(result).toEqual(mockData);
    expect(cockpit.file).toHaveBeenCalledWith('/path/to/file.json');
  });

  it('returns null when cockpit.file().read() throws', async () => {
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockRejectedValue(new Error('File not found')),
    } as never);

    const result = await safeReadJsonFile<TestData>('/nonexistent/file.json');

    expect(result).toBeNull();
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalledWith(
      'Failed to read JSON file: /nonexistent/file.json',
      expect.any(Error),
    );
  });

  it('returns null when JSON.parse fails', async () => {
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockResolvedValue('not valid json{{{'),
    } as never);

    const result = await safeReadJsonFile<TestData>('/path/to/corrupt.json');

    expect(result).toBeNull();
    // eslint-disable-next-line no-console
    expect(console.warn).toHaveBeenCalledWith(
      'Failed to read JSON file: /path/to/corrupt.json',
      expect.any(Error),
    );
  });
});
