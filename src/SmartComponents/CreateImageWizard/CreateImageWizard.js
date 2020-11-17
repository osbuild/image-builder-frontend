import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { actions } from '../redux';

import {
    Alert,
    Flex,
    FlexItem,
    FlexModifiers,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Radio,
    TextContent,
    TextInput,
    Title,
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
    const serviceOptions = [
        { value: 'ec2', label: 'Amazon Elastic Compute Cloud (ec2)' },
        { value: 's3', label: 'Amazon Simple Storage Service (s3)' },
    ];

    return (
        <>
            <FormGroup isRequired label="Access key ID" fieldId="amazon-access-id"
                helperTextInvalid={ (props.errors['amazon-access-id'] && props.errors['amazon-access-id'].value) || '' }
                validated={ (props.errors['amazon-access-id'] && 'error') || 'default' }>
                <TextInput value={ props.upload.options.access_key_id || '' }
                    type="text" aria-label="amazon access key ID" id="amazon-access-id"
                    data-testid="aws-access-key" isRequired
                    onChange={ value => props.setUploadOptions(Object.assign(props.upload.options, { access_key_id: value })) } />
            </FormGroup>
            <FormGroup isRequired label="Secret access key" fieldId="amazon-access-secret"
                helperTextInvalid={ (props.errors['amazon-access-secret'] && props.errors['amazon-access-secret'].value)  || '' }
                validated={ (props.errors['amazon-access-secret'] && 'error') || 'default' }>
                <TextInput value={ props.upload.options.secret_access_key || '' }
                    data-testid="aws-secret-access-key" isRequired
                    type="password" aria-label="amazon secret access key" id="amazon-access-secret"
                    onChange={ value => props.setUploadOptions(Object.assign(props.upload.options, { secret_access_key: value })) } />
            </FormGroup>
            <FormGroup isRequired label="Service" fieldId="amazon-service">
                <FormSelect value={ props.upload.options.service } aria-label="Select amazon service" id="amazon-service"
                    data-testid="aws-service-select"
                    onChange={ value => props.setUploadOptions(Object.assign(props.upload.options, { service: value })) }>
                    { serviceOptions.map(option => <FormSelectOption key={ option.value } value={ option.value } label={ option.label } />) }
                </FormSelect>
            </FormGroup>
            <FormGroup isRequired label="Region" fieldId="amazon-region"
                helperTextInvalid={ (props.errors['amazon-region'] && props.errors['amazon-region'].value) || '' }
                validated={ (props.errors['amazon-region'] && 'error') || 'default' }>
                <TextInput value={ props.upload.options.region } type="text" aria-label="amazon region" id="amazon-region"
                    data-testid="aws-region" isRequired
                    onChange={ value => props.setUploadOptions(Object.assign(props.upload.options, { region: value })) } />
            </FormGroup>
            { props.upload.options.service === 's3' &&
              <FormGroup isRequired label="Bucket" fieldId="amazon-bucket"
                  helperTextInvalid={ (props.errors['amazon-bucket'] && props.errors['amazon-bucket'].value) || '' }
                  validated={ (props.errors['amazon-bucket'] && 'error') || 'default' }>
                  <TextInput value={ props.upload.options.bucket || '' } type="text" aria-label="amazon bucket" id="amazon-bucket"
                      data-testid="aws-bucket" isRequired
                      onChange={ value => props.setUploadOptions(Object.assign(props.upload.options, { bucket: value })) } />
              </FormGroup> }
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
        { value: 'aws', label: 'Amazon Machine Image (.raw)' },
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
                    <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-1'] }] }>
                        Release
                    </FlexItem>
                    <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-2'] }] }>
                        { props.release }
                    </FlexItem>
                </Flex>
                <h3>Image output</h3>
                <Flex>
                    <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-1'] }] }>
                        Destination
                    </FlexItem>
                    <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-2'] }] }>
                        { props.upload && <>{ props.upload.type }</> }
                    </FlexItem>
                </Flex>
                { Object.entries(props.uploadErrors).map(([ key, error ]) => {
                    return (<Flex key={ key }>
                        <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-1'] }] }>
                            { error.label }
                        </FlexItem>
                        <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-2'] }] }>
                            <ExclamationCircleIcon className="error" /> { error.value }
                        </FlexItem>
                    </Flex>);
                })}
                <h3>Registration</h3>
                <Flex>
                    <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-1'] }] }>
                        Subscription
                    </FlexItem>
                    { !props.subscribeNow &&
                      <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-2'] }] }>
                          Register the system later
                      </FlexItem> }
                    { props.subscribeNow &&
                      <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-2'] }] }>
                          Register the system on first boot
                      </FlexItem> }
                </Flex>
                { Object.entries(props.subscriptionErrors).map(([ key, error ]) => {
                    return (<Flex key={ key }>
                        <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-1'] }] }>
                            { error.label }
                        </FlexItem>
                        <FlexItem breakpointMods={ [{ modifier: FlexModifiers['flex-2'] }] }>
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
                <section className="pf-c-page__main-section">
                    <Title size="2xl">
                        Create a new image
                    </Title>
                </section>
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
