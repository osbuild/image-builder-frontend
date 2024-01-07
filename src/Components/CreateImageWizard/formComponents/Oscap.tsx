import React, {FormEvent, useEffect, useState} from 'react';

import useFieldApi, {UseFieldApiConfig} from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
    Alert,
    FormGroup,
    Spinner,
    Popover,
    TextContent,
    Text,
    Button,
    Select,
    SelectOption,
    MenuToggleElement,
    TextInputGroup,
    TextInputGroupMain,
    MenuToggle,
    TextInputGroupUtilities,
    SelectOptionProps,
} from '@patternfly/react-core';
import { SelectVariant } from '@patternfly/react-core/deprecated'
import { HelpIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import  OscapProfileInformation   from './OscapProfileInformation';

import {
    DistributionProfileItem,
    useGetOscapCustomizationsQuery,
    useGetOscapProfilesQuery,
} from '../../../store/imageBuilderApi';
import { reinitFileSystemConfiguratioStep } from '../steps/fileSystemConfiguration';
import { reinitPackagesStep } from '../steps/packages';

/**
 * Every time there is change on this form step's state, reinitialise the steps
 * that are depending on it. This will ensure that if the user goes back and
 * change their mind, going forward again leaves them in a coherent and workable
 * form state.
 */
const reinitDependingSteps = (change: any) => {
    reinitFileSystemConfiguratioStep(change);
    reinitPackagesStep(change);
};

/**
 * Component for the user to select the profile to apply to their image.
 * The selected profile will be stored in the `oscap-profile` form state variable.
 * The Component is shown or not depending on the ShowSelector variable.
 */
const ProfileSelector =({ input }: { input: any }) => {
    const { change, getState } = useFormApi();
    const [profile, setProfile] = useState(getState()?.values?.['oscap-profile']);
    const [profileName, setProfileName] = useState<string | undefined>('');
    const [filterValue, setFilterValue] = React.useState<string>('');
    const [selected, setSelected] = React.useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [selectOptions, setSelectOptions] = React.useState<SelectOptionProps[]>([]);
    const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
    const [activeItem, setActiveItem] = React.useState<string | null>(null);
    const textInputRef = React.useRef<HTMLInputElement>();
    const {
        data: profiles,
        isFetching,
        isSuccess,
        isError,
        refetch,
    } = useGetOscapProfilesQuery({
        distribution: getState()?.values?.['release'],
    });

    const { data } = useGetOscapCustomizationsQuery(
        {
            distribution: getState()?.values?.['release'],
            profile: profile,
        },
        {
            skip: !profile,
        }
    );

    useEffect(() => {
        if (data && data.openscap && typeof data.openscap.profile_name === 'string') {
            setProfileName(data.openscap.profile_name);
        } else {
            setProfileName('');
        }
    }, [data]);

    const handleToggle = () => {
        if (!isOpen) {
            refetch();
        }
        setIsOpen(!isOpen);
    };

    const handleClear = () => {
        setProfile(undefined);
        change(input.name, undefined);
        setProfileName(undefined);
        reinitDependingSteps(change);
    };

    const handleSelect =(_: any, selection: string) => {
        setProfile(selection);
        setIsOpen(false);
        change(input.name, selection);
        reinitDependingSteps(change);
        change('file-system-config-radio', 'manual');
    };

    const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
        setInputValue(value);
        setFilterValue(value);
    };


    const handleMenuArrowKeys = (key: string) => {
        let indexToFocus;

        if (isOpen) {
            if (key === 'ArrowUp') {
                // When no index is set or at the first index, focus to the last, otherwise decrement focus index
                if (focusedItemIndex === null || focusedItemIndex === 0) {
                    indexToFocus = selectOptions.length - 1;
                } else {
                    indexToFocus = focusedItemIndex - 1;
                }
            }

            if (key === 'ArrowDown') {
                // When no index is set or at the last index, focus to the first, otherwise increment focus index
                if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
                    indexToFocus = 0;
                } else {
                    indexToFocus = focusedItemIndex + 1;
                }
            }

            setFocusedItemIndex(indexToFocus);
            const focusedItem = selectOptions.filter((option) => !option.isDisabled)[indexToFocus];
            setActiveItem(`select-typeahead-${focusedItem.value.replace(' ', '-')}`);
        }
    };


    const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const enabledMenuItems = selectOptions.filter((option) => !option.isDisabled);
        const [firstMenuItem] = enabledMenuItems;
        const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

        switch (event.key) {
            // Select the first available option
            case 'Enter':
                if (isOpen && focusedItem.value !== 'no results') {
                    setInputValue(String(focusedItem.children));
                    setFilterValue('');
                    setSelected(String(focusedItem.children));
                }

                setIsOpen((prevIsOpen) => !prevIsOpen);
                setFocusedItemIndex(null);
                setActiveItem(null);

                break;
            case 'Tab':
            case 'Escape':
                setIsOpen(false);
                setActiveItem(null);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                event.preventDefault();
                handleMenuArrowKeys(event.key);
                break;
        }
    };

    const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} variant="typeahead" onClick={handleToggle} isExpanded={isOpen} isFullWidth>
            <TextInputGroup isPlain>
                <TextInputGroupMain
                    value={inputValue}
                    onClick={handleToggle}
                    onChange={onTextInputChange}
                    onKeyDown={onInputKeyDown}
                    id="typeahead-select-input"
                    autoComplete="off"
                    innerRef={textInputRef}
                    placeholder="Select a state"
                    {...(activeItem && { 'aria-activedescendant': activeItem })}
                    role="combobox"
                    isExpanded={isOpen}
                    aria-controls="select-typeahead-listbox"
                />

                <TextInputGroupUtilities>
                    {!!inputValue && (
                        <Button
                            variant="plain"
                            onClick={() => {
                                setSelected('');
                                setInputValue('');
                                setFilterValue('');
                                textInputRef?.current?.focus();
                            }}
                            aria-label="Clear input value"
                        >
                        </Button>
                    )}
                </TextInputGroupUtilities>
            </TextInputGroup>
        </MenuToggle>
    );

                return (
        <FormGroup
            isRequired={true}
            data-testid="profiles-form-group"
            label={
                <>
                    OpenSCAP profile
                    <Popover
                        maxWidth="30rem"
                        position="left"
                        bodyContent={
                            <TextContent>
                                <Text>
                                    To run a manual compliance scan in OpenSCAP, download this
                                    image.
                                </Text>
                            </TextContent>
                        }
                    >
                        <Button variant="plain" aria-label="About OpenSCAP" isInline>
                            <HelpIcon />
                        </Button>
                    </Popover>
                </>
            }
        >

            <Select
                ouiaId="profileSelect"
               // variant={SelectVariant.typeahead}
                toggle={toggle}
                onSelect={handleSelect}
                onClear={handleClear}
                selections={profileName}
                isOpen={isOpen}
                placeholderText="Select a profile"
                typeAheadAriaLabel="Select a profile"
                isDisabled={!isSuccess}
                onFilter={(event: FormEvent<HTMLInputElement>, value: string) => {
                    return [
                        <OScapNoneOption setProfileName={setProfileName} key="oscap-none-option"/>,
                    ].concat(
                        profiles.map((profile_id: DistributionProfileItem, index: number) =>  {
                            return (
                                <OScapSelectOption
                                    key={index}
                                    profile_id={profile_id}
                                    setProfileName={setProfileName}
                                    input={value}
                                />
                            );
                        })
                    );
                }}
            >
                {isSuccess &&
                    [
                        <OScapNoneOption setProfileName={setProfileName} key="oscap-none-option"  />,
                    ].concat(
                        profiles.map((profile_id) => {
                            return (
                                <OScapSelectOption
                                    key={profile_id}
                                    profile_id={profile_id}
                                    setProfileName={setProfileName}
                                />
                            );
                        })
                    )}

                {isFetching && (
                    <SelectOption data-testid="policies-loading">
                        <Spinner size="md" />
                    </SelectOption>
                )}
            </Select>
            {isError && (
                <Alert
                    title="Error fetching the profiles"
                    variant="danger"
                    isPlain
                    isInline
                >
                    Cannot get the list of profiles
                </Alert>
            )}
        </FormGroup>
    );
};

