import React from 'react';

import {
  PageSection,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Title,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import { Outlet } from 'react-router-dom';

import './LandingPage.scss';

import ServiceUnavailableAlert from './ServiceUnavailableAlert';

import { useFlag } from '../../Utilities/useGetEnvironment';
import BlueprintsSidebar from '../Blueprints/BlueprintsSideBar';
import CreateImageWizard3 from '../CreateImageWizard3/CreateImageWizard3';
import ImagesTable from '../ImagesTable/ImagesTable';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const LandingPage = () => {
  // New feature alert
  // const [showAlert, setShowAlert] = useState(true);
  // const isOnPremise = useAppSelector(selectIsOnPremise);

  const serviceUnavailable = useFlag('image-builder.service-unavailable');
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

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
      {isWizardRevampEnabled && <CreateImageWizard3 />}
      <Outlet />
    </>
  );
};

export default LandingPage;
