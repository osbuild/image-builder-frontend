import React, { useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  Button,
  Popover,
  Text,
  TextContent,
} from '@patternfly/react-core';
import {
  HelpIcon,
  CodeBranchIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { Outlet } from 'react-router-dom';

import isBeta from '../../Utilities/isBeta';
import ImagesTable from '../ImagesTable/ImagesTable';
import './LandingPage.scss';
import DocumentationButton from '../sharedComponents/DocumentationButton';

export const LandingPage = () => {
  const [showBetaAlert, setShowBetaAlert] = useState(true);

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
        <ImagesTable />
      </section>
      <Outlet />
    </React.Fragment>
  );
};

export default LandingPage;
