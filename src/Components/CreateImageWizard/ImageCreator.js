import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import Pf4FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import { componentMapper } from '@data-driven-forms/pf4-component-mapper';
import { Spinner } from '@patternfly/react-core';
import Review from './formComponents/ReviewStep';
import PropTypes from 'prop-types';

const CreateImageWizard = ({ schema, onSubmit, onClose, customComponentMapper }) => {
    return schema ? <FormRenderer
        schema={ schema }
        subscription={ { values: true } }
        FormTemplate={ (props) => <Pf4FormTemplate { ...props } showFormControls={ false } /> }
        onSubmit={ (formValues) => onSubmit(formValues) }
        componentMapper={ {
            ...componentMapper,
            review: Review,
            ...customComponentMapper
        } }
        onCancel={ onClose } /> : <Spinner />;
};

CreateImageWizard.propTypes = {
    schema: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    customComponentMapper: PropTypes.shape({
        [PropTypes.string]: PropTypes.oneOfType([ PropTypes.node, PropTypes.shape({
            component: PropTypes.node
        }) ])
    })
};

export default CreateImageWizard;
