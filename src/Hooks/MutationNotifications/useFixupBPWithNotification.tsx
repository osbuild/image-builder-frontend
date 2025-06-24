import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

import { useFixupBlueprintMutation } from '../../store/imageBuilderApi';

export const useFixupBPWithNotification = (options?: HookOptions) => {
  const { trigger: fixupBlueprint, ...rest } = useMutationWithNotification(
    useFixupBlueprintMutation,
    {
      options,
      messages: {
        success: () => 'Blueprint was fixed',
        error: () => 'Blueprint could not be fixed',
      },
    }
  );

  return {
    trigger: fixupBlueprint,
    ...rest,
  };
};
