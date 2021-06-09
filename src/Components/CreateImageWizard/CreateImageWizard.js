import React, { useState, useEffect } from 'react';
import ImageCreator from './ImageCreator';
import { useHistory } from 'react-router-dom';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Button, Spinner } from '@patternfly/react-core';
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

    if (values['subscription-activation']) {
        customizations.subscription = {
            'activation-key': values['subscription-activation'],
            insights: true,
            organization: Number(values['subscription-organization']),
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

    return requests;
};

const CreateImage = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [ user, setUser ] = useState();
    useEffect(() => {
        (async () => {
            const userData = await insights.chrome.auth.getUser();
            setUser(() => userData);
        })();
    }, []);
    return user ? <ImageCreator
        onClose={ () => history.push('/landing') }
        onSubmit={ ({ values, setIsSaving }) => {
            setIsSaving(() => true);
            const requests = onSave(values);
            Promise.all(requests.map(request => api.composeImage(request).then((response) => {
                dispatch(composeAdded({
                    ...response,
                    request,
                    image_status: { status: 'pending' }
                }));
            })))
                .then(() => {
                    history.push('/landing');
                    dispatch(addNotification({
                        variant: 'success',
                        title: 'Your image is being created',
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
                    className: 'image-builder',
                    isDynamic: true,
                    inModal: true,
                    buttonLabels: {
                        submit: 'Create',
                    },
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
                        googleCloudTarger,
                        msAzureTarget,
                        registration(user),
                        packages,
                        review,
                    ]
                }
            ]
        } } /> : <Spinner />;
};

export default CreateImage;
