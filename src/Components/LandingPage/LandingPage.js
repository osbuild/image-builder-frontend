import React, { useEffect, useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  Button,
  ExpandableSection,
  Label,
  Popover,
  Tabs,
  Tab,
  TabTitleText,
  Text,
  TextContent,
} from '@patternfly/react-core';
import {
  ArrowRightIcon,
  ExternalLinkAltIcon,
  HelpIcon,
} from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useFlag } from '@unleash/proxy-client-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import './LandingPage.scss';

import { manageEdgeImagesUrlName } from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';
import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import EdgeImagesTable from '../edge/ImagesTable';
import ImagesTable from '../ImagesTable/ImagesTable';

export const LandingPage = () => {
  const [showBetaAlert, setShowBetaAlert] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const { quickStarts } = useChrome();
  const { isBeta } = useGetEnvironment();
  const activateQuickstart = (qs) => () => quickStarts.activateQuickstart(qs);

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
  }, [pathname]);
  const handleTabClick = (_event, tabIndex) => {
    const tabPath = tabsPath[tabIndex];
    if (tabPath !== undefined) {
      navigate(tabPath);
    }
    setActiveTabKey(tabIndex);
  };

  const edgeParityFlag = useFlag('edgeParity.image-list');
  const traditionalImageList = (
    <section className="pf-l-page__main-section pf-c-page__main-section">
      {!isBeta() && showBetaAlert && (
        <Alert
          className="pf-u-mb-xl"
          isInline
          variant="default"
          title="Try new features in our Preview environment."
          actionClose={
            <AlertActionCloseButton onClose={() => setShowBetaAlert(false)} />
          }
          actionLinks={
            <Button
              isInline
              component="a"
              variant="link"
              href="/preview/insights/image-builder/landing"
            >
              Enter Preview environment
            </Button>
          }
        >
          <p>
            Launch Amazon Web Services or Microsoft Azure hosts to the cloud
            from the console.
          </p>
          <p>
            Link custom repositories and build any supported image with custom
            content.
          </p>
        </Alert>
      )}
      {isBeta() && (
        <ExpandableSection
          className="pf-m-light pf-u-mb-xl expand-section"
          toggleText="Help get started with Preview features"
          onToggle={setShowHint}
          isExpanded={showHint}
          displaySize="large"
        >
          <p className="pf-u-pb-sm">
            For help getting started, access the quick starts for our Preview
            features.
          </p>
          <p className="pf-u-pt-sm">
            <Button
              icon={<ArrowRightIcon />}
              iconPosition="right"
              variant="link"
              isInline
              component="a"
              onClick={activateQuickstart('insights-launch-aws')}
              className="pf-u-font-weight-bold"
            >
              Launch an AWS Image
            </Button>
          </p>
          <p className="pf-u-pt-sm">
            <Button
              icon={<ArrowRightIcon />}
              iconPosition="right"
              variant="link"
              isInline
              component="a"
              onClick={activateQuickstart('insights-launch-azure')}
              className="pf-u-font-weight-bold"
            >
              Launch an Azure Image
            </Button>
          </p>
          <p className="pf-u-pt-sm">
            <Button
              icon={<ArrowRightIcon />}
              iconPosition="right"
              variant="link"
              isInline
              component="a"
              onClick={activateQuickstart('insights-custom-repos')}
              className="pf-u-font-weight-bold"
            >
              Build an Image with Custom Content
            </Button>
          </p>
        </ExpandableSection>
      )}
      <ImagesTable />
    </section>
  );
  return (
    <React.Fragment>
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
            title={
              <TabTitleText>
                Conventional (RPM-DNF){' '}
                <Popover
                  minWidth="35rem"
                  headerContent={'Conventional (RPM-DNF)'}
                  bodyContent={
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
              </TabTitleText>
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
                <Popover
                  minWidth="35rem"
                  headerContent={'Immutable (OSTree)'}
                  bodyContent={
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
                >
                  <Button
                    variant="plain"
                    aria-label="About image builder"
                    className="pf-u-pl-sm header-button"
                  >
                    <HelpIcon />
                  </Button>
                </Popover>
              </TabTitleText>
            }
          >
            <EdgeImagesTable />
          </Tab>
        </Tabs>
      ) : (
        traditionalImageList
      )}
      <Outlet />
    </React.Fragment>
  );
};
export default LandingPage;
