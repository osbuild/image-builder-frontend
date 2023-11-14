import api from '../../api';
import { cloneAdded, cloneUpdatedStatus } from '../clonesSlice';
import {
  composeAdded,
  composesUpdatedCount,
  composeUpdatedStatus,
} from '../composesSlice';

export const fetchComposeStatus = (id) => async (dispatch) => {
  const request = await api.getComposeStatus(id);
  if (!request) return;
  dispatch(
    composeUpdatedStatus({
      id,
      status: request.image_status,
    })
  );
};

export const fetchComposes = (limit, offset) => async (dispatch) => {
  const composeRequest = await api.getComposes(limit, offset);
  if (!composeRequest) return;

  composeRequest.data.forEach((compose) => {
    dispatch(composeAdded({ compose, insert: false }));
    dispatch(fetchComposeStatus(compose.id));
  });

  dispatch(composesUpdatedCount({ count: composeRequest.meta.count }));

  composeRequest.data.forEach((compose) => {
    dispatch(fetchClones(compose.id, 100, 0));
  });
};

export const fetchCloneStatus = (id) => async (dispatch) => {
  const request = await api.getCloneStatus(id);
  if (!request) return;
  dispatch(
    cloneUpdatedStatus({
      id,
      status: request,
    })
  );
};

export const fetchClones = (id, limit, offset) => async (dispatch) => {
  const request = await api.getClones(id, limit, offset);
  if (!request) return;
  request.data?.forEach((clone) => {
    dispatch(cloneAdded({ clone, parent: id }));
    dispatch(fetchCloneStatus(clone.id));
  });
};

const actions = {
  fetchClones,
  fetchCloneStatus,
  fetchComposes,
  fetchComposeStatus,
};

export default actions;
