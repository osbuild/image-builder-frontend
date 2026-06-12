import cockpit from 'cockpit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { imageStatusFromBuildlog, OSBuildResult } from '../imageStatusFromBuildlog';

vi.mock('cockpit', () => ({
  default: {
    file: vi.fn(),
  },
}));

describe('imageStatusFromBuildlog', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns success status on success result', async () => {
    const mockData: OSBuildResult = { success: true };
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
    } as never);
    const status = await imageStatusFromBuildlog('/path/to/buildlog');
    expect(status).toEqual({
      status: "success",
    });
    expect(cockpit.file).toHaveBeenCalledWith('/path/to/buildlog', { superuser: "try" });
  });

  it('returns failure status on failed result', async () => {
    const mockData: OSBuildResult = { success: false, error: { some: "error" } };
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
    } as never);
    const status = await imageStatusFromBuildlog('/path/to/buildlog');
    expect(status).toEqual({
      status: "failure",
      error: {
        id: 10,
        reason: "osbuild failed",
        details: "{\"some\":\"error\"}",
      },
    });
    expect(cockpit.file).toHaveBeenCalledWith('/path/to/buildlog', { superuser: "try" });
  });

  it('returns failure status on emptyresult', async () => {
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockResolvedValue(""),
    } as never);
    const status = await imageStatusFromBuildlog('/path/to/buildlog');
    expect(status).toEqual({
      status: "failure",
      error: {
        reason: "image-builder process is not running and no result was found",
      },
    });
    expect(cockpit.file).toHaveBeenCalledWith('/path/to/buildlog', { superuser: "try" });
  });
});
