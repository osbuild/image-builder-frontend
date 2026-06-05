import { usePlatform } from '@/context/platform';

import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

export const useUpdateBPWithNotification = (options?: HookOptions) => {
  const {
    mutations: { useUpdateBlueprintMutation },
  } = usePlatform();
  const { trigger: updateBlueprint, ...rest } = useMutationWithNotification(
    useUpdateBlueprintMutation,
    {
      options,
      messages: {
        success: () => 'Blueprint was updated',
        error: () => 'Blueprint could not be updated',
      },
    },
  );
  return {
    trigger: updateBlueprint,
    ...rest,
  };
};
