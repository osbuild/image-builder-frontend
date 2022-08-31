import {
  composeAdded,
  composesUpdatedCount,
  composeUpdatedStatus,
} from '../composesSlice';
import api from '../../api';

export const fetchComposeStatus = (id) => async (dispatch) => {
  const request = await api.getComposeStatus(id);
  dispatch(
    composeUpdatedStatus({
      id,
      status: request.image_status,
    })
  );
};

export const fetchComposes = (limit, offset) => async (dispatch) => {
  const request = await api.getComposes(limit, offset);
  request.data.map((compose) => {
    dispatch(composeAdded({ compose, insert: false }));
    dispatch(fetchComposeStatus(compose.id));
  });
  dispatch(composesUpdatedCount({ count: request.meta.count }));
};

export default { fetchComposes, fetchComposeStatus };
