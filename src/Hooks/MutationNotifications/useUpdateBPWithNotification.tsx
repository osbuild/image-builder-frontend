import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

import { useUpdateBlueprintMutation } from '../../store/backendApi';

export const useUpdateBPWithNotification = (options?: HookOptions) => {
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
