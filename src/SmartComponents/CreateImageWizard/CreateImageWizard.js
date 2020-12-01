import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions } from '../redux';
import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import {
    Alert,
    Flex,
    FlexItem,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Radio,
    TextContent,
    TextInput,
    Wizard,
} from '@patternfly/react-core';

import { ExclamationCircleIcon } from '@patternfly/react-icons';

import api from './../../api.js';

const ReleaseComponent = (props) => {
    const options = [
        { value: 'rhel-8', label: 'Red Hat Enterprise Linux (RHEL) 8.2' },
    ];
    return (
        <Form isHorizontal>
            <FormGroup label="Release" fieldId="release-select">
                <FormSelect value={ props.value } onChange={ value => props.setRelease(value) }
                    aria-label="Select release input" id="release-select" data-testid="release-select">
                    { options.map(option => <FormSelectOption key={ option.value } value={ option.value } label={ option.label } />) }
                </FormSelect>
            </FormGroup>
        </Form>
    );
};

ReleaseComponent.propTypes = {
    setRelease: PropTypes.func,
    value: PropTypes.string,
};

const AmazonUploadComponent = (props) => {
    return (
        <>
            <FormGroup isRequired label="AWS account ID" fieldId="aws-account-id"
                helperTextInvalid={ (props.errors['aws-account-id'] && props.errors['aws-account-id'].value) || '' }
                validated={ (props.errors['amazon-access-id'] && 'error') || 'default' }>
                <TextInput value={ props.upload.options.share_with_accounts || '' }
                    type="text" aria-label="amazon access key ID" id="aws-account-id"
                    data-testid="aws-account-id" isRequired
                    onChange={ value => props.setUploadOptions(Object.assign(props.upload.options, { share_with_accounts: [ value ]})) } />
            </FormGroup>
        </>
    );
};

AmazonUploadComponent.propTypes = {
    setUploadOptions: PropTypes.func,
    upload: PropTypes.object,
    errors: PropTypes.object,
};

const UploadComponent = (props) => {
    const uploadTypes = [
        { value: 'aws', label: 'Amazon Machine Image (.ami)' },
    ];

    return (
        <>
            <Form isHorizontal>
                <FormGroup isRequired label="Destination" fieldId="upload-destination">
                    <FormSelect value={ props.upload.type || '' } id="upload-destination"
                        data-testid="upload-destination" isRequired
                        onChange={ value => props.setUpload({ type: value, options: props.upload.options }) } aria-label="Select upload destination">
                        { uploadTypes.map(type => <FormSelectOption key={ type.value } value={ type.value } label={ type.label } />) }
                    </FormSelect>
                </FormGroup>
                { props.upload.type === 'aws' &&
                  <AmazonUploadComponent upload={ props.upload } setUploadOptions={ props.setUploadOptions } errors={ props.errors } /> }
            </Form>
        </>
    );
};

UploadComponent.propTypes = {
    setUpload: PropTypes.func,
    setUploadOptions: PropTypes.func,
    upload: PropTypes.object,
    errors: PropTypes.object,
};

const SubscriptionComponent = (props) => {
    return (
        <Form>
            <FormGroup isRequired label="Register the system" fieldId="subscribe-radio">
                <Radio name="subscribe-radio" isChecked={ props.subscribeNow } id="subscribe-radio"
                    label="Embed an activation key and register systems on first boot"
                    onChange={ () => props.setSubscribeNow(true) }
                    data-testid="register-now-radio-button" />
                <Radio name="subscribe-radio" isChecked={ !props.subscribeNow }
                    label="Register the system later" id="subscribe-radio"
                    onChange={ () => props.setSubscribeNow(false) }
                    data-testid="register-later-radio-button" />
            </FormGroup>
            { props.subscribeNow &&
              <>
                  <FormGroup label="Organization ID" fieldId="subscription-organization">
                      <TextInput isDisabled value={ props.subscription.organization || '' } type="text"
                          id="subscription-organization" aria-label="Subscription organization ID"
                          data-testid="organization-id" />
                  </FormGroup>
                  <FormGroup isRequired label="Activation key" fieldId="subscription-activation"
                      helperTextInvalid={ (props.errors['subscription-activation'] && props.errors['subscription-activation'].value) || '' }
                      validated={ (props.errors['subscription-activation'] && 'error') || 'default' }>
                      <TextInput value={ props.subscription['activation-key'] || '' } type="password"
                          data-testid="subscription-activation" isRequired
                          id="subscription-activation" aria-label="Subscription activation key"
                          onChange={ value => props.setSubscription(Object.assign(props.subscription, { 'activation-key': value })) } />
                  </FormGroup>
              </> }
        </Form>
    );
};

