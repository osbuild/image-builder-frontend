import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

const WizardStepUploadAWS = (props) => {
    return (
        <Form>
            <Title headingLevel="h2" size="xl">Target Environment - Upload to AWS</Title>
            <p>
            Your image will be uploaded to a temporary account on Amazon Web Services. <br />
            The image will be shared with the account you provide below. <br />
            Within the next 14 days you will need to copy the shared image to your own account.
            After 14 days it will be unavailable and will have to be regenerated.
            </p>
            <FormGroup isRequired label="AWS account ID" fieldId="aws-account-id"
                helperTextInvalid={ (props.errors['aws-account-id'] && props.errors['aws-account-id'].value) || '' }
                validated={ (props.errors['aws-account-id'] && 'error') || 'default' }>
                <TextInput value={ props.uploadAWS.options.share_with_accounts || '' }
                    type="text" aria-label="AWS account ID" id="aws-account-id"
                    data-testid="aws-account-id" isRequired
                    onChange={ value =>
                        props.setUploadOptions('aws', Object.assign(props.uploadAWS.options, { share_with_accounts: [ value ]})) } />
            </FormGroup>
        </Form>
    );
};

WizardStepUploadAWS.propTypes = {
    setUploadOptions: PropTypes.func,
    uploadAWS: PropTypes.object,
    errors: PropTypes.object,
};

export default WizardStepUploadAWS;
