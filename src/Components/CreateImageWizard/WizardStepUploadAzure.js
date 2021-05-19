import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions } from '../../store/actions';

import { Form, FormGroup, Text, TextContent, TextInput, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import './WizardStepUploadAzure.scss';

class WizardStepUploadAzure extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <TextContent className="textcontent-azure">
                    <Title headingLevel="h2">Target Environment - Microsoft Azure</Title>
                    <Text>
            Image Builder will send an image to an authorized Azure account.
                    </Text>
                    <Title headingLevel="h3">OAuth permissions</Title>
                    <Text>
            To authorize Image Builder to push images to Microsoft Azure, the account owner
            must configure Image Builder as an authorized application and give it the role of
            &quot;Contributor&quot; to at least one resource group.<br />
                        <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow">
                            <small>Learn more about OAuth 2.0</small></a>
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
                        helperTextInvalid={ (this.props.errors['azure-tenant-id'] && this.props.errors['azure-tenant-id'].value) || '' }
                        validated={ (this.props.errors['azure-tenant-id'] && 'error') || 'default' }>
                        <TextInput value={ this.props.uploadAzure.tenantId || '' }
                            type="text" aria-label="Azure tenant-id" id="azure-tenant-id"
                            data-testid="azure-tenant-id" isRequired
                            onChange={ value =>
                                this.props.setUploadAzure(Object.assign(this.props.uploadAzure, { tenantId: value })) } />
                    </FormGroup>
                    <FormGroup isRequired label="Subscription ID" fieldId="azure-subscription-id"
                        helperTextInvalid={ (this.props.errors['azure-subscription-id'] &&
                             this.props.errors['azure-subscription-id'].value) || '' }
                        validated={ (this.props.errors['azure-subscription-id'] && 'error') || 'default' }>
                        <TextInput value={ this.props.uploadAzure.subscriptionId || '' }
                            type="text" aria-label="Azure subscription-id" id="azure-subscription-id"
                            data-testid="azure-subscription-id" isRequired
                            onChange={ value =>
                                this.props.setUploadAzure(Object.assign(this.props.uploadAzure, { subscriptionId: value })) } />
                    </FormGroup>
                    <FormGroup isRequired label="Resource group" fieldId="azure-resource-group"
                        helperTextInvalid={ (this.props.errors['azure-resource-group'] &&
                             this.props.errors['azure-resource-group'].value) || '' }
                        validated={ (this.props.errors['azure-resource-group'] && 'error') || 'default' }>
                        <TextInput value={ this.props.uploadAzure.resourceGroup || '' }
                            type="text" aria-label="Azure resource group" id="azure-resource-group"
                            data-testid="azure-resource-group" isRequired
                            onChange={ value =>
                                this.props.setUploadAzure(Object.assign(this.props.uploadAzure, { resourceGroup: value })) } />
                    </FormGroup>
                </Form>
            </>
        );
    }
};

function mapStateToProps(state) {
    return {
        uploadAzure: state.pendingCompose.uploadAzure,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setUploadAzure: u => dispatch(actions.setUploadAzure(u)),
    };
}

WizardStepUploadAzure.propTypes = {
    setUploadAzure: PropTypes.func,
    uploadAzure: PropTypes.object,
    errors: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardStepUploadAzure);
