import React, { useEffect } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import '@patternfly/patternfly/patternfly-addons.css';

import { Router } from './Router';
import { useAppDispatch } from './store/hooks';
import { changeOrgId } from './store/slices/wizard';

const AppContent = () => {
  const { auth, hideGlobalFilter, updateDocumentTitle } = useChrome();
  const dispatch = useAppDispatch();
  const addNotification = useAddNotification();
  const getUser = auth.getUser;

  useEffect(() => {
    updateDocumentTitle('Images');
    hideGlobalFilter(true);
  }, [hideGlobalFilter, updateDocumentTitle]);

  useEffect(() => {
    // the org id never changes, let's just get
    // this on app init rather than every time
    // the user creates a blueprint
    const resolveOrgId = async () => {
      const userData = await getUser();
      const orgId = userData?.identity.internal?.org_id;
      if (orgId) {
        dispatch(changeOrgId(orgId));
        return;
      }
      throw new Error('Unable to determine organization ID');
    };

    resolveOrgId().catch(() => {
      addNotification({
        variant: 'danger',
        title:
          'Unable to determine your organization ID. Some features may not work correctly.',
      });
    });
  }, [getUser, dispatch, addNotification]);

  return <Router />;
};

const App = () => {
  return (
    <React.Fragment>
      <NotificationsProvider>
        <AppContent />
      </NotificationsProvider>
    </React.Fragment>
  );
};

export default App;
