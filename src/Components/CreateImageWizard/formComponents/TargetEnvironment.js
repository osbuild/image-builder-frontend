import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import { FormGroup, Tile } from '@patternfly/react-core';
import './TargetEnvironment.scss';

const TargetEnvironment = ({ label, isRequired, ...props }) => {
    const { getState, change } = useFormApi();
    const { input } = useFieldApi({ label, isRequired, ...props });
    const [ environemt, setEnvironment ] = useState({
        aws: false,
        azure: false,
        google: false,
    });

    useEffect(() => {
        if (getState()?.values?.[input.name]) {
            setEnvironment(getState().values[input.name]);
        }
    }, []);

    return <FormGroup isRequired={ isRequired } label={ label } data-testid="target-select">
        <div className="tiles">
            <Tile
                className="tile pf-u-mr-sm"
                data-testid="upload-aws"
                title="Amazon Web Services"
                icon={ <img
                    className='provider-icon'
                    src={ '/apps/frontend-assets/partners-icons/aws.svg' } /> }
                onClick={ () => setEnvironment((prevEnv) => {
                    const newEnv = ({
                        ...prevEnv,
                        aws: !prevEnv.aws
                    });
                    change(input.name, newEnv);
                    return newEnv;
                }) }
                isSelected={ environemt.aws }
                isStacked
                isDisplayLarge />
            <Tile
                className="tile pf-u-mr-sm"
                data-testid="upload-azure"
                title="Microsoft Azure"
                icon={ <img
                    className='provider-icon'
                    src={ '/apps/frontend-assets/partners-icons/microsoft-azure-short.svg' } /> }
                onClick={ () => setEnvironment((prevEnv) => {
                    const newEnv = ({
                        ...prevEnv,
                        azure: !prevEnv.azure
                    });
                    input.value = newEnv;
                    change(input.name, newEnv);
                    return newEnv;
                }) }
                isSelected={ environemt.azure }
                isStacked
                isDisplayLarge />
            <Tile
                className="tile"
                data-testid="upload-google"
                title="Google Cloud Platform"
                icon={ <img
                    className='provider-icon'
                    src={ '/apps/frontend-assets/partners-icons/google-cloud-short.svg' } /> }
                onClick={ () => setEnvironment((prevEnv) => {
                    const newEnv = ({
                        ...prevEnv,
                        google: !prevEnv.google
                    });
                    change(input.name, newEnv);
                    return newEnv;
                }) }
                isSelected={ environemt.google }
                isStacked
                isDisplayLarge />
        </div>
    </FormGroup>;
};

TargetEnvironment.propTypes = {
    label: PropTypes.node,
    isRequired: PropTypes.bool
};

TargetEnvironment.defaultProps = {
    label: '',
    isRequired: false
};

export default TargetEnvironment;
