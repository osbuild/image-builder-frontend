import { useMutationWithNotification } from './useMutationWithNotification';

import {
  CloneComposeApiArg,
  useCloneComposeMutation,
} from '../../store/service/imageBuilderApi';

export const useCloneComposeWithNotification = () => {
  const { trigger: cloneCompose, ...rest } = useMutationWithNotification(
    useCloneComposeMutation,
    {
      messages: {
        success: ({ cloneRequest }: CloneComposeApiArg) =>
          `Your image is being shared to ${cloneRequest.region} region`,
        error: () => 'Your image could not be shared',
      },
    }
  );

  return {
    trigger: cloneCompose,
    ...rest,
  };
};
