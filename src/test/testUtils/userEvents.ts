import { waitFor } from '@testing-library/react';

import { UserEventInstance } from './createUser';

export const waitForAction = async (callback: () => Promise<void> | void) => {
  // NOTE: some user event actions trigger multiple api calls and, as a result,
  // act warnings about state changes, so wrap we can create a wrapper
  // function that uses `waitFor` to wait for the calls to settle. This
  // The reason for the wrapper function was to consolidate all the calls
  // in one place and have one single comment for all the calls.
  await waitFor(() => callback());
};

export const clickWithWait = async (
  user: UserEventInstance,
  element: HTMLElement,
) => {
  await waitForAction(() => user.click(element));
};

export const clearWithWait = async (
  user: UserEventInstance,
  element: HTMLElement,
) => {
  await waitForAction(() => user.clear(element));
};

export const typeWithWait = async (
  user: UserEventInstance,
  element: HTMLElement,
  text: string,
) => {
  await waitForAction(() => user.type(element, text));
};
