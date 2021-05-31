import React from 'react';
import ImageCreator from './ImageCreator';
import { useHistory } from 'react-router-dom';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { review, awsTarget, registration, googleCloudTarger, msAzureTarget, packages, imageOutput } from './steps';
import './CreateImageWizard.scss';

const CreateImage = () => {
    const history = useHistory();
    return <ImageCreator
        onClose={ () => history.push('/landing') }
        onSubmit={ (values) => console.log(values) }
        schema={ {
            fields: [
                {
                    component: componentTypes.WIZARD,
                    name: 'image-builder-wizard',
                    className: 'image-builder',
                    isDynamic: true,
                    inModal: true,
                    showTitles: true,
                    title: 'Create image',
                    crossroads: [ 'target-environment' ],
                    description: <div>Create a RHEL image and push it to cloud providers. <Button
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
                    </Button></div>,
                    // order in this array does not reflect order in wizard nav, this order is managed inside
                    // of each step by `nextStep` property!
                    fields: [
                        imageOutput,
                        awsTarget,
                        msAzureTarget,
                        googleCloudTarger,
                        registration,
                        packages,
                        review,
                    ]
                }
            ]
        } } />;
};

export default CreateImage;
