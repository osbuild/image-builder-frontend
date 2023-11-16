import React, { Dispatch, SetStateAction, useState } from 'react';

import {
  Form,
  FormGroup,
  Radio,
  TextInput,
  Title,
  Popover,
  TextContent,
  Text,
  TextList,
  TextListItem,
  Button,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import ValidatedTextField from '../../../common/ValidatedTextField';

export type GCPAccountTypes =
  | 'googleAccount'
  | 'serviceAccount'
  | 'googleGroup'
  | 'domain';

type GCPTargetPropTypes = {
  shareGoogleAccount: boolean;
  setShareGoogleAccount: Dispatch<SetStateAction<boolean>>;
  accountType: GCPAccountTypes;
  setAccountType: Dispatch<SetStateAction<GCPAccountTypes>>;
  accountEmail: string;
  setAccountEmail: Dispatch<SetStateAction<string>>;
  domain: string;
  setDomain: Dispatch<SetStateAction<string>>;
};

export const validateEmail = (email: string) => {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,}$/.test(email);
};

/**
 * @return true if:
 * - the user has a valid email address in the case where the
 *   account type is googleAccount, serviceAccount or googleGroup.
 * - the domain has some text if the user chose it
 * - the user only wants to share with insights
 */
export const validateGCPData = (
  shareGoogleAccount: boolean,
  accountType: GCPAccountTypes,
  email: string,
  domain: string
) => {
  if (shareGoogleAccount) {
    if (accountType !== 'domain') {
      return validateEmail(email);
    }
    return domain.length > 0;
  }
  return true;
};

const AccountTypePopoverInfo = () => {
  return (
    <Popover
      hasAutoWidth
      maxWidth="35rem"
      headerContent={'Valid account types'}
      flipBehavior={['right', 'bottom', 'top', 'left']}
      bodyContent={
        <TextContent>
          <Text>
            The following account types can have an image shared with them:
          </Text>
          <TextList className="pf-u-ml-0">
            <TextListItem>
              <strong>Google account:</strong> A Google account represents a
              developer, an administrator, or any other person who interacts
              with Google Cloud. For example: <em>`alice@gmail.com`</em>.
            </TextListItem>
            <TextListItem>
              <strong>Service account:</strong> A service account is an account
              for an application instead of an individual end user. For example:{' '}
              <em>`myapp@appspot.gserviceaccount.com`</em>.
            </TextListItem>
            <TextListItem>
              <strong>Google group:</strong> A Google group is a named
              collection of Google accounts and service accounts. For example:{' '}
              <em>`admins@example.com`</em>.
            </TextListItem>
            <TextListItem>
              <strong>Google Workspace domain or Cloud Identity domain:</strong>{' '}
              A Google workspace or cloud identity domain represents a virtual
              group of all the Google accounts in an organization. These domains
              represent your organization&apos;s internet domain name. For
              example: <em>`mycompany.com`</em>.
            </TextListItem>
          </TextList>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Account info"
        aria-describedby="google-account-type"
        className="pf-c-form__group-label-help"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

/**
 * Component to display the available customization for sharing on google cloud
 * platform.
 *
 * @param shareGoogleAccount is set to true is the data is shared with a google
 * account, false if only shared with insights.
 * @param setShareGoogleAccount a function to update shareGoogleAccount
 * @param accountType the type of google account to share with (see the propType
 * for more details
 * @param setAccountType a function to update the accountType
 * @param accountEmail the account email, if the type if a google/service
 * account or a google group
 * @param setAccountEmail a function to update the account email
 * @param domain if the account type is domain, domain must be filled up
 * @param setDomain a function to update the domain
 */
const GCPTarget = ({
  shareGoogleAccount,
  setShareGoogleAccount,
  accountType,
  setAccountType,
  accountEmail,
  setAccountEmail,
  domain,
  setDomain,
}: GCPTargetPropTypes) => {
  const clearState = () => {
    // resets when the user switches from sharing to a google account or insights,
    setAccountType('googleAccount');
    clearValues();
  };
  const clearValues = () => {
    // resets when the user switches the account type
    setAccountEmail('');
    setDomain('');
  };
  return (
    <>
      <Form>
        <Title headingLevel="h2">
          Target environment - Google Cloud Platform
        </Title>
        <p>
          Select how to share your image. The image you create can be used to
          launch instances on GCP, regardless of which method you select.
        </p>
        <FormGroup label="Select image sharing" isRequired>
          <Radio
            name="gcp-share-google-account"
            id="gcp-share-google-account"
            label="Share image with a Google account"
            description={
              <p>
                Your image will be uploaded to GCP and shared with the account
                you provide below.
                <b>The image expires in 14 days.</b> To keep permanent access to
                your image, copy it to your GCP project.
              </p>
            }
            checked={shareGoogleAccount}
            isChecked={shareGoogleAccount}
            onClick={() => {
              setShareGoogleAccount(true);
              clearState();
            }}
          />
          <Radio
            name="gcp-share-insights-only"
            id="gcp-share-insights-only"
            label="Share image with Red Hat Insights only"
            description={
              <p>
                Your image will be uploaded to GCP and shared with Red Hat
                Insights.
                <b> The image expires in 14 days.</b> You cannot access or
                recreate this image in your GCP project.
              </p>
            }
            checked={!shareGoogleAccount}
            isChecked={!shareGoogleAccount}
            onClick={() => {
              setShareGoogleAccount(false);
              clearState();
            }}
          />
        </FormGroup>
        {shareGoogleAccount && (
          <FormGroup
            label="Account type"
            isRequired
            labelIcon={<AccountTypePopoverInfo />}
          >
            <Radio
              name="gcp-type-google-account"
              id="gcp-type-google-account"
              label="Google account"
              aria-label="Google account"
              checked={accountType === 'googleAccount'}
              isChecked={accountType === 'googleAccount'}
              onClick={() => {
                setAccountType('googleAccount');
                clearValues();
              }}
            />
            <Radio
              name="gcp-type-service-account"
              id="gcp-type-service-account"
              label="Service account"
              checked={accountType === 'serviceAccount'}
              isChecked={accountType === 'serviceAccount'}
              onClick={() => {
                setAccountType('serviceAccount');
                clearValues();
              }}
            />
            <Radio
              name="gcp-type-google-group"
              id="gcp-type-google-group"
              label="Google group"
              checked={accountType === 'googleGroup'}
              isChecked={accountType === 'googleGroup'}
              onClick={() => {
                setAccountType('googleGroup');
                clearValues();
              }}
            />
            <Radio
              name="gcp-type-domaing"
              id="gcp-type-domaing"
              label="Google Workspace domain or Cloud Identity domain"
              checked={accountType === 'domain'}
              isChecked={accountType === 'domain'}
              onClick={() => {
                setAccountType('domain');
                clearValues();
              }}
            />
          </FormGroup>
        )}
        {shareGoogleAccount && accountType !== 'domain' && (
          <ValidatedTextField
            aria="GCP account email"
            label="Principal (e.g e-mail address)"
            fieldId="gcp-account-email"
            value={accountEmail}
            setValue={setAccountEmail}
            validateFunction={validateEmail}
            helperText="Must be a valid e-mail address"
          />
        )}
        {shareGoogleAccount && accountType === 'domain' && (
          <FormGroup label="Domain" isRequired>
            <TextInput
              value={domain}
              type="text"
              onChange={(_event, value) => setDomain(value)}
              label="google-domain"
              aria-label="google-domain"
            />
          </FormGroup>
        )}
      </Form>
    </>
  );
};

export default GCPTarget;
