import path from 'path';

import cockpit from 'cockpit';
import { LongRunningProcess, ProcessState } from 'long-running-process';

import { BuildStatus } from '../types';

export const ComposeStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PENDING: 'pending',
  BUILDING: 'building',
  UPLOADING: 'uploading',
  REGISTERING: 'registering',
} as const;

export const composeStatus = async (composeId: string, composeDir: string) => {
  const status = await cockpit.file(path.join(composeDir, 'result')).read();

  if (status === ComposeStatus.SUCCESS) {
    return {
      status: ComposeStatus.SUCCESS,
      upload_status: {
        options: {
          artifact_path: path.join(
            '/var',
            'lib',
            'osbuild-composer',
            'artifacts',
            composeId,
          ),
        },
      },
    };
  }

  return {
    status: status as BuildStatus,
  };
};

export const updateComposeStatus = (composeDir: string) => {
  return async (process: LongRunningProcess) => {
    switch (process.state) {
      case ProcessState.INIT:
        await cockpit
          .file(path.join(composeDir, 'result'))
          .replace(ComposeStatus.PENDING);
        break;
      case ProcessState.STOPPED:
        // NOTE: this means that the systemd service stopped without
        // an error code, which means it most likely succeeded. It's
        // hard to completely guarantee this though
        await cockpit
          .file(path.join(composeDir, 'result'))
          .replace(ComposeStatus.SUCCESS);
        break;
      case ProcessState.RUNNING:
        await cockpit
          .file(path.join(composeDir, 'result'))
          .replace(ComposeStatus.BUILDING);
        break;
      case ProcessState.FAILED:
        await cockpit
          .file(path.join(composeDir, 'result'))
          .replace(ComposeStatus.FAILURE);
        break;
      default:
        throw new Error('unexpected process.state: ' + process.state);
    }
  };
};
