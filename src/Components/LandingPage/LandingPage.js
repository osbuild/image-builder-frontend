import React, { useState, useEffect } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  Button,
  ExpandableSection,
  Popover,
  Text,
  TextContent,
} from '@patternfly/react-core';
import {
  ArrowRightIcon,
  HelpIcon,
  CodeBranchIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { Outlet } from 'react-router-dom';

import awsQuickStart from './awsquickstart.json';
import azureQuickStart from './azurequickstart.json';
import contentQuickStart from './contentquickstart.json';
import './LandingPage.scss';

import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import ImagesTable from '../ImagesTable/ImagesTable';
import DocumentationButton from '../sharedComponents/DocumentationButton';

export const LandingPage = () => {
  const [showBetaAlert, setShowBetaAlert] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const { quickStarts } = useChrome();
  const { isBeta } = useGetEnvironment();
  const activateQuickstart = (qs) => quickStarts.toggle(qs.metadata.name);

  useEffect(() => {
    if (!quickStarts) return;
    quickStarts.set('hmsPreview', [
      awsQuickStart,
      azureQuickStart,
      contentQuickStart,
    ]);
  }, []);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle className="title" title="Image Builder" />
        <Popover
          headerContent={'About Image Builder'}
          bodyContent={
            <TextContent>
              <Text>
                Image Builder is a service that allows you to create RHEL images
                and push them to cloud environments.
              </Text>
              <DocumentationButton />
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
        <Popover
          headerContent={'About open source'}
          bodyContent={
            <TextContent>
              <Text>
                This service is open source, so all of its code is inspectable.
                Explore repositories to view and contribute to the source code.
              </Text>
              <Button
                component="a"
                target="_blank"
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
                href={
                  'https://www.osbuild.org/guides/image-builder-service/architecture.html'
                }
              >
                Repositories
              </Button>
            </TextContent>
          }
        >
          <Button
            variant="plain"
            aria-label="About Open Services"
            className="pf-u-pl-sm header-button"
          >
            <CodeBranchIcon />
          </Button>
        </Popover>
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        {!isBeta() && showBetaAlert && (
          <Alert
            className="pf-u-mb-xl"
            isInline
            variant="default"
            title="Try new features in our Beta environment."
            actionClose={
              <AlertActionCloseButton onClose={() => setShowBetaAlert(false)} />
            }
            actionLinks={
              <Button
                isInline
                component="a"
                variant="link"
                href="/beta/insights/image-builder/landing"
              >
                Enter beta environment
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
            toggleText="Help get started with beta features"
            onToggle={setShowHint}
            isExpanded={showHint}
            displaySize="large"
          >
            <p>
              For help getting started, access the quick starts for our beta
              features.
            </p>
            <p>
              <p>
                <Button
                  icon={<ArrowRightIcon />}
                  iconPosition="right"
                  variant="link"
                  isInline
                  component="a"
                  onClick={() => activateQuickstart(awsQuickStart)}
                >
                  Launch an AWS Image
                </Button>
              </p>
              <p>
                <Button
                  icon={<ArrowRightIcon />}
                  iconPosition="right"
                  variant="link"
                  isInline
                  component="a"
                  onClick={() => activateQuickstart(azureQuickStart)}
                >
                  Launch an Azure Image
                </Button>
              </p>
              <p>
                <Button
                  icon={<ArrowRightIcon />}
                  iconPosition="right"
                  variant="link"
                  isInline
                  component="a"
                  onClick={() => activateQuickstart(contentQuickStart)}
                >
                  Build an Image with Custom Content
                </Button>
              </p>
            </p>
          </ExpandableSection>
        )}
        <ImagesTable />
      </section>
      <Outlet />
    </React.Fragment>
  );
};

export default LandingPage;
