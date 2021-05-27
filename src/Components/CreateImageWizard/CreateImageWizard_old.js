import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions } from '../../store/actions';

import { Button, Wizard } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import WizardStepImageOutput from './WizardStepImageOutput';
import WizardStepUploadAWS from './WizardStepUploadAWS';
import WizardStepUploadAzure from './WizardStepUploadAzure';
import WizardStepPackages from './WizardStepPackages';
import WizardStepUploadGoogle from './WizardStepUploadGoogle';
import WizardStepRegistration from './WizardStepRegistration';
import WizardStepReview from './WizardStepReview';
import ImageWizardFooter from './ImageWizardFooter';

import './CreateImageWizard.scss';

class CreateImageWizard extends Component {
    constructor(props) {
        super(props);

        this.onStep = this.onStep.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onClose = this.onClose.bind(this);
        this.validate = this.validate.bind(this);
        this.validateUploadAmazon = this.validateUploadAmazon.bind(this);

        this.state = {
            /* errors take form of $fieldId: error */
            uploadAWSErrors: {},
            uploadAzureErrors: {},
            uploadGoogleErrors: {},
            isSaveInProgress: false,
            isValidSubscription: true,
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
        Object.keys(this.props.uploadDestinations).forEach(provider => {
            switch (provider) {
                case 'aws':
                    this.validateUploadAmazon();
                    break;
                case 'azure':
                    this.validateUploadAzure();
                    break;
                case 'google':
                    break;
                default:
                    break;
            }
        });
        /* subscription */
        if (this.props.subscribeNow) {
            this.setState({ isValidSubscription: this.props.subscription.activationKey ? true : false });
        } else {
            this.setState({ isValidSubscription: true });
        }
    }

    validateUploadAmazon() {
        let uploadAWSErrors = {};
        let share = this.props.uploadAWS.shareWithAccounts;
        if (share.length === 0 || share[0].length !== 12 || isNaN(share[0])) {
            uploadAWSErrors['aws-account-id'] =
                { label: 'AWS account ID', value: 'A 12-digit number is required' };
        }

        this.setState({ uploadAWSErrors });
    }

    validateUploadAzure() {
        let uploadAzureErrors = {};

        let tenant_id = this.props.uploadAzure.tenantId;
        if (tenant_id === null || tenant_id === '') {
            uploadAzureErrors['azure-resource-group'] =
                { label: 'Azure tenant ID', value: 'A tenant ID is required' };
        }

        let subscriptionId = this.props.uploadAzure.subscriptionId;
        if (subscriptionId === null || subscriptionId === '') {
            uploadAzureErrors['azure-subscription-id'] =
                { label: 'Azure subscription ID', value: 'A subscription ID is required' };
        }

        let resource_group = this.props.uploadAzure.resourceGroup;
        if (resource_group === null || resource_group === '') {
            uploadAzureErrors['azure-resource-group'] =
                { label: 'Azure resource group', value: 'A resource group is required' };
        }
        // TODO check oauth2 thing too here?
    }

    onSave() {
        this.setState({ isSaveInProgress: true });

        let customizations = {
            packages: this.props.selectedPackages.map(p => p.name),
        };
        if (this.props.subscribeNow) {
            customizations.subscription = {
                'activation-key': this.props.subscription.activationKey,
                insights: this.props.subscription.insights,
                organization: Number(this.props.subscription.organization),
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
            };
        }

        let requests = [];
        if (this.props.uploadDestinations.aws) {
            let request = {
                distribution: this.props.release.distro,
                image_requests: [
                    {
                        architecture: this.props.release.arch,
                        image_type: 'ami',
                        upload_request: {
                            type: 'aws',
                            options: {
                                share_with_accounts: this.props.uploadAWS.shareWithAccounts,
                            },
                        },
                    }],
                customizations,
            };
            requests.push(request);
        }

        if (this.props.uploadDestinations.google) {
            let share = '';
            switch (this.props.uploadGoogle.accountType) {
                case 'googleAccount':
                    share = 'user:' + this.props.uploadGoogle.shareWithAccounts[0].user;
                    break;
                case 'serviceAccount':
                    share = 'serviceAccount:' + this.props.uploadGoogle.shareWithAccounts[0].serviceAccount;
                    break;
                case 'googleGroup':
                    share = 'group:' + this.props.uploadGoogle.shareWithAccounts[0].group;
                    break;
                case 'domain':
                    share = 'domain:' + this.props.uploadGoogle.shareWithAccounts[0].domain;
                    break;
            }

            let request = {
                distribution: this.props.release.distro,
                image_requests: [
                    {
                        architecture: this.props.release.arch,
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

        if (this.props.uploadDestinations.azure) {
            let request = {
                distribution: this.props.release.distro,
                image_requests: [
                    {
                        architecture: this.props.release.arch,
                        image_type: 'vhd',
                        upload_request: {
                            type: 'azure',
                            options: {
                                tenant_id: this.props.uploadAzure.tenantId,
                                subscription_id: this.props.uploadAzure.subscriptionId,
                                resource_group: this.props.uploadAzure.resourceGroup,
                            },
                        },
                    }],
                customizations,
            };
            requests.push(request);
        }

        const composeRequests = requests.map(request => this.props.composeStart(request));

        Promise.all(composeRequests)
            .then(() => {
                if (!this.props.composesError) {
                    this.props.addNotification({
                        variant: 'success',
                        title: 'Your image is being created',
                    });
                    this.props.history.push('/landing');
                }

                this.setState({ isSaveInProgress: false });
            });
    }

    onClose () {
        this.props.history.push('/landing');
    }

    render() {
        const isValidUploadDestination = this.props.uploadDestinations.aws ||
            this.props.uploadDestinations.azure ||
            this.props.uploadDestinations.google;

        const StepImageOutput = {
            name: 'Image output',
            component: <WizardStepImageOutput />
        };

        const StepUploadAWS = {
            name: 'Amazon Web Services',
            component: <WizardStepUploadAWS
                errors={ this.state.uploadAWSErrors } />
        };

        const StepUploadAzure = {
            name: 'Microsoft Azure',
            component: <WizardStepUploadAzure
                errors={ this.state.uploadAzureErrors } />
        };

        const StepUploadGoogle = {
            name: 'Google Cloud Platform',
            component: <WizardStepUploadGoogle
                errors={ this.state.uploadGoogleErrors } />
        };

        const uploadDestinationSteps = [];
        if (this.props.uploadDestinations.aws) {
            uploadDestinationSteps.push(StepUploadAWS);
        }

        if (this.props.uploadDestinations.azure) {
            uploadDestinationSteps.push(StepUploadAzure);
        }

        if (this.props.uploadDestinations.google) {
            uploadDestinationSteps.push(StepUploadGoogle);
        }

        const StepTargetEnv = {
            name: 'Target environment',
            steps: uploadDestinationSteps
        };

        const steps = [
            StepImageOutput,
            ...(StepTargetEnv.steps.length > 0 ? [ StepTargetEnv ] : []),
            {
                name: 'Registration',
                component: <WizardStepRegistration
                    isValidSubscription={ this.state.isValidSubscription } /> },
            {
                name: 'Packages',
                component: <WizardStepPackages /> },
            {
                name: 'Review',
                component: <WizardStepReview
                    uploadAWSErrors={ this.state.uploadAWSErrors }
                    isValidSubscription={ this.state.isValidSubscription } />,
                nextButtonText: 'Create',
            }
        ];

        return (
            <React.Fragment>
                <Wizard
                    className="image-builder"
                    title={ 'Create image' }
                    description={ <>
                        Create a RHEL image and push it to cloud providers.
                        {' '}
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
                    </> }
                    onNext={ this.onStep }
                    onGoToStep={ this.onStep }
                    steps={ steps }
                    onClose={ this.onClose }
                    onSave={ this.onSave }
                    footer={ <ImageWizardFooter
                        isValidUploadDestination={ isValidUploadDestination }
                        isSaveInProgress={ this.state.isSaveInProgress }
                        isValidSubscription={ this.state.isValidSubscription }
                        error={ this.props.composesError } /> }
                    isOpen />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        composesError: state.composes.error,
        release: state.pendingCompose.release,
        uploadDestinations: state.pendingCompose.uploadDestinations,
        uploadAWS: state.pendingCompose.uploadAWS,
        uploadAzure: state.pendingCompose.uploadAzure,
        uploadGoogle: state.pendingCompose.uploadGoogle,
        selectedPackages: state.pendingCompose.selectedPackages,
        subscription: state.pendingCompose.subscription,
        subscribeNow: state.pendingCompose.subscribeNow,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        composeUpdated: (compose) => dispatch(actions.composeUpdated(compose)),
        composeStart: (composeRequest) => dispatch(actions.composeStart(composeRequest)),
        addNotification: (not) => dispatch(addNotification(not)),
    };
}

CreateImageWizard.propTypes = {
    composesError: PropTypes.string,
    composeUpdated: PropTypes.func,
    composeStart: PropTypes.func,
    addNotification: PropTypes.func,
    history: PropTypes.object,
    release: PropTypes.object,
    uploadDestinations: PropTypes.object,
    uploadAWS: PropTypes.object,
    uploadAzure: PropTypes.object,
    uploadGoogle: PropTypes.object,
    subscription: PropTypes.object,
    subscribeNow: PropTypes.bool,
    selectedPackages: PropTypes.array,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateImageWizard));
