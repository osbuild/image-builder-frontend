import cockpit from 'cockpit';

// Cap journal output so failure details stay concise in the UI.
const JOURNAL_MAX_LINES = 50;

// We use cockpit.spawn() directly rather than the cockpit/journal
// module because journalctl() returns a Cockpit Deferred whose
// .done()/.fail() callbacks don't reliably resolve when the
// underlying spawn rejects.
export const readJournalLogs = async (
  composeId: string,
): Promise<string | undefined> => {
  try {
    const output = await cockpit.spawn(
      [
        'journalctl',
        '-q',
        `--lines=${JOURNAL_MAX_LINES}`,
        '--output=cat',
        '--',
        `_SYSTEMD_UNIT=cockpit-image-builder-${composeId}.service`,
      ],
      { superuser: 'try' },
    );

    const text = (output as string).trim();
    if (text.length === 0) {
      return undefined;
    }

    return text;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Failed to read journal logs for ${composeId}:`, e);
    return undefined;
  }
};
