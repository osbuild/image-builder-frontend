import cockpit from 'cockpit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UploadResult, uploadStatusFromFile } from '../uploadStatusFromFile';

vi.mock('cockpit', () => ({
  default: {
    file: vi.fn(),
  },
}));


describe('uploadStatusFromFile', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns success status on success result', async () => {
    const mockData: UploadResult = { provider: "LocalPath", image_id: "/path/to/disk.qcow2" };
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
    } as never);
    const status = await uploadStatusFromFile('/path/to/uploadresult');
    expect(status).toEqual({
      status: "success",
      type: "local",
      options: {
        artifact_path: "/path/to/disk.qcow2",
      },
    });
    expect(cockpit.file).toHaveBeenCalledWith('/path/to/uploadresult', { superuser: "try" });
  });

  it('returns failure status on failed result', async () => {
    const mockData: UploadResult = { provider: "unknown", image_id: "unknown" };
    vi.mocked(cockpit.file).mockReturnValue({
      read: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
    } as never);
    const status = await uploadStatusFromFile('/path/to/uploadresult');
    expect(status).toEqual({
      status: "failure",
      type: "local",
      options: {},
    });
    expect(cockpit.file).toHaveBeenCalledWith('/path/to/uploadresult', { superuser: "try" });
  });
});
