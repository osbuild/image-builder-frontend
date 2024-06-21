import React, { useEffect, useState } from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { PageSection } from '@patternfly/react-core/dist/dynamic/components/Page';
import { Popover } from '@patternfly/react-core/dist/dynamic/components/Popover';
import { Sidebar } from '@patternfly/react-core/dist/dynamic/components/Sidebar';
import { SidebarContent } from '@patternfly/react-core/dist/dynamic/components/Sidebar';
import { SidebarPanel } from '@patternfly/react-core/dist/dynamic/components/Sidebar';
import { Tabs } from '@patternfly/react-core/dist/dynamic/components/Tabs';
import { Tab } from '@patternfly/react-core/dist/dynamic/components/Tabs';
import { TabTitleText } from '@patternfly/react-core/dist/dynamic/components/Tabs';
import { TabAction } from '@patternfly/react-core/dist/dynamic/components/Tabs';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import { Toolbar } from '@patternfly/react-core/dist/dynamic/components/Toolbar';
import { ToolbarContent } from '@patternfly/react-core/dist/dynamic/components/Toolbar';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import HelpIcon from '@patternfly/react-icons/dist/dynamic/icons/help-icon';
import { useFlag } from '@unleash/proxy-client-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import './LandingPage.scss';

import { NewAlert } from './NewAlert';

import { MANAGING_WITH_DNF_URL, OSTREE_URL } from '../../constants';
import { manageEdgeImagesUrlName } from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';
import BlueprintsSidebar from '../Blueprints/BlueprintsSideBar';
import EdgeImagesTable from '../edge/ImagesTable';
import ImagesTable from '../ImagesTable/ImagesTable';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const LandingPage = () => {
  const [showAlert, setShowAlert] = useState(true);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tabsPath = [
    resolveRelPath(''),
    resolveRelPath(manageEdgeImagesUrlName),
  ];
  const initialActiveTabKey =
    tabsPath.indexOf(pathname) >= 0 ? tabsPath.indexOf(pathname) : 0;
  const [activeTabKey, setActiveTabKey] = useState(initialActiveTabKey);
  useEffect(() => {
    setActiveTabKey(initialActiveTabKey);
  }, [initialActiveTabKey]);
  const handleTabClick = (_event: React.MouseEvent, tabIndex: number) => {
    const tabPath = tabsPath[tabIndex];
    if (tabPath !== undefined) {
      navigate(tabPath);
    }
    setActiveTabKey(tabIndex);
  };

  const edgeParityFlag = useFlag('edgeParity.image-list');

  const imageList = (
    <>
      <PageSection isWidthLimited>
        {showAlert && <NewAlert setShowAlert={setShowAlert} />}
        <Sidebar hasBorder className="pf-v5-u-background-color-100">
          <SidebarPanel
            variant="sticky"
            width={{ default: 'width_25' }}
            className="sidebar-panel"
          >
            <Toolbar>
              <ToolbarContent>
                <Title headingLevel="h2">{'Blueprints'}</Title>
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
      <ImageBuilderHeader activeTab={activeTabKey} />
      {edgeParityFlag ? (
        <Tabs
          className="pf-c-tabs pf-c-page-header pf-c-table"
          activeKey={activeTabKey}
          onSelect={handleTabClick}
        >
          <Tab
            eventKey={0}
            title={<TabTitleText> Conventional (RPM-DNF){''} </TabTitleText>}
            actions={
              <HelpPopover
                header={'Conventional (RPM-DNF)'}
                body={
                  <div>
                    <TextContent>
                      <Text>
                        With RPM-DNF, you can manage the system software by
                        using the DNF package manager and updated RPM packages.
                        This is a simple and adaptive method of managing and
                        modifying the system over its lifecycle.
                      </Text>
                      <Text>
                        <Button
                          component="a"
                          target="_blank"
                          variant="link"
                          icon={<ExternalLinkAltIcon />}
                          iconPosition="right"
                          isInline
                          href={MANAGING_WITH_DNF_URL}
                        >
                          Learn more about managing images with DNF
                        </Button>
                      </Text>
                    </TextContent>
                  </div>
                }
              />
            }
          >
            {imageList}
          </Tab>
          <Tab
            eventKey={1}
            title={<TabTitleText>Immutable (OSTree) </TabTitleText>}
            actions={
              <HelpPopover
                header={'Immutable (OSTree)'}
                body={
                  <TextContent>
                    <Text>
                      With OSTree, you can manage the system software by
                      referencing a central image repository. OSTree images
                      contain a complete operating system ready to be remotely
                      installed at scale. You can track updates to images
                      through commits and enable secure updates that only
                      address changes and keep the operating system unchanged.
                      The updates are quick, and the rollbacks are easy.
                    </Text>
                    <Text>
                      <Button
                        component="a"
                        target="_blank"
                        variant="link"
                        icon={<ExternalLinkAltIcon />}
                        iconPosition="right"
                        isInline
                        href={OSTREE_URL}
                      >
                        Learn more about OSTree
                      </Button>
                    </Text>
                  </TextContent>
                }
              />
            }
          >
            <EdgeImagesTable />
          </Tab>
        </Tabs>
      ) : (
        imageList
      )}
      <Outlet />
    </>
  );
};

type HelpPopoverPropTypes = {
  header: string;
  body: React.ReactNode;
};

const HelpPopover = ({ header, body }: HelpPopoverPropTypes) => {
  const ref = React.createRef<HTMLElement>();
  return (
    <>
      <TabAction ref={ref}>
        <HelpIcon />
      </TabAction>
      <Popover
        minWidth="35rem"
        headerContent={header}
        bodyContent={body}
        triggerRef={ref}
      />
    </>
  );
};

export default LandingPage;
