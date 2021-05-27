import React from 'react';
import ImageCreator from './ImageCreator';
import { useHistory } from 'react-router-dom';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

const CreateImage = () => {
    const history = useHistory();
    return <ImageCreator
        onClose={ () => history.push('/landing') }
        onSubmit={ (values) => console.log(values) }
        schema={ {
            fields: [
                {
                    component: componentTypes.WIZARD,
                    name: 'image-builder-wizard',
                    isDynamic: true,
                    inModal: true,
                    showTitles: true,
                    title: 'Create image',
                    crossroads: [ 'role-type' ],
                    description: <div>Create a RHEL image and push it to cloud providers.<a>link</a></div>,
                    fields: [
                        {
                            title: 'Image output',
                            name: 'step-1',
                            nextStep: {
                                when: 'role-type',
                                stepMapper: {
                                    a: 'aws-target-env',
                                    ab: 'aws-target-env',
                                    undefined: 'registration'
                                },
                            },
                            fields: [
                                {
                                    component: componentTypes.TEXT_FIELD,
                                    name: 'role-type',
                                    type: 'text',
                                    label: 'Role name',
                                    isRequired: true,
                                    validate: [
                                        {
                                            type: validatorTypes.REQUIRED
                                        }
                                    ],
                                }
                            ]
                        },
                        {
                            title: 'Amazon Web Services',
                            name: 'aws-target-env',
                            substepOf: 'Target environment',
                            nextStep: {
                                when: 'role-type',
                                stepMapper: {
                                    ab: 'ms-azure-target-env',
                                    a: 'registration'
                                },
                            },
                            fields: [
                                {
                                    component: componentTypes.TEXT_FIELD,
                                    name: 'test-field',
                                    type: 'text',
                                    label: 'Role name',
                                    isRequired: true,
                                    validate: [
                                        {
                                            type: validatorTypes.REQUIRED,
                                        },
                                    ],
                                }
                            ]
                        },
                        {
                            title: 'Microsoft Azure',
                            label: 'bla bla',
                            name: 'ms-azure-target-env',
                            substepOf: 'Target environment',
                            nextStep: 'registration',
                            fields: [
                                {
                                    component: componentTypes.TEXT_FIELD,
                                    name: 'test-field',
                                    type: 'text',
                                    label: 'Role name',
                                    isRequired: true,
                                    validate: [
                                        {
                                            type: validatorTypes.REQUIRED,
                                        },
                                    ],
                                }
                            ]
                        },
                        {
                            title: 'Registration',
                            name: 'registration',
                            fields: [
                                {
                                    component: componentTypes.TEXT_FIELD,
                                    name: 'another-field',
                                    type: 'text',
                                    label: 'Role name',
                                    isRequired: true,
                                    validate: [
                                        {
                                            type: validatorTypes.REQUIRED,
                                        },
                                        {
                                            type: validatorTypes.MAX_LENGTH,
                                            threshold: 150,
                                        },
                                    ],
                                }
                            ]
                        }
                    ]
                }
            ]
        } } />;
};

export default CreateImage;
