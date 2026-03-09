import { useFixupBlueprintMutation } from '@/store/api/backend';

import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

export const useFixupBPWithNotification = (options?: HookOptions) => {
  const { trigger: fixupBlueprint, ...rest } = useMutationWithNotification(
    useFixupBlueprintMutation,
    {
      options,
      messages: {
        success: () => 'Blueprint was fixed',
        error: () => 'Blueprint could not be fixed',
      },
    },
  );

  return {
    trigger: fixupBlueprint,
    ...rest,
  };
};
