import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

const manageEdgeImagesUrlName = 'manage-edge-images';

const getNotificationProp = (dispatch) => {
  return {
    hasInfo: (hasInfoMessage) => {
      dispatch({
        ...addNotification({
          variant: 'info',
          ...hasInfoMessage,
        }),
      });
    },
    hasSuccess: (hasSuccessMessage) => {
      dispatch({
        ...addNotification({
          variant: 'success',
          ...hasSuccessMessage,
        }),
      });
    },
    err: (errMessage, err) => {
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
