/* global COMMITHASH */

import React, { Component } from 'react';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import { Button, Popover, TextContent, Text } from '@patternfly/react-core';
import { ExternalLinkAltIcon, GithubIcon, HelpIcon } from '@patternfly/react-icons';

import ImagesTable from '../ImagesTable/ImagesTable';
import './LandingPage.scss';

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
                        headerContent={ 'About Image Builder' }
                        bodyContent={ <TextContent>
                            <Text>
                                        Image Builder is a service that allows you to create RHEL images
                                        and push them to cloud environments.
                            </Text>
                            <Button
                                component="a"
                                target="_blank"
                                variant="link"
                                icon={ <ExternalLinkAltIcon /> }
                                iconPosition="right"
                                isInline
                                href="
https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/uploading_a_customized_rhel_system_image_to_cloud_environments/index
                                ">
                                    Documentation
                            </Button>
                            <br />
                            <Button
                                component="a"
                                target="_blank"
                                variant="link"
                                icon={ <GithubIcon /> }
                                iconPosition="right"
                                isInline
                                href={ 'https://github.com/RedHatInsights/image-builder-frontend/tree/' + COMMITHASH }>
                                    Contribute on GitHub
                            </Button>
                        </TextContent> }>
                        <button
                            type="button"
                            aria-label="About image builder"
                            className="pf-c-form__group-label-help">
                            <HelpIcon />
                        </button>
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
