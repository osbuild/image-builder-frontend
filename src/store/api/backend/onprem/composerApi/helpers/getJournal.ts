import cockpit from 'cockpit';

export const getJournal = async (composeId: string): Promise<string | null> => {
  try {
    return (await cockpit.spawn([
      'journalctl',
      '-o',
      'cat',
      '-u',
      `cockpit-image-builder-${composeId}.service`,
    ])) as string;
  } catch {
    return null;
  }
};
