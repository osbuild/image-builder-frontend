import TOML from '@ltd/j-toml';
import cockpit from 'cockpit';

export const getCloudConfigs = async () => {
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
