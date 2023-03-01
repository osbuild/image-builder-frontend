import React, { Component } from 'react';

import { Button, Popover, Text, TextContent } from '@patternfly/react-core';
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

import ImagesTable from '../ImagesTable/ImagesTable';
import './LandingPage.scss';
import DocumentationButton from '../sharedComponents/DocumentationButton';

class LandingPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <PageHeader>
          <PageHeaderTitle className="title" title="Image Builder" />
          <Popover
            headerContent={'About Image Builder'}
            bodyContent={
              <TextContent>
                <Text>
                  Image Builder is a service that allows you to create RHEL
                  images and push them to cloud environments.
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
                  This service is open source, so all of its code is
                  inspectable. Explore repositories to view and contribute to
                  the source code.
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
          <ImagesTable />
        </section>
        <Outlet />
      </React.Fragment>
    );
  }
}

export default LandingPage;
