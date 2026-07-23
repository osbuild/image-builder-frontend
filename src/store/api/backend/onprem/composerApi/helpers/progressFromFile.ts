import { safeReadJsonFile } from './safeReadJsonFile';

type SubProgress = {
  message?: string;
  done: number;
  total: number;
};

export type Progress = SubProgress & {
  subprogress?: SubProgress;
};

export const progressFromFile = async (
  file: string
): Promise<Progress | undefined> => {
  const progress = await safeReadJsonFile<Progress>(file);
  if (progress === null) {
    return undefined;
  }
  return progress;
};
