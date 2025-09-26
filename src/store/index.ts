import { combineReducers, configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import { backendApi } from './backendApi';
import { blueprintsSlice } from './BlueprintSlice';
import { complianceApi } from './complianceApi';
import { contentSourcesApi } from './contentSourcesApi';
import { ArchitectureItem } from './imageBuilderApi';
import { listenerMiddleware, startAppListening } from './listenerMiddleware';
import { provisioningApi } from './provisioningApi';
import { rhsmApi } from './rhsmApi';
import wizardSlice, {
  changeArchitecture,
  changeDistribution,
  changeImageTypes,
  selectArchitecture,
  selectDistribution,
  selectImageTypes,
} from './wizardSlice';

export const reducer = combineReducers({
  [contentSourcesApi.reducerPath]: contentSourcesApi.reducer,
  [backendApi.reducerPath]: backendApi.reducer,
  [rhsmApi.reducerPath]: rhsmApi.reducer,
  [provisioningApi.reducerPath]: provisioningApi.reducer,
  [complianceApi.reducerPath]: complianceApi.reducer,
  wizard: wizardSlice,
  blueprints: blueprintsSlice.reducer,
});

startAppListening({
  actionCreator: changeArchitecture,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();

    const distribution = selectDistribution(state);
    const imageTypes = selectImageTypes(state);
    const architecture = action.payload;

    // The response from the RTKQ getArchitectures hook
    const architecturesResponse = backendApi.endpoints.getArchitectures.select({
      distribution: distribution,
    });

    // @ts-ignore not sure why this is causing an error now
    const allowedImageTypes = architecturesResponse.data?.find(
      (elem: ArchitectureItem) => elem.arch === architecture,
    )?.image_types;

    const filteredImageTypes = imageTypes.filter((imageType: string) =>
      allowedImageTypes?.includes(imageType),
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
    const architecturesResponse = backendApi.endpoints.getArchitectures.select({
      distribution: distribution,
    });

    // @ts-ignore not sure why this is causing an error now
    const allowedImageTypes = architecturesResponse?.data?.find(
      (elem: ArchitectureItem) => elem.arch === architecture,
    )?.image_types;

    const filteredImageTypes = imageTypes.filter((imageType: string) =>
      allowedImageTypes?.includes(imageType),
    );

    listenerApi.dispatch(changeImageTypes(filteredImageTypes));
  },
});

// Listener middleware must be prepended according to RTK docs:
// https://redux-toolkit.js.org/api/createListenerMiddleware#basic-usage
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const middleware = (getDefaultMiddleware: Function) =>
  getDefaultMiddleware()
    .prepend(listenerMiddleware.middleware)
    .concat(
      promiseMiddleware,
      contentSourcesApi.middleware,
      backendApi.middleware,
      rhsmApi.middleware,
      provisioningApi.middleware,
      complianceApi.middleware,
    );

export const store = configureStore({
  reducer,
  middleware,
});

// we don't need to export these for now, they are just helpers
// for some of the functions in this file
type serviceState = ReturnType<typeof store.getState>;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = serviceState;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
