import path from 'path';

import cockpit from 'cockpit';

import { BLUEPRINTS_DIR } from '@/constants';

// Gets the user's $XDG_STATE_HOME directory to save blueprints in. Uses $HOME/.local/state as a fallback.
export const getBlueprintsPath = async (): Promise<string> => {
  let stateDir = (await cockpit.script('echo -n $XDG_STATE_HOME')) as string;
  const user = await cockpit.user();
  if (stateDir === '') {
    stateDir = `${user.home}/.local/state`;
  }
  const blueprintsDir = path.join(stateDir, BLUEPRINTS_DIR);

  // make sure the directory exists
  await cockpit.spawn(['mkdir', '-p', blueprintsDir], {});
  return blueprintsDir;
};
