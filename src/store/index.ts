import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import { contentSourcesApi } from './contentSourcesApi';
import { edgeApi } from './edgeApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import { listenerMiddleware, startAppListening } from './listenerMiddleware';
import { provisioningApi } from './provisioningApi';
import { rhsmApi } from './rhsmApi';
import wizardSlice, {
  changeArchitecture,
  changeAwsAccount,
  changeAwsSource,
  changeDistribution,
  changeImageTypes,
  resetAwsAccount,
  resetAwsSource,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from './wizardSlice';

export const reducer = {
  [contentSourcesApi.reducerPath]: contentSourcesApi.reducer,
  [edgeApi.reducerPath]: edgeApi.reducer,
  [imageBuilderApi.reducerPath]: imageBuilderApi.reducer,
  [rhsmApi.reducerPath]: rhsmApi.reducer,
  [provisioningApi.reducerPath]: provisioningApi.reducer,
  notifications: notificationsReducer,
  wizard: wizardSlice,
};

startAppListening({
  actionCreator: changeArchitecture,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();

    const distribution = selectDistribution(state);
    const imageTypes = selectImageTypes(state);
    const architecture = action.payload;

    // The response from the RTKQ getArchitectures hook
    const architecturesResponse =
      imageBuilderApi.endpoints.getArchitectures.select({
        distribution: distribution,
      })(state);

    const allowedImageTypes = architecturesResponse?.data?.find(
      (elem) => elem.arch === architecture
    )?.image_types;

    const filteredImageTypes = imageTypes.filter((imageType) =>
      allowedImageTypes?.includes(imageType)
    );

    listenerApi.dispatch(changeImageTypes(filteredImageTypes));
  },
});

startAppListening({
  actionCreator: changeDistribution,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();

    const distribution = action.payload;
    const imageTypes = selectImageTypes(state);
    const architecture = selectArchitecture(state);

    // The response from the RTKQ getArchitectures hook
    const architecturesResponse =
      imageBuilderApi.endpoints.getArchitectures.select({
        distribution: distribution,
      })(state);

    const allowedImageTypes = architecturesResponse?.data?.find(
      (elem) => elem.arch === architecture
    )?.image_types;

    const filteredImageTypes = imageTypes.filter((imageType) =>
      allowedImageTypes?.includes(imageType)
    );

    listenerApi.dispatch(changeImageTypes(filteredImageTypes));
  },
});

// We do not allow both an AWS source id and account id
// Setting an AWS account id removes the AWS source id if present
startAppListening({
  actionCreator: changeAwsAccount,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();
    if (state.wizard.aws.shareWithSources[0]) {
      listenerApi.dispatch(resetAwsSource());
    }
  },
});

// We do not allow both an AWS source id and account id
// Setting an AWS source id removes the AWS account id if present
startAppListening({
  actionCreator: changeAwsSource,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();
    if (state.wizard.aws.shareWithAccounts[0]) {
      listenerApi.dispatch(resetAwsAccount());
    }
  },
});

// Listener middleware must be prepended according to RTK docs:
// https://redux-toolkit.js.org/api/createListenerMiddleware#basic-usage
export const middleware = (getDefaultMiddleware: Function) =>
  getDefaultMiddleware()
    .prepend(listenerMiddleware.middleware)
    .concat(
      promiseMiddleware,
      contentSourcesApi.middleware,
      imageBuilderApi.middleware,
      rhsmApi.middleware,
      provisioningApi.middleware
    );

export const store = configureStore({ reducer, middleware });

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
