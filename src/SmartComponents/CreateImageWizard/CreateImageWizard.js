import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions } from '../redux';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import { Wizard, Stack, StackItem } from '@patternfly/react-core';

import WizardStepImageOutput from '../../PresentationalComponents/CreateImageWizard/WizardStepImageOutput';
import WizardStepUploadAWS from '../../PresentationalComponents/CreateImageWizard/WizardStepUploadAWS';
import WizardStepRegistration from '../../PresentationalComponents/CreateImageWizard/WizardStepRegistration';
import WizardStepReview from '../../PresentationalComponents/CreateImageWizard/WizardStepReview';

import api from './../../api.js';

class CreateImageWizard extends Component {
    constructor(props) {
        super(props);

        this.setRelease = this.setRelease.bind(this);
        this.setUpload = this.setUpload.bind(this);
        this.setUploadOptions = this.setUploadOptions.bind(this);
        this.setSubscription = this.setSubscription.bind(this);
        this.setSubscribeNow = this.setSubscribeNow.bind(this);
        this.onStep = this.onStep.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onClose = this.onClose.bind(this);
        this.validate = this.validate.bind(this);
        this.validateUploadAmazon = this.validateUploadAmazon.bind(this);
        this.validateSubscription = this.validateSubscription.bind(this);

        this.state = {
            release: 'rhel-8',
            upload: {
                type: 'aws',
                options: {
                    service: 'ec2',
                    region: 'eu-west-2',
                    access_key_id: null,
                    secret_access_key: null,
                    bucket: null,
                }
            },
            subscription: {
                organization: null,
                'activation-key': null,
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
                insights: true
            },
            subscribeNow: true,
            /* errors take form of $fieldId: error */
            uploadErrors: {},
            subscriptionErrors: {},
        };
    }

    async componentDidMount() {
        let user = await insights.chrome.auth.getUser();
        this.setState({
            subscription: {
                organization: Number(user.identity.internal.org_id)
            }
        });
    }

    onStep(step) {
        if (step.name === 'Review') {
            this.validate();
        }
    }

    validate() {
        /* upload */
        if (this.state.upload.type === 'aws') {
            this.validateUploadAmazon();
        } else {
            this.setState({ uploadErrors: {}});
        }

        /* subscription */
        if (this.state.subscribeNow) {
            this.validateSubscription();
        } else {
            this.setState({ subscriptionErrors: {}});
        }
    }

    validateUploadAmazon() {
        let uploadErrors = {};
        if (!this.state.upload.options.access_key_id) {
            uploadErrors['amazon-access-id'] =
                { label: 'Access key ID', value: 'A value is required' };
        }

        if (!this.state.upload.options.secret_access_key) {
            uploadErrors['amazon-access-secret'] =
                { label: 'Secret access key', value: 'A value is required' };
        }

        if (!this.state.upload.options.region) {
            uploadErrors['amazon-region'] =
                { label: 'Region', value: 'A value is required' };
        }

        if (this.state.upload.options.service === 's3' &&
            !this.state.upload.options.bucket) {
            uploadErrors['amazon-bucket'] =
                { label: 'Bucket', value: 'A value is required' };
        }

        this.setState({ uploadErrors });
    }

    validateSubscription() {
        let subscriptionErrors = {};
        if (!this.state.subscription['activation-key']) {
            subscriptionErrors['subscription-activation'] =
                { label: 'Activation key', value: 'A value is required' };
        }

        this.setState({ subscriptionErrors });
    }

    setRelease(release) {
        this.setState({ release });
    }

    setUpload(upload) {
        this.setState({ upload });
    }

    setUploadOptions(uploadOptions) {
        this.setState(oldState => {
            return {
                upload: {
                    type: oldState.upload.type,
                    options: uploadOptions
                }
            };
        });
    }

    setSubscribeNow(subscribeNow) {
        this.setState({ subscribeNow });
    }

    setSubscription(subscription) {
        this.setState({ subscription }, this.validate);
    }

    onSave () {
        let request = {
            distribution: this.state.release,
            image_requests: [
                {
                    architecture: 'x86_64',
                    image_type: 'qcow2',
                    upload_requests: [{
                        type: 'aws',
                        options: {
                            region: this.state.upload.options.region,
                            s3: {
                                access_key_id: this.state.upload.options.access_key_id,
                                secret_access_key: this.state.upload.options.secret_access_key,
                                bucket: this.state.upload.options.bucket,
                            },
                            ec2: {
                                access_key_id: this.state.upload.options.access_key_id,
                                secret_access_key: this.state.upload.options.secret_access_key,
                            },
                        },
                    }],
                }],
            customizations: {
                subscription: this.state.subscription,
            },
        };

        let { updateCompose } = this.props;
        api.composeImage(request).then(response => {
            let compose = {};
            compose[response.id] = {
                status: 'request sent',
                distribution: request.distribution,
                architecture: request.image_requests[0].architecture,
                image_type: request.image_requests[0].image_type,
            };
            updateCompose(compose);
            this.props.history.push('/landing');
        });
    }

    onClose () {
        this.props.history.push('/landing');
    }

    render() {
        const StepImageOutput = {
            name: 'Image output',
            component: <WizardStepImageOutput
                value={ this.state.release }
                upload={ this.state.upload }
                setRelease={ this.setRelease }
                setUpload={ this.setUpload } />
        };
        const StepUploadAWS = {
            name: 'Upload to AWS',
            component: <WizardStepUploadAWS
                upload={ this.state.upload }
                setUploadOptions={ this.setUploadOptions }
                errors={ this.state.uploadErrors } />
        };

        const steps = [
            StepImageOutput,
            ...(this.state.upload.type === 'aws' ? [ StepUploadAWS ] : []),
            {
                name: 'Registration',
                component: <WizardStepRegistration
                    subscription={ this.state.subscription }
                    subscribeNow={ this.state.subscribeNow }
                    setSubscription={ this.setSubscription }
                    setSubscribeNow={ this.setSubscribeNow }
                    errors={ this.state.subscriptionErrors } /> },
            {
                name: 'Review',
                component: <WizardStepReview
                    release={ this.state.release }
                    upload={ this.state.upload }
                    subscription={ this.state.subscription }
                    subscribeNow={ this.state.subscribeNow }
                    uploadErrors={ this.state.uploadErrors }
                    subscriptionErrors={ this.state.subscriptionErrors } />,
                nextButtonText: 'Create',
            }
        ];

        return (
            <Stack className="pf-u-h-100">
                <StackItem>
                    <PageHeader>
                        <PageHeaderTitle title='Create a new image' />
                    </PageHeader>
                </StackItem>
                <StackItem isFilled>
                    <Wizard
                        onNext={ this.onStep }
                        onGoToStep={ this.onStep }
                        isInPage
                        steps={ steps }
                        onClose={ this.onClose }
                        onSave={ this.onSave } />
                </StackItem>
            </Stack>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateCompose: (compose) => dispatch(actions.updateCompose(compose)),
    };
}

CreateImageWizard.propTypes = {
    updateCompose: PropTypes.func,
    history: PropTypes.object,
};

export default connect(null, mapDispatchToProps)(withRouter(CreateImageWizard));
