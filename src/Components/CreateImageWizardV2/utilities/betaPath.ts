export const betaPath = (path: string, beta: boolean) => {
  return beta ? `/preview${path}` : path;
};
