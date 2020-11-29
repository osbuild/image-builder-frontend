import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, FormSelect, TextInput, FormSelectOption, Title } from '@patternfly/react-core';

const WizardStepUploadAWS = (props) => {
    const serviceOptions = [
        { value: 'ec2', label: 'Amazon Elastic Compute Cloud (ec2)' },
        { value: 's3', label: 'Amazon Simple Storage Service (s3)' },
    ];

    return (
        <Form>
            <Title headingLevel="h2" size="xl">Upload to AWS</Title>
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
        </Form>
    );
};

WizardStepUploadAWS.propTypes = {
    setUploadOptions: PropTypes.func,
    upload: PropTypes.object,
    errors: PropTypes.object,
};

export default WizardStepUploadAWS;
