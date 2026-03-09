import { useUpdateBlueprintMutation } from '@/store/api/backend';

import {
  HookOptions,
  useMutationWithNotification,
} from './useMutationWithNotification';

export const useUpdateBPWithNotification = (options?: HookOptions) => {
  const { trigger: updateBlueprint, ...rest } = useMutationWithNotification(
    // @ts-expect-error TODO: this will need to be revisited
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
