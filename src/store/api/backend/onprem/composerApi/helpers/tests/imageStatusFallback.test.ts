import { fsinfo } from 'cockpit/fsinfo';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { imageStatusFallback } from '../imageStatusFallback';

vi.mock('cockpit/fsinfo', () => ({
  fsinfo: vi.fn(),
}));

describe('imageStatusFallback', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns success if artifact was found', async () => {
    vi.mocked(fsinfo).mockResolvedValue({
      entries: {
        'disk.qcow2': {},
      },
    } as never);

    const status = await imageStatusFallback('compose-id');
    expect(status).toEqual({
      status: "success",
      upload_status: {
        status: "success",
        type: "local",
        options: {
          artifact_path: "/var/lib/osbuild-composer/artifacts/compose-id/disk.qcow2",
        },
      },
    });

    expect(fsinfo).toHaveBeenCalledWith(
      '/var/lib/osbuild-composer/artifacts/compose-id',
      ["entries"],
      { superuser: "try" }
    );
  });

  it('returns failure status missing artifact', async () => {
    vi.mocked(fsinfo).mockResolvedValue({
      entries: {},
    } as never);

    const status = await imageStatusFallback('compose-id');
    expect(status).toEqual({
      status: "failure",
      error: {
        reason: "missing artifact in fallback directory",
      },
    });

    expect(fsinfo).toHaveBeenCalledWith(
      '/var/lib/osbuild-composer/artifacts/compose-id',
      ["entries"],
      { superuser: "try" }
    );
  });

  it('returns failure status on emptyresult', async () => {
    vi.mocked(fsinfo).mockRejectedValue(new Error('') as never);

    const status = await imageStatusFallback('compose-id');
    expect(status).toEqual({
      status: "failure",
      error: {
        reason: "missing artifact directory",
      },
    });

    expect(fsinfo).toHaveBeenCalledWith(
      '/var/lib/osbuild-composer/artifacts/compose-id',
      ["entries"],
      { superuser: "try" }
    );
  });
});
