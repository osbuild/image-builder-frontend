import { safeReadJsonFile } from './safeReadJsonFile';

type SubProgress = {
  message?: string | undefined;
  done: number;
  total: number;
};
type Progress = SubProgress & {
  subprogress?: SubProgress | undefined;
};
export const progressFromFile = async (
  file: string
): Promise<Progress> => {
  return await safeReadJsonFile<Progress>(file);
};
