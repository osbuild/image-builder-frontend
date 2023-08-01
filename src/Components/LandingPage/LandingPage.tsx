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
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useFlag } from '@unleash/proxy-client-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import './LandingPage.scss';

import Quickstarts from './Quickstarts';

import { manageEdgeImagesUrlName } from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';
import EdgeImagesTable from '../edge/ImagesTable';
import ImagesTable from '../ImagesTable/ImagesTable';

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

  const edgeParityFlag = useFlag('edgeParity.image-list');
  const traditionalImageList = (
    <section className="pf-l-page__main-section pf-c-page__main-section">
      <Quickstarts />

      <ImagesTable />
    </section>
  );
  return (
    <>
      {/*@ts-ignore*/}
      <PageHeader>
        <PageHeaderTitle className="title" title="Image Builder" />
        <Popover
          minWidth="35rem"
          headerContent={'About image builder'}
          bodyContent={
            <TextContent>
              <Text>
                Image builder is a tool for creating deployment-ready customized
                system images: installation disks, virtual machines, cloud
                vendor-specific images, and others. By using image builder, you
                can make these images faster than manual procedures because it
                eliminates the specific configurations required for each output
                type.
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
                    'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/creating_customized_rhel_images_using_the_image_builder_service'
                  }
                >
                  Image builder for RPM-DNF documentation
                </Button>
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
                    'https://access.redhat.com/documentation/en-us/edge_management/2022/html/create_rhel_for_edge_images_and_configure_automated_management/index'
                  }
                >
                  Image builder for OSTree documentation
                </Button>
              </Text>
            </TextContent>
          }
        >
          <Button
            variant="plain"
            aria-label="About image builder"
            className="pf-u-pl-sm header-button"
          >
            <HelpIcon />
          </Button>
        </Popover>
        <OpenSourceBadge repositoriesURL="https://www.osbuild.org/guides/image-builder-service/architecture.html" />
      </PageHeader>
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
            {traditionalImageList}
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
        traditionalImageList
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
        reference={ref}
      />
    </>
  );
};

export default LandingPage;
