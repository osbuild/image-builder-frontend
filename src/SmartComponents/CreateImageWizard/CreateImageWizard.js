import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions } from '../redux';

import { Wizard, TextContent } from '@patternfly/react-core';

import WizardStepImageOutput from '../../PresentationalComponents/CreateImageWizard/WizardStepImageOutput';
import WizardStepUploadAWS from '../../PresentationalComponents/CreateImageWizard/WizardStepUploadAWS';
import WizardStepPackages from '../../PresentationalComponents/CreateImageWizard/WizardStepPackages';
import WizardStepRegistration from '../../PresentationalComponents/CreateImageWizard/WizardStepRegistration';
import WizardStepReview from '../../PresentationalComponents/CreateImageWizard/WizardStepReview';

import api from './../../api.js';
import './CreateImageWizard.scss';

class CreateImageWizard extends Component {
    constructor(props) {
        super(props);

        this.handlePackagesSearch = this.handlePackagesSearch.bind(this);
        this.handlePackagesFilter = this.handlePackagesFilter.bind(this);
        this.packageListChange = this.packageListChange.bind(this);
        this.mapPackagesToComponent = this.mapPackagesToComponent.bind(this);
        this.setRelease = this.setRelease.bind(this);
        this.setUploadOptions = this.setUploadOptions.bind(this);
        this.setSubscription = this.setSubscription.bind(this);
        this.setSubscribeNow = this.setSubscribeNow.bind(this);
        this.setPackagesSearchName = this.setPackagesSearchName.bind(this);
        this.toggleUploadDestination = this.toggleUploadDestination.bind(this);
        this.onStep = this.onStep.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onClose = this.onClose.bind(this);
        this.validate = this.validate.bind(this);
        this.validateUploadAmazon = this.validateUploadAmazon.bind(this);
        this.validateSubscription = this.validateSubscription.bind(this);

        this.state = {
            arch: 'x86_64',
            imageType: 'qcow2',
            release: 'rhel-8',
            uploadAWS: {
                type: 'aws',
                options: {
                    share_with_accounts: []
                }
            },
            uploadAzure: {
                type: 'azure',
                options: {
                    temp: ''
                }
            },
            uploadGoogle: {
                type: 'google',
                options: {
                    temp: ''
                }
            },
            uploadDestinations: {
                aws: false,
                azure: false,
                google: false
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
            uploadAWSErrors: {},
            uploadAzureErrors: {},
            uploadGoogleErrors: {},
            subscriptionErrors: {},
            packagesAvailableComponents: [],
            packagesSelectedComponents: [],
            packagesFilteredComponents: [],
            packagesSelectedNames: [],
            packagesSearchName: '',
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
        if (this.state.uploadDestinations.aws) {this.validateUploadAmazon();}
        else {
            this.setState({
                uploadAWSErrors: {},
                uploadAzureErrors: {},
                uploadGoogleErrors: {},
            });
        }

        /* subscription */
        if (this.state.subscribeNow) {
            this.validateSubscription();
        } else {
            this.setState({ subscriptionErrors: {}});
        }
    }

    validateUploadAmazon() {
        let uploadAWSErrors = {};
        let share = this.state.uploadAWS.options.share_with_accounts;
        if (share.length === 0 || share[0].length !== 12 || isNaN(share[0])) {
            uploadAWSErrors['aws-account-id'] =
                { label: 'AWS account ID', value: 'A 12-digit number is required' };
        }

        this.setState({ uploadAWSErrors });
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

    toggleUploadDestination(provider) {
        this.setState(prevState => ({
            ...prevState,
            uploadDestinations: {
                ...prevState.uploadDestinations,
                [provider]: !prevState.uploadDestinations[provider]
            }
        }));
    }

    setUploadOptions(provider, uploadOptions) {
        switch (provider) {
            case 'aws':
                this.setState({
                    uploadAWS: {
                        type: provider,
                        options: uploadOptions
                    }
                });
                break;
            case 'azure':
                this.setState({
                    uploadAzure: {
                        type: provider,
                        options: uploadOptions
                    }
                });
                break;
            case 'google':
                this.setState({
                    uploadGoogle: {
                        type: provider,
                        options: uploadOptions
                    }
                });
                break;
            default:
                break;
        }
    }

    setSubscribeNow(subscribeNow) {
        this.setState({ subscribeNow });
    }

    setSubscription(subscription) {
        this.setState({ subscription }, this.validate);
    }

    setPackagesSearchName(packagesSearchName) {
        this.setState({ packagesSearchName });
    }

    mapPackagesToComponent(packages) {
        return packages.map((pack) =>
            <TextContent key={ pack }>
                <span className="pf-c-dual-list-selector__item-text">{ pack.name }</span>
                <small>{ pack.summary }</small>
            </TextContent>
        );
    }

    // this digs into the component properties to extract the package name
    mapComponentToPackageName(component) {
        return component.props.children[0].props.children;
    }

    handlePackagesSearch() {
        api.getPackages(this.state.release, this.state.arch, this.state.packagesSearchName).then(response => {
            const packageComponents = this.mapPackagesToComponent(response.data);
            this.setState({
                packagesAvailableComponents: packageComponents
            });
        });
    };

    handlePackagesFilter(filter) {
        const filteredPackages = this.state.packagesSelectedComponents.filter(component => {
            const name = this.mapComponentToPackageName(component);
            return name.includes(filter);
        });
        this.setState({
            packagesFilteredComponents: filteredPackages
        });
    }

    packageListChange(newAvailablePackages, newChosenPackages) {
        const chosenNames = newChosenPackages.map(component => this.mapComponentToPackageName(component));
        this.setState({
            packagesAvailableComponents: newAvailablePackages,
            packagesSelectedComponents: newChosenPackages,
            packagesFilteredComponents: newChosenPackages,
            packagesSelectedNames: chosenNames
        });
    }

    onSave () {
        let requests = [];
        Object.keys(this.state.uploadDestinations).forEach(provider => {
            switch (provider) {
                case 'aws': {
                    let request = {
                        distribution: this.state.release,
                        image_requests: [
                            {
                                architecture: this.state.arch,
                                image_type: 'ami',
                                upload_requests: [ this.state.uploadAWS ],
                            }],
                        customizations: {
                            subscription: this.state.subscription,
                            packages: this.state.packagesSelectedNames,
                        },
                    };
                    requests.push(request);
                    break;
                }

                case 'azure':
                    break;
                case 'google':
                    break;
                default:
                    break;
            }
        });

        const composeRequests = [];
        requests.forEach(request => {
            const composeRequest = api.composeImage(request).then(response => {
                let compose = {};
                compose[response.id] = {
                    image_status: {
                        status: 'pending',
                    },
                    distribution: request.distribution,
                    architecture: request.image_requests[0].architecture,
                    image_type: request.image_requests[0].image_type,
                };
                this.props.updateCompose(compose);
            });
            composeRequests.push(composeRequest);
        });
        Promise.all(composeRequests).then(() => this.props.history.push('/landing'));
    }

    onClose () {
        this.props.history.push('/landing');
    }

    render() {
        const StepImageOutput = {
            name: 'Image output',
            component: <WizardStepImageOutput
                value={ this.state.release }
                setRelease={ this.setRelease }
                toggleUploadDestination={ this.toggleUploadDestination }
                uploadDestinations={ this.state.uploadDestinations } />
        };

        const StepUploadAWS = {
            name: 'Amazon Web Services',
            component: <WizardStepUploadAWS
                uploadAWS={ this.state.uploadAWS }
                setUploadOptions={ this.setUploadOptions }
                errors={ this.state.uploadAWSErrors } />
        };

        const StepUploadAzure = {
            name: 'Microsoft Azure'
        };

        const StepUploadGoogle = {
            name: 'Google Cloud Platform'
        };

        const uploadDestinationSteps = [];
        if (this.state.uploadDestinations.aws) {
            uploadDestinationSteps.push(StepUploadAWS);
        }

        if (this.state.uploadDestinations.azure) {
            uploadDestinationSteps.push(StepUploadAzure);
        }

        if (this.state.uploadDestinations.google) {
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
                    subscription={ this.state.subscription }
                    subscribeNow={ this.state.subscribeNow }
                    setSubscription={ this.setSubscription }
                    setSubscribeNow={ this.setSubscribeNow }
                    errors={ this.state.subscriptionErrors } /> },
            {
                name: 'Packages',
                component: <WizardStepPackages
                    packageListChange={ this.packageListChange }
                    release={ this.state.release }
                    packagesAvailableComponents={ this.state.packagesAvailableComponents }
                    packagesFilteredComponents={ this.state.packagesFilteredComponents }
                    handlePackagesSearch={ this.handlePackagesSearch }
                    handlePackagesFilter= { this.handlePackagesFilter }
                    setPackagesSearchName={ this.setPackagesSearchName } /> },
            {
                name: 'Review',
                component: <WizardStepReview
                    release={ this.state.release }
                    uploadAWS={ this.state.uploadAWS }
                    uploadDestinations={ this.state.uploadDestinations }
                    subscription={ this.state.subscription }
                    subscribeNow={ this.state.subscribeNow }
                    uploadAWSErrors={ this.state.uploadAWSErrors }
                    subscriptionErrors={ this.state.subscriptionErrors } />,
                nextButtonText: 'Create',
            }
        ];
        return (
            <React.Fragment>
                <Wizard
                    title={ 'Create image' }
                    onNext={ this.onStep }
                    onGoToStep={ this.onStep }
                    steps={ steps }
                    onClose={ this.onClose }
                    onSave={ this.onSave }
                    isOpen />
            </React.Fragment>
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
