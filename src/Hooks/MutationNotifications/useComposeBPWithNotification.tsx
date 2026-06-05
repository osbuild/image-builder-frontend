import { usePlatform } from '@/context/platform';

import { useMutationWithNotification } from './useMutationWithNotification';

export const useComposeBPWithNotification = () => {
  const {
    mutations: { useComposeBlueprintMutation },
  } = usePlatform();
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
