import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { Dispatch } from 'redux';

const manageEdgeImagesUrlName = 'manage-edge-images';

const getNotificationProp = (dispatch: Dispatch) => {
  return {
    hasInfo: (hasInfoMessage: Notification) => {
      dispatch({
        ...addNotification({
          variant: 'info',
          ...hasInfoMessage,
        }),
      });
    },
    hasSuccess: (hasSuccessMessage: Notification) => {
      dispatch({
        ...addNotification({
          variant: 'success',
          ...hasSuccessMessage,
        }),
      });
    },
    /* eslint-disable @typescript-eslint/no-explicit-any */
    err: (errMessage: any, err: any) => {
      dispatch({
        ...addNotification({
          variant: 'danger',
          ...errMessage,
          // Add error message from API, if present
          description: err?.Title
            ? `${errMessage.description}: ${err.Title}`
            : errMessage.description,
        }),
      });
    },
  };
};

export { getNotificationProp, manageEdgeImagesUrlName };
