import React from 'react';

import {
  Button,
  ClipboardCopy,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Skeleton,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import {
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '@/store/api/backend';
import { selectIsOnPremise } from '@/store/slices/env';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import { useGetUser } from '../../../../../Hooks';
import { useAppSelector } from '../../../../../store/hooks';
import { isAwsUploadRequestOptions } from '../../../../../store/typeGuards';

type AwsDetailsPropTypes = {
  compose: ComposesResponseItem;
};

const AwsDetails = ({ compose }: AwsDetailsPropTypes) => {
  const options = compose.request.image_requests[0].upload_request.options;

  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const {
    data: composeStatus,
    isLoading,
    isError,
  } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isAwsUploadRequestOptions(options)) {
    throw TypeError(
      `Error: options must be of type AwsUploadRequestOptions, not ${typeof options}.`,
    );
  }

  const uploadStatus = composeStatus?.image_status.upload_status?.options;

  return (
    <>
      <div className='pf-v6-u-font-weight-bold pf-v6-u-pb-md'>
        Build Information
      </div>
      <DescriptionList isHorizontal isCompact className=' pf-v6-u-pl-xl'>
        <DescriptionListGroup>
          <DescriptionListTerm>UUID</DescriptionListTerm>
          <DescriptionListDescription>
            <ClipboardCopy
              hoverTip='Copy'
              clickTip='Copied'
              variant='inline-compact'
              onClick={() => {
                if (!isOnPremise) {
                  analytics.track(`${AMPLITUDE_MODULE_NAME} - Copy UUID`, {
                    module: AMPLITUDE_MODULE_NAME,
                    link_name: compose.id,
                    current_path: window.location.pathname,
                    account_id:
                      userData?.identity.internal?.account_id || 'Not found',
                  });
                }
              }}
            >
              {compose.id}
            </ClipboardCopy>
          </DescriptionListDescription>
          <DescriptionListTerm>Architecture</DescriptionListTerm>
          <DescriptionListDescription>
            {compose.request.image_requests[0].architecture}
          </DescriptionListDescription>
        </DescriptionListGroup>
        {options.share_with_accounts?.[0] && (
          <DescriptionListGroup>
            <DescriptionListTerm>Shared with</DescriptionListTerm>
            <DescriptionListDescription>
              <Button
                component='a'
                target='_blank'
                variant='link'
                icon={<ExternalLinkAltIcon />}
                iconPosition='right'
                isInline
                // the format of an account link is taken from
                // https://docs.aws.amazon.com/signin/latest/userguide/sign-in-urls-defined.html
                href={`https://${options.share_with_accounts[0]}.signin.aws.amazon.com/console/`}
                onClick={() => {
                  if (!isOnPremise) {
                    analytics.track(`${AMPLITUDE_MODULE_NAME} - Link Clicked`, {
                      module: AMPLITUDE_MODULE_NAME,

                      link_name: options.share_with_accounts
                        ? options.share_with_accounts[0]
                        : '',
                      current_path: window.location.pathname,
                      account_id:
                        userData?.identity.internal?.account_id || 'Not found',
                    });
                  }
                }}
              >
                {options.share_with_accounts[0]}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
      <br />
      <div className='pf-v6-u-font-weight-bold pf-v6-u-pb-md'>
        Cloud Provider Identifiers
      </div>
      <DescriptionList isHorizontal isCompact className=' pf-v6-u-pl-xl'>
        <DescriptionListGroup>
          <DescriptionListTerm>AMI</DescriptionListTerm>
          <DescriptionListDescription>
            {isLoading && <Skeleton width='150px' />}
            {isError && (
              <span className='pf-v6-u-color-200'>Unable to load</span>
            )}
            {!isLoading &&
              !isError &&
              composeStatus?.image_status.status === 'success' &&
              uploadStatus &&
              'ami' in uploadStatus && (
                <ClipboardCopy
                  hoverTip='Copy'
                  clickTip='Copied'
                  variant='inline-compact'
                >
                  {uploadStatus.ami}
                </ClipboardCopy>
              )}
            {!isLoading &&
              !isError &&
              composeStatus?.image_status.status !== 'success' && (
                <span className='pf-v6-u-color-200'>-</span>
              )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};

export default AwsDetails;
