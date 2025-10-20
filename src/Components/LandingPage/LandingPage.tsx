import React, { useState } from 'react';

import {
  PageSection,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Title,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import { Outlet } from 'react-router-dom';

import './LandingPage.scss';

import { NewAlert } from './NewAlert';
import ServiceUnavailableAlert from './ServiceUnavailableAlert';

import BlueprintsSidebar from '../Blueprints/BlueprintsSideBar';
import ImagesTable from '../ImagesTable/ImagesTable';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const LandingPage = () => {
  const [showAlert, setShowAlert] = useState(true);
  const serviceUnavailable = useFlag('image-builder.service-unavailable');

  const imageList = (
    <>
      <PageSection hasBodyWrapper={false}>
        {serviceUnavailable && <ServiceUnavailableAlert />}
        {showAlert && <NewAlert setShowAlert={setShowAlert} />}
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
      <Outlet />
    </>
  );
};

export default LandingPage;
