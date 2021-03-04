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
                            nextButtonText = props.disable ? 'Creating...' : 'Create';
                        }

                        return (
                            <>
                                <Button aria-label={ activeStep.name === 'Review' ? 'Create' : 'Next' } variant={ ButtonVariant.primary }
                                    onClick={ onNext } isDisabled={ props.disable }>
                                    { nextButtonText }
                                </Button>
                                <Button aria-label="Back" variant={ ButtonVariant.secondary }
                                    onClick={ onBack } isDisabled={ props.disable || activeStep.name === 'Image output' }>
                                Back
                                </Button>
                                <Button aria-label="Cancel" variant={ ButtonVariant.link }
                                    onClick={ onClose } isDisabled={ props.disable }>
                                Cancel
                                </Button>
                            </>);}}
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
    disable: PropTypes.bool,
    error: PropTypes.string,
};

export default ImageWizardFooter;