SubscriptionComponent.propTypes = {
    setSubscription: PropTypes.func,
    setSubscribeNow: PropTypes.func,
    subscription: PropTypes.object,
    subscribeNow: PropTypes.bool,
    errors: PropTypes.object,
};

const ReviewComponent = (props) => {
    return (
        <>
            { (Object.keys(props.uploadErrors).length > 0 ||
               Object.keys(props.subscriptionErrors).length > 0) &&
              <Alert variant="danger" isInline title="Required information is missing" /> }
            <TextContent>
                <h2>Create image</h2>
                <small>
                    Review the information and click Create image
                    to create the image using the following criteria.
                </small>
                <h3>Release</h3>
                <Flex>
                    <FlexItem flex={ { default: 'flex_1' } }>
                        Release
                    </FlexItem>
                    <FlexItem flex={ { default: 'flex_2' } }>
                        { props.release }
                    </FlexItem>
                </Flex>
                <h3>Image output</h3>
                <Flex>
                    <FlexItem flex={ { default: 'flex_1' } }>
                        Destination
                    </FlexItem>
                    <FlexItem flex={ { default: 'flex_2' } }>
                        { props.upload && <>{ props.upload.type }</> }
                    </FlexItem>
                </Flex>
                { Object.entries(props.uploadErrors).map(([ key, error ]) => {
                    return (<Flex key={ key }>
                        <FlexItem flex={ { default: 'flex_1' } }>
                            { error.label }
                        </FlexItem>
                        <FlexItem flex={ { default: 'flex_2' } }>
                            <ExclamationCircleIcon className="error" /> { error.value }
                        </FlexItem>
                    </Flex>);
                })}
                <h3>Registration</h3>
                <Flex>
                    <FlexItem flex={ { default: 'flex_1' } }>
                        Subscription
                    </FlexItem>
                    { !props.subscribeNow &&
                      <FlexItem flex={ { default: 'flex_2' } }>
                          Register the system later
                      </FlexItem> }
                    { props.subscribeNow &&
                      <FlexItem flex={ { default: 'flex_2' } }>
                          Register the system on first boot
                      </FlexItem> }
                </Flex>
                { Object.entries(props.subscriptionErrors).map(([ key, error ]) => {
                    return (<Flex key={ key }>
                        <FlexItem flex={ { default: 'flex_1' } }>
                            { error.label }
                        </FlexItem>
                        <FlexItem flex={ { default: 'flex_2' } }>
                            <ExclamationCircleIcon className="error" /> { error.value }
                        </FlexItem>
                    </Flex>);
                })}
            </TextContent>
        </>
    );
};

ReviewComponent.propTypes = {
    release: PropTypes.string,
    upload: PropTypes.object,
    subscription: PropTypes.object,
    subscribeNow: PropTypes.bool,
    uploadErrors: PropTypes.object,
    subscriptionErrors: PropTypes.object,
};

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
            subscribeNow: false,
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
        const steps = [
            {
                name: 'Release',
                component: <ReleaseComponent
                    value={ this.state.release }
                    setRelease={ this.setRelease } /> },
            {
                name: 'Target environment',
                component: <UploadComponent
                    upload={ this.state.upload }
                    setUpload={ this.setUpload }
                    setUploadOptions={ this.setUploadOptions }
                    errors={ this.state.uploadErrors } /> },
            {
                name: 'Registration',
                component: <SubscriptionComponent
                    subscription={ this.state.subscription }
                    subscribeNow={ this.state.subscribeNow }
                    setSubscription={ this.setSubscription }
                    setSubscribeNow={ this.setSubscribeNow }
                    errors={ this.state.subscriptionErrors } /> },
            {
                name: 'Review',
                component: <ReviewComponent
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
                <Wizard
                    onNext={ this.onStep }
                    onGoToStep={ this.onStep }
                    isInPage
                    steps={ steps }
                    onClose={ this.onClose }
                    onSave={ this.onSave } />
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
