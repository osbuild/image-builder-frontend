import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions } from '../../store/actions';

import { Form, FormGroup, TextList, TextListItem, Popover, Radio, TextContent, Text, TextInput, Title } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import './WizardStepUploadGoogle.scss';

const accountTypePopover = (
    <Popover
        hasAutoWidth
        maxWidth='35rem'
        headerContent={ 'Valid account types' }
        bodyContent={ <TextContent>
            <Text>The following account types can have an image shared with them:</Text>
            <TextList>
                <TextListItem>
                    <strong>Google account:</strong> A Google account represents a developer, an administrator,
                        or any other person who interacts with Google Cloud. e.g., <em>`alice@gmail.com`</em>.
                </TextListItem>
                <TextListItem>
                    <strong>Service account:</strong> A service account is an account for an application instead
                        of an individual end user. e.g., <em>`myapp@appspot.gserviceaccount.com`</em>.
                </TextListItem>
                <TextListItem>
                    <strong>Google group:</strong> A Google group is a named collection of Google accounts and
                        and service accounts. e.g., <em>`admins@example.com`</em>.
                </TextListItem>
                <TextListItem>
                    <strong>Google workspace domain/Cloud identity domain:</strong> A Google workspace or cloud identity
                        domain represents a virtual group of all the Google accounts in an organization. These domains
                        represent your organization&apos;s internet domain name. e.g., <em>`mycompany.com`</em>.
                </TextListItem>
            </TextList>
        </TextContent> }>
        <button
            type="button"
            aria-label="Account info"
            aria-describedby="google-account-type"
            className="pf-c-form__group-label-help">
            <HelpIcon />
        </button>
    </Popover>
);

class WizardStepUploadGoogle extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <TextContent className="textcontent-google">
                    <Title headingLevel="h2" size="xl">Target Environment - Google Cloud Platform</Title>
                    <Text>
                        Your image will be uploaded to Google Cloud Platform and shared with the email you provide below. <br />
                        The image should be copied to your account within 14 days.
                    </Text>
                </TextContent>
                <Form isWidthLimited>
                    <FormGroup isRequired label="Type" labelIcon={ accountTypePopover } fieldId="google-account-type">
                        <Radio
                            onChange={ () => this.props.setUploadGoogle({ accountType: 'googleAccount', shareWithAccounts: [{ user: null }]}) }
                            isChecked={ this.props.uploadGoogle.accountType === 'googleAccount' }
                            label="Google account"
                            id="radio-google-account"
                            value="googleAccount" />
                        <Radio
                            onChange={ () =>
                                this.props.setUploadGoogle({ accountType: 'serviceAccount', shareWithAccounts: [{ serviceAccount: null }]}) }
                            isChecked={ this.props.uploadGoogle.accountType === 'serviceAccount' }
                            label="Service account"
                            id="radio-service-account"
                            value="serviceAccount" />
                        <Radio
                            onChange={ () => this.props.setUploadGoogle({ accountType: 'googleGroup', shareWithAccounts: [{ group: null }]}) }
                            isChecked={ this.props.uploadGoogle.accountType === 'googleGroup' }
                            label="Google group"
                            id="radio-google-group"
                            value="googleGroup" />
                        <Radio
                            onChange={ () => this.props.setUploadGoogle({ accountType: 'domain', shareWithAccounts: [{ domain: null }]}) }
                            isChecked={ this.props.uploadGoogle.accountType === 'domain' }
                            label="Google Workspace Domain or Cloud Identity Domain"
                            id="radio-domain"
                            value="domain" />
                    </FormGroup>
                    {this.props.uploadGoogle.accountType === 'googleAccount' && (
                        <FormGroup isRequired label="Email address" fieldId="user">
                            <TextInput
                                value={ this.props.uploadGoogle.shareWithAccounts[0] ?
                                    this.props.uploadGoogle.shareWithAccounts[0].user || '' :
                                    '' }
                                type="text" aria-label="Google email address" id="input-google-user"
                                data-testid="input-google-user" isRequired
                                onChange={ value => this.props.setUploadGoogle(
                                    { accountType: 'googleAccount', shareWithAccounts: [{ user: value }]}
                                ) } />
                        </FormGroup>
                    )}
                    {this.props.uploadGoogle.accountType === 'serviceAccount' && (
                        <FormGroup isRequired label="Email address" fieldId="service-account">
                            <TextInput
                                value={ this.props.uploadGoogle.shareWithAccounts[0] ?
                                    this.props.uploadGoogle.shareWithAccounts[0].serviceAccount || '' :
                                    '' }
                                type="text" aria-label="Google email address" id="input-google-service-account"
                                data-testid="input-google-service-account" isRequired
                                onChange={ value => this.props.setUploadGoogle(
                                    { accountType: 'serviceAccount', shareWithAccounts: [{ serviceAccount: value }]}
                                ) } />
                        </FormGroup>
                    )}
                    {this.props.uploadGoogle.accountType === 'googleGroup' && (
                        <FormGroup isRequired label="Email address" fieldId="group">
                            <TextInput
                                value={ this.props.uploadGoogle.shareWithAccounts[0] ?
                                    this.props.uploadGoogle.shareWithAccounts[0].group || '' :
                                    '' }
                                type="text" aria-label="Google email address" id="input-google-group"
                                data-testid="input-google-group" isRequired
                                onChange={ value => this.props.setUploadGoogle(
                                    { accountType: 'googleGroup', shareWithAccounts: [{ group: value }]}
                                ) } />
                        </FormGroup>
                    )}
                    {this.props.uploadGoogle.accountType === 'domain' && (
                        <FormGroup isRequired label="Domain" fieldId="domain">
                            <TextInput
                                value={ this.props.uploadGoogle.shareWithAccounts[0] ?
                                    this.props.uploadGoogle.shareWithAccounts[0].domain || '' :
                                    '' }
                                type="text" aria-label="Google domain" id="input-google-domain"
                                data-testid="input-google-domain" isRequired
                                onChange={ value => this.props.setUploadGoogle(
                                    { accountType: 'domain', shareWithAccounts: [{ domain: value }]}
                                ) } />
                        </FormGroup>
                    )}
                </Form>
            </>
        );
    }
};

function mapStateToProps(state) {
    return {
        uploadGoogle: state.pendingCompose.uploadGoogle,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setUploadGoogle: u => dispatch(actions.setUploadGoogle(u)),
    };
}

WizardStepUploadGoogle.propTypes = {
    setUploadGoogle: PropTypes.func,
    uploadGoogle: PropTypes.object,
    errors: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardStepUploadGoogle);
