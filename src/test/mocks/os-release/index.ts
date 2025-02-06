type osRelease = {
  ID: string;
  VERSION_ID: string;
};

export const read_os_release = (): Promise<osRelease> => {
  return new Promise((resolve) => {
    resolve({
      ID: 'rhel',
      VERSION_ID: '9',
    });
  });
};
