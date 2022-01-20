import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Spinner, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import api from '../../../api';

const ActivationKeys = ({ label, isRequired }) => {
    const { change } = useFormApi();
    const [ activationKeys, setActivationKeys ] = useState([]);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ activationKeySelected, selectActivationKey ] = useState();

    useEffect(() => {
        setIsLoading(true);
        const data = api.getActivationKeys();
        data.then(keys => {
            setActivationKeys(keys);
            setIsLoading(false);
        });
    }, []);

    const setActivationKey = (_, selection) => {
        selectActivationKey(selection);
        setIsOpen(false);
        change('subscription-activation-key', selection);
    };

    const handleClear = () => {
        selectActivationKey();
        change('subscription-activation-key', undefined);
    };

    return (
        <FormGroup isRequired={ isRequired } label={ label } data-testid='subscription-activation-key'>
            <Select
                variant={ SelectVariant.typeahead }
                onToggle={ () => setIsOpen(!isOpen) }
                onSelect={ setActivationKey }
                onClear={ handleClear }
                selections={ activationKeySelected }
                isOpen={ isOpen }
                placeholderText="Select activation key"
                typeAheadAriaLabel="Select activation key">
                {isLoading &&
                    <SelectOption isNoResultsOption={ true } data-testid='activation-keys-loading'>
                        <Spinner isSVG size="lg" />
                    </SelectOption>
                }
                {activationKeys.map((key, index) => (
                    <SelectOption
                        key={ index }
                        value={ key.name } />
                ))}
            </Select>
        </FormGroup>);
};

ActivationKeys.propTypes = {
    label: PropTypes.node,
    isRequired: PropTypes.bool
};

ActivationKeys.defaultProps = {
    label: '',
    isRequired: false
};

export default ActivationKeys;
