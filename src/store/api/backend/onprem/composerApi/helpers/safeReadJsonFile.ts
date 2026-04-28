import cockpit from 'cockpit';

export const safeReadJsonFile = async <T>(
  filePath: string,
): Promise<T | null> => {
  try {
    const content = await cockpit.file(filePath).read();
    return JSON.parse(content) as T;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to read JSON file: ${filePath}`, error);
    return null;
  }
};
