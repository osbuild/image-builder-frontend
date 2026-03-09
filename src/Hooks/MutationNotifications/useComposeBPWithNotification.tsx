import { useComposeBlueprintMutation } from '@/store/api/backend';

import { useMutationWithNotification } from './useMutationWithNotification';

export const useComposeBPWithNotification = () => {
  const { trigger: composeBlueprint, ...rest } = useMutationWithNotification(
    useComposeBlueprintMutation,
    {
      messages: {
        success: () => 'Image is being built',
        error: () => 'Image could not be built',
      },
    },
  );

  return {
    trigger: composeBlueprint,
    ...rest,
  };
};
