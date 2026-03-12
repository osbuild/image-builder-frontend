import cockpit from 'cockpit';
import TOML from 'smol-toml';

export const getCloudConfigs = async (): Promise<string[]> => {
  try {
    const worker_config = cockpit.file(
      '/etc/osbuild-worker/osbuild-worker.toml',
    );
    const contents = await worker_config.read();
    const parsed = TOML.parse(contents);
    return Object.keys(parsed).filter((k) => k === 'aws');
  } catch {
    return [];
  }
};
