import React, { useEffect, useState } from 'react';

import {
  Button,
  Label,
  Popover,
  Tabs,
  Tab,
  TabTitleText,
  Text,
  TextContent,
  TabAction,
  PageSection,
  Sidebar,
  SidebarContent,
  SidebarPanel,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import { useFlag } from '@unleash/proxy-client-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import './LandingPage.scss';

import Quickstarts from './Quickstarts';

import { useGetBlueprintsQuery } from '../../store/imageBuilderApiExperimental';
import { manageEdgeImagesUrlName } from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';
import BlueprintsSidebar from '../Blueprints/BlueprintsSidebar';
import EdgeImagesTable from '../edge/ImagesTable';
import ImagesTable from '../ImagesTable/ImagesTable';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

export const LandingPage = () => {
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
  const { data: blueprints } = useGetBlueprintsQuery('');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('');

  const edgeParityFlag = useFlag('edgeParity.image-list');
  const experimentalFlag =
    useFlag('image-builder.new-wizard.enabled') || process.env.EXPERIMENTAL;

  const traditionalImageList = (
    <>
      <PageSection>
        <Quickstarts />
      </PageSection>
      <PageSection>
        <ImagesTable />
      </PageSection>
    </>
  );

  const experimentalImageList = (
    <>
      <PageSection>
        <Quickstarts />
      </PageSection>
      <PageSection>
        <Sidebar
          hasBorder
          hasGutter
          className="pf-v5-u-background-color-100 pf-v5-u-p-lg"
        >
          <SidebarPanel>
            <BlueprintsSidebar
              blueprints={blueprints}
              selectedBlueprint={selectedBlueprint}
              setSelectedBlueprint={setSelectedBlueprint}
            />
          </SidebarPanel>
          <SidebarContent>
            <ImagesTable
              blueprints={blueprints}
              selectedBlueprint={selectedBlueprint}
              setSelectedBlueprint={setSelectedBlueprint}
            />
          </SidebarContent>
        </Sidebar>
      </PageSection>
    </>
  );

  const imageList = experimentalFlag
    ? experimentalImageList
    : traditionalImageList;

  return (
    <>
      <ImageBuilderHeader />
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
                          href={
                            'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html-single/managing_software_with_the_dnf_tool/index'
                          }
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
            title={
              <TabTitleText>
                <Label isCompact color="blue">
                  New
                </Label>{' '}
                Immutable (OSTree){' '}
              </TabTitleText>
            }
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
                        href={'https://ostreedev.github.io/ostree/'}
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
