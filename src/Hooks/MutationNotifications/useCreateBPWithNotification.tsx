import { usePlatform } from '@/context/platform';

import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

export const useCreateBPWithNotification = (options?: HookOptions) => {
  const {
    mutations: { useCreateBlueprintMutation },
  } = usePlatform();
  const { trigger: createBlueprint, ...rest } = useMutationWithNotification(
    useCreateBlueprintMutation,
    {
      options,
      messages: {
        success: () => 'Blueprint was created',
        error: () => 'Blueprint could not be created',
      },
    },
  );

  return {
    trigger: createBlueprint,
    ...rest,
  };
};