const OScapNoneOption = ({ setProfileName }: { setProfileName: (name: string) => void }) => {
    return (
        <SelectOption
            value={undefined}
            onClick={() => {
                setProfileName('None');
            }}
        >
            <p>{'None'}</p>
        </SelectOption>
    );
};


const OScapSelectOption =  ({ profile_id, setProfileName, input }: { profile_id: DistributionProfileItem; setProfileName: (name: string)=> void; input?: string }) => {
    const { getState } = useFormApi();
    const { data } = useGetOscapCustomizationsQuery({
        distribution: getState()?.values?.['release'],
        profile: profile_id,
    });
    if (input) {
        const profileName = data?.openscap?.profile_name;
        if (profileName && !profileName.toLowerCase().includes(input.toLowerCase())) {
            return null;
        }
    }

    return (
        <SelectOption
            key={profile_id}
            value={profile_id}
            onClick={() => {
                setProfileName(data?.openscap?.profile_name || 'Default Value');
            }}
        >
            <p>{data?.openscap?.profile_name}</p>
        </SelectOption>
    );
};

/**
 * Component to prompt the use with two choices:
 * - to add a profile, in which case the ProfileSelector will allow the user to
 *   pick a profile to be stored in the `oscap-profile` variable.
 * - to not add a profile, in which case the `oscap-profile` form state goes
 *   undefined.
 */
const AddProfile =({ input }: { input: any }) => {
    return (
        <>
            <ProfileSelector input={input} />
            <OscapProfileInformation />
        </>
    );
};


interface OscapProps extends UseFieldApiConfig {

}

export const Oscap = (props: OscapProps) => {
    const { input } = useFieldApi(props);
    return <AddProfile input={input} />;
};
