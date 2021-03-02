import React from 'react';
import PropTypes from 'prop-types';

import { Button, ButtonVariant, Text, TextContent, WizardContextConsumer, WizardFooter } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import './ImageWizardFooter.scss';

const ImageWizardFooter = (props) => {
    return (
        <>
            <WizardFooter>
                <WizardContextConsumer>
                    {({ activeStep, onNext, onBack, onClose }) => {
                        let nextButtonText = 'Next';
                        if (activeStep.name === 'Review') {
                            nextButtonText = props.isSaveInProgress ? 'Creating...' : 'Create';
                        }

                        let nextButtonIsDisabled = props.isSaveInProgress;

                        if ((activeStep.name === 'Image output' || activeStep.name === 'Review') && !props.isValidUploadDestination) {
                            nextButtonIsDisabled = true;
                        }

                        return (
                            <>
                                <Button aria-label={ activeStep.name === 'Review' ? 'Create' : 'Next' } variant={ ButtonVariant.primary }
                                    onClick={ onNext } isDisabled={ nextButtonIsDisabled }>
                                    { nextButtonText }
                                </Button>
                                <Button aria-label="Back" variant={ ButtonVariant.secondary }
                                    onClick={ onBack } isDisabled={ props.isSaveInProgress || activeStep.name === 'Image output' }>
                                Back
                                </Button>
                                <Button aria-label="Cancel" variant={ ButtonVariant.link }
                                    onClick={ onClose } isDisabled={ props.isSaveInProgress }>
                                Cancel
                                </Button>
                            </>
                        );
                    }}
                </WizardContextConsumer>
                { props.error && (
                    <TextContent className="footer-error">
                        <Text><ExclamationCircleIcon /> <strong>{props.error}</strong></Text>
                    </TextContent>
                )}
            </WizardFooter>
        </>
    );
};

ImageWizardFooter.propTypes = {
    isValidUploadDestination: PropTypes.bool,
    isSaveInProgress: PropTypes.bool,
    error: PropTypes.string,
};

export default ImageWizardFooter;
