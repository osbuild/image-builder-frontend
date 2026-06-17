import React, { useEffect } from 'react';

import {
  PageSection,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Title,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import {
  Outlet,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import './LandingPage.scss';

import ServiceUnavailableAlert from './ServiceUnavailableAlert';

import { useAppDispatch } from '../../store/hooks';
import { setBlueprintId } from '../../store/slices/blueprint';
import { openWizardModal } from '../../store/slices/wizardModal';
import { useFlag } from '../../Utilities/useGetEnvironment';
import BlueprintsSidebar from '../Blueprints/BlueprintsSideBar';
import CreateImageWizard from '../CreateImageWizard/CreateImageWizard';
import ImagesTable from '../ImagesTable';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const LandingPage = () => {
  // New feature alert
  // const [showAlert, setShowAlert] = useState(true);
  // const isOnPremise = useAppSelector(selectIsOnPremise);

  const dispatch = useAppDispatch();
  const location = useLocation();
  const { composeId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceUnavailable = useFlag('image-builder.service-unavailable');

  // Open wizard modal when on /imagewizard path
  useEffect(() => {
    if (location.pathname.includes('/imagewizard')) {
      const blueprintId = composeId || searchParams.get('blueprint_id');

      if (blueprintId) {
        dispatch(setBlueprintId(blueprintId));
        dispatch(openWizardModal('edit'));
      } else {
        dispatch(openWizardModal('create'));
      }
    }
  }, [dispatch, location.pathname, composeId, searchParams]);

  const imageList = (
    <>
      <PageSection hasBodyWrapper={false}>
        {serviceUnavailable && <ServiceUnavailableAlert />}
        {/* New feature alert */}
        {/*!isOnPremise && showAlert && <NewAlert setShowAlert={setShowAlert} />*/}
        <Sidebar hasBorder className='pf-v6-u-background-color-100'>
          <SidebarPanel
            variant='sticky'
            width={{ default: 'width_25' }}
            className='sidebar-panel'
          >
            <Toolbar>
              <ToolbarContent>
                <Title headingLevel='h2'>{'Blueprints'}</Title>
              </ToolbarContent>
            </Toolbar>
            <SidebarContent hasPadding>
              <BlueprintsSidebar />
            </SidebarContent>
          </SidebarPanel>
          <SidebarContent>
            <ImagesTable />
          </SidebarContent>
        </Sidebar>
      </PageSection>
    </>
  );

  return (
    <>
      <ImageBuilderHeader />
      {imageList}
      <CreateImageWizard />
      <Outlet />
    </>
  );
};

export default LandingPage;
