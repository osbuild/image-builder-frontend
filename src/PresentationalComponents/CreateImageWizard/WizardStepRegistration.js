import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, TextInput, Radio, Title } from '@patternfly/react-core';

const WizardStepRegistration = (props) => {
    return (
        <Form>
            <Title headingLevel="h2" size="xl">Registration</Title>
            <FormGroup isRequired label="Register the system">
                <Radio name="subscribe-now-radio" isChecked={ props.subscribeNow } id="subscribe-now-radio"
                    label="Embed an activation key and register systems on first boot"
                    onChange={ () => props.setSubscribeNow(true) }
                    data-testid="register-now-radio-button" />
                <Radio name="subscribe-later-radio" isChecked={ !props.subscribeNow }
                    label="Register the system later" id="subscribe-later-radio"
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

WizardStepRegistration.propTypes = {
    setSubscription: PropTypes.func,
    setSubscribeNow: PropTypes.func,
    subscription: PropTypes.object,
    subscribeNow: PropTypes.bool,
    errors: PropTypes.object,
};

export default WizardStepRegistration;
