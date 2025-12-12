import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import {
  BaseQueryFn,
  TypedMutationTrigger,
} from '@reduxjs/toolkit/dist/query/react';

import { errorMessage } from '../../store/service/enhancedImageBuilderApi';
import { useIsOnPremise } from '../Utilities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getErrorDescription = (err: any, isOnPremise: boolean) => {
  if (isOnPremise) {
    // If details are present, assume it's coming from composer
    if (err.body) {
      return `${err.message}: ${err.body.details}`;
    }

    return JSON.stringify(err);
  }

  if (err.status) {
    return `Status code ${err.status}: ${errorMessage(err)}`;
  }

  return JSON.stringify(err);
};

type NotificationMessages<TArgs> = {
  success: (args: TArgs) => string;
  error?: (args: TArgs, error: unknown) => string;
};

export type HookOptions = {
  fixedCacheKey?: string | string;
};

type MutationOptions<Arg> = {
  options?: HookOptions | undefined;
  messages: NotificationMessages<Arg>;
};

// cursor ide was used to make this hook more generic
// and re-usable. Specifically for extending the complicated
// types to pass in other mutation hooks with using `any`
export function useMutationWithNotification<
  Arg,
  Result,
  State extends {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error?: unknown;
    reset: () => void;
  },
>(
  mutationHook: (
    options?: HookOptions,
  ) => readonly [TypedMutationTrigger<Result, Arg, BaseQueryFn>, State],
  { options, messages }: MutationOptions<Arg>,
) {
  const [trigger, state] = mutationHook(options);
  const addNotification = useAddNotification();
  const isOnPremise = useIsOnPremise();

  const handler = async (args: Arg): Promise<Result> => {
    try {
      const result = await trigger(args).unwrap();
      addNotification({
        variant: 'success',
        title: messages.success(args),
      });
      return result;
    } catch (err) {
      const description = getErrorDescription(err, isOnPremise);
      if (messages.error) {
        addNotification({
          variant: 'danger',
          title: messages.error(args, err),
          description,
        });
      }
      throw err;
    }
  };

  return {
    trigger: handler,
    ...state,
  };
}
