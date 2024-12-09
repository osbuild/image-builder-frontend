/* eslint-disable @typescript-eslint/no-unused-vars */
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
