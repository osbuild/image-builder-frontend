import { useMutationWithNotification } from './useMutationWithNotification';

import { useComposeBlueprintMutation } from '../../store/backendApi';

export const useComposeBPWithNotification = () => {
  const { trigger: composeBlueprint, ...rest } = useMutationWithNotification(
    useComposeBlueprintMutation,
    {
      messages: {
        success: () => 'Image is being built',
        error: () => 'Image could not be built',
      },
    }
  );

  return {
    trigger: composeBlueprint,
    ...rest,
  };
};
