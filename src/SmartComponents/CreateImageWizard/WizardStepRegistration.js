import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, FormGroup, TextInput, Radio, Title } from '@patternfly/react-core';

import { actions } from '../../store/actions';

class WizardStepRegistration extends Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {
        let user = await insights.chrome.auth.getUser();
        this.props.setSubscription(Object.assign(this.props.subscription, { organization: user.identity.internal.org_id }));
    }

    render() {
        return (
            <Form>
                <Title headingLevel="h2" size="xl">Registration</Title>
                <FormGroup isRequired label="Register the system">
                    <Radio name="subscribe-now-radio" isChecked={ this.props.subscribeNow } id="subscribe-now-radio"
                        label="Embed an activation key and register systems on first boot"
                        onChange={ () => this.props.setSubscribeNow(true) }
                        data-testid="register-now-radio-button" />
                    <Radio name="subscribe-later-radio" isChecked={ !this.props.subscribeNow }
                        label="Register the system later" id="subscribe-later-radio"
                        onChange={ () => this.props.setSubscribeNow(false) }
                        data-testid="register-later-radio-button" />
                </FormGroup>
                { this.props.subscribeNow &&
                <>
                    <FormGroup label="Organization ID" fieldId="subscription-organization">
                        <TextInput isDisabled value={ this.props.subscription.organization || '' } type="text"
                            id="subscription-organization" aria-label="Subscription organization ID"
                            data-testid="organization-id" />
                    </FormGroup>
                    <FormGroup isRequired label="Activation key" fieldId="subscription-activation"
                        helperTextInvalid={ 'A value is required' }
                        validated={ !this.props.isValidSubscription && this.props.subscription.activationKey !== null ? 'error' : 'default' }>
                        <TextInput
                            value={ this.props.subscription.activationKey || '' }
                            type="password"
                            data-testid="subscription-activation"
                            id="subscription-activation"
                            aria-label="Subscription activation key"
                            onChange={ activationKey => this.props.setSubscription(Object.assign(this.props.subscription, { activationKey })) }
                            validated={ !this.props.isValidSubscription && this.props.subscription.activationKey !== null ? 'error' : 'default' }
                            isRequired />
                    </FormGroup>
                </> }
            </Form>
        );
    }
};

function mapStateToProps(state) {
    return {
        subscription: state.pendingCompose.subscription,
        subscribeNow: state.pendingCompose.subscribeNow,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setSubscription: s => dispatch(actions.setSubscription(s)),
        setSubscribeNow: s => dispatch(actions.setSubscribeNow(s)),
    };
}

WizardStepRegistration.propTypes = {
    setSubscription: PropTypes.func,
    setSubscribeNow: PropTypes.func,
    subscription: PropTypes.object,
    subscribeNow: PropTypes.bool,
    isValidSubscription: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardStepRegistration);
