import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const manageEdgeImagesUrlName = 'manage-edge-images';

const useGetNotificationProp = () => {
  const addNotification = useAddNotification();
  return {
    hasInfo: (hasInfoMessage: Notification) => {
      addNotification({
        variant: 'info',
        ...hasInfoMessage,
      });
    },
    hasSuccess: (hasSuccessMessage: Notification) => {
      addNotification({
        variant: 'success',
        ...hasSuccessMessage,
      });
    },
    /* eslint-disable @typescript-eslint/no-explicit-any */
    err: (errMessage: any, err: any) => {
      addNotification({
        variant: 'danger',
        ...errMessage,
        // Add error message from API, if present
        description: err?.Title
          ? `${errMessage.description}: ${err.Title}`
          : errMessage.description,
      });
    },
  };
};

export { useGetNotificationProp, manageEdgeImagesUrlName };
