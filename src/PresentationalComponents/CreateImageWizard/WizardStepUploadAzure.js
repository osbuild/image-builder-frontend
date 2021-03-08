import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, Text, TextContent, TextInput, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import './WizardStepUploadAzure.scss';

const WizardStepUploadAzure = (props) => {
    return (
        <>
            <TextContent className="textcontent-azure">
                <Title headingLevel="h2">Target Environment - Upload to Azure</Title>
                <Text>
            Image Builder will send an image to an authorized Azure account.
                </Text>
                <Title headingLevel="h3">OAuth permissions</Title>
                <Text>
            In order to use Image Builder to push images to Azure, Image Builder must
            be configured as an authorized application, and given the role of &quot;Contributor&quot; to at least one resource group.<br />
            Image Builder must be authorized by an account owner.<br />
                    <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow">
                        <small>Learn more</small></a>
                </Text>

                <a href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=b94bb246-b02c-4985-9c22-d44e66f657f4
&scope=openid&response_type=code&response_mode=form_post
&redirect_uri=https%3A%2F%2Flogin.microsoftonline.com%2Fcommon%2Foauth2%2Fnativeclient" target="_blank" rel="noopener noreferrer">
            Authorize Image Builder on Azure <ExternalLinkAltIcon />
                </a>
            </TextContent>

            <Title headingLevel="h3">Destination</Title>
            <Text>
            Your image will be uploaded to the resource group in the subscription you specify.
            </Text>
            <Form>
                <FormGroup isRequired label="Tenant ID" fieldId="azure-tenant-id"
                    helperTextInvalid={ (props.errors['azure-tenant-id'] && props.errors['azure-tenant-id'].value) || '' }
                    validated={ (props.errors['azure-tenant-id'] && 'error') || 'default' }>
                    <TextInput value={ props.uploadAzure.options.tenant_id || '' }
                        type="text" aria-label="Azure tenant-id" id="azure-tenant-id"
                        data-testid="azure-tenant-id" isRequired
                        onChange={ value =>
                            props.setUploadOptions('azure', Object.assign(props.uploadAzure.options, { tenant_id: value })) } />
                </FormGroup>
                <FormGroup isRequired label="Subscription ID" fieldId="azure-subscription-id"
                    helperTextInvalid={ (props.errors['azure-subscription-id'] &&
                             props.errors['azure-subscription-id'].value) || '' }
                    validated={ (props.errors['azure-subscription-id'] && 'error') || 'default' }>
                    <TextInput value={ props.uploadAzure.options.subscription_id || '' }
                        type="text" aria-label="Azure subscription-id" id="azure-subscription-id"
                        data-testid="azure-subscription-id" isRequired
                        onChange={ value =>
                            props.setUploadOptions('azure', Object.assign(props.uploadAzure.options, { subscription_id: value })) } />
                </FormGroup>
                <FormGroup isRequired label="Resource group" fieldId="azure-resource-group"
                    helperTextInvalid={ (props.errors['azure-resource-group'] &&
                             props.errors['azure-resource-group'].value) || '' }
                    validated={ (props.errors['azure-resource-group'] && 'error') || 'default' }>
                    <TextInput value={ props.uploadAzure.options.resource_group || '' }
                        type="text" aria-label="Azure resource group" id="azure-resource-group"
                        data-testid="azure-resource-group" isRequired
                        onChange={ value =>
                            props.setUploadOptions('azure', Object.assign(props.uploadAzure.options, { resource_group: value })) } />
                </FormGroup>
            </Form>
        </>
    );
};

WizardStepUploadAzure.propTypes = {
    setUploadOptions: PropTypes.func,
    uploadAzure: PropTypes.object,
    errors: PropTypes.object,
};

export default WizardStepUploadAzure;
