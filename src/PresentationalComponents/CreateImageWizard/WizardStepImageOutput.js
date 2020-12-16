import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, FormSelect, FormSelectOption, Title } from '@patternfly/react-core';

const WizardStepImageOutput = (props) => {
    const releaseOptions = [
        { value: 'rhel-8', label: 'Red Hat Enterprise Linux (RHEL) 8.3' },
    ];
    const uploadOptions = [
        { value: 'aws', label: 'Amazon Web Services' },
    ];
    return (
        <Form>
            <Title headingLevel="h2" size="xl">Image output</Title>
            <FormGroup isRequired label="Release" fieldId="release-select">
                <FormSelect value={ props.value } onChange={ value => props.setRelease(value) } isRequired
                    aria-label="Select release input" id="release-select" data-testid="release-select">
                    { releaseOptions.map(option => <FormSelectOption key={ option.value } value={ option.value } label={ option.label } />) }
                </FormSelect>
            </FormGroup>
            <FormGroup isRequired label="Target environment" fieldId="upload-destination">
                <FormSelect value={ props.upload.type || '' } id="upload-destination"
                    data-testid="upload-destination" isRequired
                    onChange={ value => props.setUpload({ type: value, options: props.upload.options }) } aria-label="Select upload destination">
                    { uploadOptions.map(option => <FormSelectOption key={ option.value } value={ option.value } label={ option.label } />) }
                </FormSelect>
            </FormGroup>
        </Form>
    );
};

WizardStepImageOutput.propTypes = {
    setRelease: PropTypes.func,
    value: PropTypes.string,
    upload: PropTypes.object,
    setUpload: PropTypes.func,
};

export default WizardStepImageOutput;
