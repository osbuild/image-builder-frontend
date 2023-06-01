import React, { useState } from 'react';

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

import './LandingPage.scss';

import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import ImagesTable from '../ImagesTable/ImagesTable';
import DocumentationButton from '../sharedComponents/DocumentationButton';

export const LandingPage = () => {
  const [showBetaAlert, setShowBetaAlert] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const { quickStarts } = useChrome();
  const { isBeta } = useGetEnvironment();
  const activateQuickstart = (qs) => () => quickStarts.activateQuickstart(qs);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle className="title" title="Images" />
        <Popover
          headerContent={'About Images'}
          bodyContent={
            <TextContent>
              <Text>
                Images is a service that allows you to create RHEL images and
                push them to cloud environments.
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
      <Outlet />
    </React.Fragment>
  );
};

export default LandingPage;
