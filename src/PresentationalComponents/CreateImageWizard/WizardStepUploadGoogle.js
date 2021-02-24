import React from 'react';
import PropTypes from 'prop-types';

import { Form, FormGroup, TextList, TextListItem, Popover, Radio, TextContent, Text, TextInput, Title } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const WizardStepUploadGoogle = (props) => {
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

    return (
        <Form>
            <Title headingLevel="h2" size="xl">Target Environment - Google Cloud Platform</Title>
            <p>
            Your image will be uploaded to an account on Google Cloud Platform. <br />
            The image will be shared with the email you provide below. <br />
            Within the next 14 days you will need to copy the shared image to your own account.
            After 14 days it will be unavailable and will have to be regenerated.
            </p>
            <FormGroup isRequired label="Type" labelIcon={ accountTypePopover } fieldId="google-account-type">
                <Radio
                    onChange={ props.setGoogleAccountType }
                    isChecked={ props.uploadGoogle.accountType === 'googleAccount' }
                    label="Google account"
                    id="radio-google-account"
                    test-id
                    value="googleAccount" />
                <Radio
                    onChange={ props.setGoogleAccountType }
                    isChecked={ props.uploadGoogle.accountType === 'serviceAccount' }
                    label="Service account"
                    id="radio-service-account"
                    value="serviceAccount" />
                <Radio
                    onChange={ props.setGoogleAccountType }
                    isChecked={ props.uploadGoogle.accountType === 'googleGroup' }
                    label="Google group"
                    id="radio-google-group"
                    value="googleGroup" />
                <Radio
                    onChange={ props.setGoogleAccountType }
                    isChecked={ props.uploadGoogle.accountType === 'domain' }
                    label="Google Workspace Domain or Cloud Identity Domain"
                    id="radio-domain"
                    value="domain" />
            </FormGroup>
            {props.uploadGoogle.accountType === 'googleAccount' && (
                <FormGroup isRequired label="Email address" fieldId="user">
                    <TextInput
                        value={ props.uploadGoogle.options.share_with_accounts[0] ?
                            props.uploadGoogle.options.share_with_accounts[0].user || '' :
                            '' }
                        type="text" aria-label="Google email address" id="input-google-user"
                        data-testid="input-google-user" isRequired
                        onChange={ value => props.setUploadOptions(
                            'google',
                            Object.assign(props.uploadGoogle.options, { share_with_accounts: [{ user: value }]})
                        ) } />
                </FormGroup>
            )}
            {props.uploadGoogle.accountType === 'serviceAccount' && (
                <FormGroup isRequired label="Email address" fieldId="service-account">
                    <TextInput
                        value={ props.uploadGoogle.options.share_with_accounts[0] ?
                            props.uploadGoogle.options.share_with_accounts[0].serviceAccount || '' :
                            '' }
                        type="text" aria-label="Google email address" id="input-google-service-account"
                        data-testid="input-google-service-account" isRequired
                        onChange={ value => props.setUploadOptions(
                            'google',
                            Object.assign(props.uploadGoogle.options, { share_with_accounts: [{ serviceAccount: value }]})
                        ) } />
                </FormGroup>
            )}
            {props.uploadGoogle.accountType === 'googleGroup' && (
                <FormGroup isRequired label="Email address" fieldId="group">
                    <TextInput
                        value={ props.uploadGoogle.options.share_with_accounts[0] ?
                            props.uploadGoogle.options.share_with_accounts[0].group || '' :
                            '' }
                        type="text" aria-label="Google email address" id="input-google-group"
                        data-testid="input-google-group" isRequired
                        onChange={ value => props.setUploadOptions(
                            'google',
                            Object.assign(props.uploadGoogle.options, { share_with_accounts: [{ group: value }]})
                        ) } />
                </FormGroup>
            )}
            {props.uploadGoogle.accountType === 'domain' && (
                <FormGroup isRequired label="Domain" fieldId="domain">
                    <TextInput
                        value={ props.uploadGoogle.options.share_with_accounts[0] ?
                            props.uploadGoogle.options.share_with_accounts[0].domain || '' :
                            '' }
                        type="text" aria-label="Google domain" id="input-google-domain"
                        data-testid="input-google-domain" isRequired
                        onChange={ value => props.setUploadOptions(
                            'google',
                            Object.assign(props.uploadGoogle.options, { share_with_accounts: [{ domain: value }]})
                        ) } />
                </FormGroup>
            )}
        </Form>
    );
};

WizardStepUploadGoogle.propTypes = {
    setUploadOptions: PropTypes.func,
    setGoogleAccountType: PropTypes.func,
    uploadGoogle: PropTypes.object,
    errors: PropTypes.object,
};

export default WizardStepUploadGoogle;
