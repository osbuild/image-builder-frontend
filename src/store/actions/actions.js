import api from '../../api';
import types from '../types';

function composeUpdated(compose) {
  return {
    type: types.COMPOSE_UPDATED,
    payload: { compose },
  };
}

export const composeFailed = (error) => ({
  type: types.COMPOSE_FAILED,
  payload: { error },
});

export const composeAdded = (compose, insert) => ({
  type: types.COMPOSE_ADDED,
  payload: { compose, insert },
});

export const composeStart = (composeRequest) => async (dispatch) => {
  // response will be of the format {id: ''}
  const request = api.composeImage(composeRequest);
  return request
    .then((response) => {
      // add the compose id to the compose object to provide access to the id if iterating through
      // composes and add an image status of 'pending' alongside the compose request.
      const compose = Object.assign(
        {},
        response,
        { request: composeRequest },
        { image_status: { status: 'pending' } }
      );
      dispatch(composeAdded(compose, true));
    })
    .catch((err) => {
      if (err.response.status === 500) {
        dispatch(composeFailed('Error: Something went wrong serverside'));
      } else {
        dispatch(composeFailed('Error: Something went wrong with the compose'));
      }
    });
};

export const composeUpdatedStatus = (id, status) => ({
  type: types.COMPOSE_UPDATED_STATUS,
  payload: { id, status },
});

export const composeGetStatus = (id) => async (dispatch) => {
  const request = await api.getComposeStatus(id);
  dispatch(composeUpdatedStatus(id, request.image_status));
};

export const composesUpdatedCount = (count) => ({
  type: types.COMPOSES_UPDATED_COUNT,
  payload: { count },
});

export const composesGet = (limit, offset) => async (dispatch) => {
  const request = await api.getComposes(limit, offset);
  request.data.map((compose) => {
    dispatch(composeAdded(compose, false));
    dispatch(composeGetStatus(compose.id));
  });
  dispatch(composesUpdatedCount(request.meta.count));
};

function setRelease({ arch, distro }) {
  return {
    type: types.SET_RELEASE,
    payload: {
      arch,
      distro,
    },
  };
}

function setUploadDestinations({ aws, azure, google }) {
  return {
    type: types.SET_UPLOAD_DESTINATIONS,
    payload: {
      aws,
      azure,
      google,
    },
  };
}

function setUploadAWS({ shareWithAccounts }) {
  return {
    type: types.SET_UPLOAD_AWS,
    payload: {
      shareWithAccounts,
    },
  };
}

function setUploadAzure({ tenantId, subscriptionId, resourceGroup }) {
  return {
    type: types.SET_UPLOAD_AZURE,
    payload: {
      tenantId,
      subscriptionId,
      resourceGroup,
    },
  };
}

function setUploadGoogle({ accountType, shareWithAccounts }) {
  return {
    type: types.SET_UPLOAD_GOOGLE,
    payload: {
      accountType,
      shareWithAccounts,
    },
  };
}

function setSelectedPackages(selectedPackages) {
  return {
    type: types.SET_SELECTED_PACKAGES,
    payload: selectedPackages,
  };
}

function setSubscription({ activationKey, insights, organization }) {
  return {
    type: types.SET_SUBSCRIPTION,
    payload: {
      activationKey,
      insights,
      organization,
    },
  };
}

function setSubscribeNow(subscribeNow) {
  return {
    type: types.SET_SUBSCRIBE_NOW,
    payload: subscribeNow,
  };
}

export default {
  composesGet,
  composeStart,
  composeUpdated,
  composeGetStatus,
  setRelease,
  setUploadDestinations,
  setUploadAWS,
  setUploadAzure,
  setUploadGoogle,
  setSelectedPackages,
  setSubscription,
  setSubscribeNow,
};
