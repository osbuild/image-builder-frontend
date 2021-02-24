import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, FormSelect, FormSelectOption, Tile, Title } from '@patternfly/react-core';

import './WizardStepImageOutput.scss';

const WizardStepImageOutput = (props) => {
    const releaseOptions = [
        { value: 'rhel-8', label: 'Red Hat Enterprise Linux (RHEL) 8.3' },
        { value: 'centos-8', label: 'CentOS Stream 8' },
    ];

    return (
        <>
            <Form>
                <Title headingLevel="h2" size="xl">Image output</Title>
                <FormGroup isRequired label="Release" fieldId="release-select">
                    <FormSelect value={ props.value } onChange={ value => props.setRelease(value) } isRequired
                        aria-label="Select release input" id="release-select" data-testid="release-select">
                        { releaseOptions.map(option => <FormSelectOption key={ option.value } value={ option.value } label={ option.label } />) }
                    </FormSelect>
                </FormGroup>
                <FormGroup isRequired label="Select target environment" data-testid="target-select">
                    <div className="tiles">
                        <Tile
                            className="tile pf-u-mr-sm"
                            data-testid="upload-aws"
                            title="Amazon Web Services"
                            icon={ <img
                                className='provider-icon'
                                src={ '/apps/frontend-assets/partners-icons/aws.svg' } /> }
                            onClick={ () => props.toggleUploadDestination('aws') }
                            isSelected={ props.uploadDestinations.aws }
                            isStacked
                            isDisplayLarge />
                        <Tile
                            className="tile pf-u-mr-sm"
                            data-testid="upload-azure"
                            title="Microsoft Azure"
                            icon={ <img
                                className='provider-icon'
                                src={ '/apps/frontend-assets/partners-icons/microsoft-azure-short.svg' } /> }
                            onClick={ () => props.toggleUploadDestination('azure') }
                            isSelected={ props.uploadDestinations.azure }
                            isStacked
                            isDisplayLarge />
                        <Tile
                            className="tile"
                            data-testid="upload-google"
                            title="Google Cloud Platform"
                            icon={ <img
                                className='provider-icon'
                                src={ '/apps/frontend-assets/partners-icons/google-cloud-short.svg' } /> }
                            onClick={ () => props.toggleUploadDestination('google') }
                            isSelected={ props.uploadDestinations.google }
                            isStacked
                            isDisplayLarge />
                    </div>
                </FormGroup>
            </Form>
        </>
    );
};

WizardStepImageOutput.propTypes = {
    toggleUploadAWS: PropTypes.func,
    uploadDestinations: PropTypes.object,
    setRelease: PropTypes.func,
    value: PropTypes.string,
    toggleUploadDestination: PropTypes.func,
};

export default WizardStepImageOutput;
