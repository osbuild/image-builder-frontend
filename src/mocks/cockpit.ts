/* eslint-disable @typescript-eslint/no-unused-vars */

// TODO: maybe we should pull in the cockpit types here
// and keep them in the project. Not ideal because it may
// diverge, so we need to think about it.
export interface UserInfo {
  home: string;
}

export default {
  user: (): Promise<UserInfo> => {
    return new Promise((resolve) => {
      resolve({
        home: '',
      });
    });
  },
  file: (path: string) => {
    return {
      read: (): Promise<string> => {
        return new Promise((resolve) => {
          resolve('');
        });
      },
      close: () => {},
    };
  },
};

export interface FileInfo {
  entries?: Record<string, FileInfo>;
}

export const fsinfo = (
  path: string,
  attributes: (keyof FileInfo)[],
  options: object
): Promise<FileInfo> => {
  return new Promise((resolve) => {
    resolve({
      entries: {},
    });
  });
};
