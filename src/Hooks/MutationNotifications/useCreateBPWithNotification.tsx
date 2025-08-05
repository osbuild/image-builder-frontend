import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

import { useCreateBlueprintMutation } from '../../store/backendApi';

export const useCreateBPWithNotification = (options?: HookOptions) => {
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
