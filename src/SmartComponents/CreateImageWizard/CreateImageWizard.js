import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions } from '../redux';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import { Wizard } from '@patternfly/react-core';

import WizardStepImageOutput from '../../PresentationalComponents/CreateImageWizard/WizardStepImageOutput';
import WizardStepUploadAWS from '../../PresentationalComponents/CreateImageWizard/WizardStepUploadAWS';
import WizardStepPackages from '../../PresentationalComponents/CreateImageWizard/WizardStepPackages';
import WizardStepRegistration from '../../PresentationalComponents/CreateImageWizard/WizardStepRegistration';
import WizardStepReview from '../../PresentationalComponents/CreateImageWizard/WizardStepReview';

import api from './../../api.js';
import { dummyPackageList } from '../../store/packages.json';

class CreateImageWizard extends Component {
    constructor(props) {
        super(props);

        this.setRelease = this.setRelease.bind(this);
        this.setUpload = this.setUpload.bind(this);
        this.setUploadOptions = this.setUploadOptions.bind(this);
        this.setSubscription = this.setSubscription.bind(this);
        this.setSubscribeNow = this.setSubscribeNow.bind(this);
        this.setPackagesSearchName = this.setPackagesSearchName.bind(this);
        this.handlePackagesSearch = this.handlePackagesSearch.bind(this);
        this.handleAddPackage = this.handleAddPackage.bind(this);
        this.handleRemovePackage = this.handleRemovePackage.bind(this);
        this.sortPackagesDescending = this.sortPackagesDescending.bind(this);
        this.clearPackagesSearch = this.clearPackagesSearch.bind(this);
        this.setPagePackagesSearch = this.setPagePackagesSearch.bind(this);
        this.setPerPagePackagesSearch = this.setPerPagePackagesSearch.bind(this);
        this.setPagePackagesSelected = this.setPagePackagesSelected.bind(this);
        this.setPerPagePackagesSelected = this.setPerPagePackagesSelected.bind(this);
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
                    share_with_accounts: [],
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
            packages: dummyPackageList,
            selectedPackages: [],
            packagesSearchName: '',
            showPackagesSearch: false,
            packagesSearchPage: 1,
            packagesSearchPerPage: 5,
            packagesSelectedPage: 1,
            packagesSelectedPerPage: 5,
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
        let share = this.state.upload.options.share_with_accounts;
        if (share.length === 0 || share[0].length !== 12 || isNaN(share[0])) {
            uploadErrors['aws-account-id'] =
                { label: 'AWS account ID', value: 'A 12-digit number is required' };
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

    setPackagesSearchName(packagesSearchName) {
        this.setState({ packagesSearchName });
    }

    handlePackagesSearch() {
        this.setState({ showPackagesSearch: true });
    }

    sortPackagesDescending(packages, field) {
        if (field === 'name') {
            return packages.sort((a, b) => {
                if (a[field] < b[field]) {return -1;}

                if (a[field] > b[field]) {return 1;}

                return 0;
            });
        }
    }

    handleAddPackage(selectedPackage) {
        // if a package is added it needs to display the correct state
        const updatedSelectedPackage = Object.assign({}, selectedPackage, {
            selected: true
        });

        // updated the selected package in the list of available packages
        const updatedPackages = this.state.packages.map(pack => pack.name === selectedPackage.name ? updatedSelectedPackage : pack);

        // add the selected package to the list of selected packages
        let updatedSelectedPackages = this.state.selectedPackages.concat([ updatedSelectedPackage ]);
        // sort the updated list of selected packages by name
        updatedSelectedPackages = this.sortPackagesDescending(updatedSelectedPackages, 'name');

        this.setState({
            packages: updatedPackages,
            selectedPackages: updatedSelectedPackages
        });
    }

    handleRemovePackage(selectedPackage) {
        // if a package is removed it needs to display the correct state
        const updatedSelectedPackage = Object.assign({}, selectedPackage, {
            selected: false
        });

        // updated the selected package in the list of available packages
        const updatedPackages = this.state.packages.map(pack => pack.name === selectedPackage.name ? updatedSelectedPackage : pack);
        // remove the no longer selected package from the list of selected packages
        const updatedSelectedPackages = this.state.selectedPackages.filter(pack => pack.name !== selectedPackage.name);

        this.setState({
            packages: updatedPackages,
            selectedPackages: updatedSelectedPackages
        });
    }

    clearPackagesSearch() {
        this.setState({ showPackagesSearch: false, packagesSearchName: '' });
    }

    setPagePackagesSearch(_event, packagesSearchPage) {
        this.setState({ packagesSearchPage });
    }

    setPerPagePackagesSearch(_event, packagesSearchPerPage) {
        this.setState({ packagesSearchPerPage });
    }

    setPagePackagesSelected(_event, packagesSelectedPage) {
        this.setState({ packagesSelectedPage });
    }

    setPerPagePackagesSelected(_event, packagesSelectedPerPage) {
        this.setState({ packagesSelectedPerPage });
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
                            share_with_accounts: this.state.upload.options.share_with_accounts,
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
                name: 'Packages',
                component: <WizardStepPackages
                    release={ this.state.release }
                    packages={ this.state.packages }
                    selectedPackages={ this.state.selectedPackages }
                    handleAddPackage={ this.handleAddPackage }
                    handleRemovePackage={ this.handleRemovePackage }
                    showPackagesSearch={ this.state.showPackagesSearch }
                    handlePackagesSearch={ this.handlePackagesSearch }
                    clearPackagesSearch={ this.clearPackagesSearch }
                    setPackagesSearchName={ this.setPackagesSearchName }
                    setPagePackagesSearch={ this.setPagePackagesSearch }
                    setPerPagePackagesSearch={ this.setPerPagePackagesSearch }
                    setPagePackagesSelected={ this.setPerPagePackagesSelected }
                    setPerPagePackagesSelected={ this.setPerPagePackagesSelected }
                    packagesSearchName={ this.state.packagesSearchName }
                    packagesSearchPage={ this.state.packagesSearchPage }
                    packagesSearchPerPage={ this.state.packagesSearchPerPage }
                    packagesSelectedPage={ this.state.packagesSelectedPage }
                    packagesSelectedPerPage={ this.state.packagesSelectedPerPage } /> },
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
            <>
                <PageHeader>
                    <PageHeaderTitle title='Create a new image' />
                </PageHeader>
                <section className="pf-c-page__main-wizard pf-m-limit-width">
                    <Wizard
                        onNext={ this.onStep }
                        onGoToStep={ this.onStep }
                        isInPage
                        steps={ steps }
                        onClose={ this.onClose }
                        onSave={ this.onSave } />
                </section>
            </>
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
