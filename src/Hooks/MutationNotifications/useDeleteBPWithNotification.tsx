import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

import { useDeleteBlueprintMutation } from '../../store/backendApi';

export const useDeleteBPWithNotification = (options?: HookOptions) => {
  const { trigger: deleteBlueprint, ...rest } = useMutationWithNotification(
    useDeleteBlueprintMutation,
    {
      options,
      messages: {
        success: () => 'Blueprint was deleted',
        error: () => 'Blueprint could not be deleted',
      },
    }
  );

  return {
    trigger: deleteBlueprint,
    ...rest,
  };
};
