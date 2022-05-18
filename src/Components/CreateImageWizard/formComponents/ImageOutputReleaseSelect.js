import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import { RELEASES } from '../../../constants';
import isRhel from '../../../Utilities/isRhel';

const ImageOutputReleaseSelect = ({ label, isRequired, ...props }) => {
    const { change, getState } = useFormApi();
    const { input } = useFieldApi(props);
    const [ isOpen, setIsOpen ] = useState(false);

    const setRelease = (_, selection) => {
        change(input.name, selection);
        setIsOpen(false);
    };

    const handleClear = () => {
        change(input.name, null);
    };

    return (
        <FormGroup isRequired={ isRequired } label={ label }>
            <Select
                variant={ SelectVariant.single }
                onToggle={ () => setIsOpen(!isOpen) }
                onSelect={ setRelease }
                onClear={ handleClear }
                selections={ RELEASES[getState()?.values?.[input.name]] }
                isOpen={ isOpen }>
                {
                    Object.entries(RELEASES)
                        .filter(([ key ]) => {
                            // Only show non-RHEL distros in beta
                            if (insights.chrome.isBeta()) {
                                return true;
                            }

                            return isRhel(key);
                        })
                        .map(([ key, release ], index) => {
                            return <SelectOption key={ index } value={ key }>
                                { release }
                            </SelectOption>;
                        })
                }
            </Select>
        </FormGroup>
    );
};

ImageOutputReleaseSelect.propTypes = {
    label: PropTypes.node,
    isRequired: PropTypes.bool
};

export default ImageOutputReleaseSelect;
