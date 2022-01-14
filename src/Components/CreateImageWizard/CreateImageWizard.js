import React from 'react';
import ImageCreator from './ImageCreator';
import { useNavigate } from 'react-router-dom';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { review, awsTarget, registration, googleCloudTarger, msAzureTarget, packages, imageOutput } from './steps';
import './CreateImageWizard.scss';
import { useDispatch } from 'react-redux';
import api from '../../api';
import { composeAdded } from '../../store/actions/actions';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

const onSave = (values) => {
    let customizations = {
        packages: values['selected-packages']?.map(p => p.name),
    };

    if (values['register-system'] === 'register-now-insights') {
        customizations.subscription = {
            'activation-key': values['subscription-activation-key'],
            insights: true,
            organization: Number(values['subscription-organization-id']),
            'server-url': 'subscription.rhsm.redhat.com',
            'base-url': 'https://cdn.redhat.com/',
        };
    } else if (values['register-system'] === 'register-now') {
        customizations.subscription = {
            'activation-key': values['subscription-activation-key'],
            insights: false,
            organization: Number(values['subscription-organization-id']),
            'server-url': 'subscription.rhsm.redhat.com',
            'base-url': 'https://cdn.redhat.com/',
        };
    }

    let requests = [];
    if (values['target-environment']?.aws) {
        let request = {
            distribution: values.release,
            image_requests: [
                {
                    architecture: 'x86_64',
                    image_type: 'ami',
                    upload_request: {
                        type: 'aws',
                        options: {
                            share_with_accounts: [ values['aws-account-id'] ],
                        },
                    },
                }],
            customizations,
        };
        requests.push(request);
    }

    if (values['target-environment']?.google) {
        let share = '';
        switch (values['google-account-type']) {
            case 'googleAccount':
                share = `user:${values['google-email']}`;
                break;
            case 'serviceAccount':
                share = `serviceAccount:${values['google-email']}`;
                break;
            case 'googleGroup':
                share = `group:${values['google-email']}`;
                break;
            case 'domain':
                share = `domain:${values['google-domain']}`;
                break;
        }

        let request = {
            distribution: values.release,
            image_requests: [
                {
                    architecture: 'x86_64',
                    image_type: 'vhd',
                    upload_request: {
                        type: 'gcp',
                        options: {
                            share_with_accounts: [ share ],
                        },
                    },
                }],
            customizations,
        };

        requests.push(request);
    }

    if (values['target-environment']?.azure) {
        let request = {
            distribution: values.release,
            image_requests: [
                {
                    architecture: 'x86_64',
                    image_type: 'vhd',
                    upload_request: {
                        type: 'azure',
                        options: {
                            tenant_id: values['azure-tenant-id'],
                            subscription_id: values['azure-subscription-id'],
                            resource_group: values['azure-resource-group'],
                        },
                    },
                }],
            customizations,
        };
        requests.push(request);
    }

    if (values['target-environment']?.vsphere) {
        let request = {
            distribution: values.release,
            image_requests: [
                {
                    architecture: 'x86_64',
                    image_type: 'vsphere',
                    upload_request: {
                        type: 'aws.s3',
                        options: {}
                    }
                }],
            customizations,
        };
        requests.push(request);
    }

    if (values['target-environment']?.['guest-image']) {
        let request = {
            distribution: values.release,
            image_requests: [
                {
                    architecture: 'x86_64',
                    image_type: 'guest-image',
                    upload_request: {
                        type: 'aws.s3',
                        options: {}
                    }
                }],
            customizations,
        };
        requests.push(request);
    }

    if (values['target-environment']?.['image-installer']) {
        let request = {
            distribution: values.release,
            image_requests: [
                {
                    architecture: 'x86_64',
                    image_type: 'image-installer',
                    upload_request: {
                        type: 'aws.s3',
                        options: {}
                    }
                }],
            customizations,
        };
        requests.push(request);
    }

    return requests;
};

const CreateImageWizard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return <ImageCreator
        onClose={ () => navigate('/') }
        onSubmit={ ({ values, setIsSaving }) => {
            setIsSaving(() => true);
            const requests = onSave(values);
            Promise.all(requests.map(request => api.composeImage(request).then((response) => {
                dispatch(composeAdded({
                    ...response,
                    request,
                    image_status: { status: 'pending' }
                }, true));
            })))
                .then(() => {
                    navigate('/');
                    dispatch(addNotification({
                        variant: 'success',
                        title: 'Your image is being created',
                    }));

                    setIsSaving(false);
                })
                .catch((err) => {
                    dispatch(addNotification({
                        variant: 'danger',
                        title: 'Your image could not be created',
                        description: 'Status code ' + err.response.status + ': ' + err.response.statusText,
                    }));

                    setIsSaving(false);
                });
        } }
        defaultArch="x86_64"
        schema={ {
            fields: [
                {
                    component: componentTypes.WIZARD,
                    name: 'image-builder-wizard',
                    className: 'image_builder',
                    isDynamic: true,
                    inModal: true,
                    buttonLabels: {
                        submit: 'Create image',
                    },
                    showTitles: true,
                    title: 'Create image',
                    crossroads: [ 'target-environment', 'release' ],
                    description: <>Create a RHEL image and push it to cloud providers. <Button
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
                    </Button></>,
                    // order in this array does not reflect order in wizard nav, this order is managed inside
                    // of each step by `nextStep` property!
                    fields: [
                        imageOutput,
                        awsTarget,
                        googleCloudTarger,
                        msAzureTarget,
                        registration,
                        packages,
                        review,
                    ]
                }
            ]
        } } />;
};

export default CreateImageWizard;
