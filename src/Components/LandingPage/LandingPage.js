/* global COMMITHASH */

import React, { Component } from 'react';

// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';

import { Button, Popover, TextContent, Text } from '@patternfly/react-core';
import { GithubIcon, HelpIcon } from '@patternfly/react-icons';

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
                <br />
                <Button
                  component="a"
                  target="_blank"
                  variant="link"
                  icon={<GithubIcon />}
                  iconPosition="right"
                  isInline
                  href={
                    'https://github.com/RedHatInsights/image-builder-frontend/tree/' +
                    COMMITHASH
                  }
                >
                  Contribute on GitHub
                </Button>
              </TextContent>
            }
          >
            <Button
              variant="plain"
              aria-label="About image builder"
              className="pf-u-pl-sm"
            >
              <HelpIcon />
            </Button>
          </Popover>
        </PageHeader>
        <section className="pf-l-page__main-section pf-c-page__main-section">
          <ImagesTable />
        </section>
      </React.Fragment>
    );
  }
}

export default LandingPage;
