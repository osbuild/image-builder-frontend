import React from 'react';

import {
  ClipboardCopy,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListDescription,
  DescriptionListTerm,
  Button,
  Spinner,
  Popover,
  Alert,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import ClonesTable from './ClonesTable';

import { useGetSourceListQuery } from '../../store/provisioningApi';

const sourceNotFoundPopover = () => {
  return (
    <Popover
      position="bottom"
      bodyContent={
        <>
          <Alert
            variant="danger"
            title="Source name cannot be loaded"
            className="pf-u-pb-md"
            isInline
            isPlain
          />
          <p>
            The information about the source cannot be loaded. Please check the
            source was not removed and try again later.
          </p>
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={'settings/sources'}
          >
            Manage sources here
          </Button>
        </>
      }
    >
      <Button variant="link" className="pf-u-p-0 pf-u-font-size-sm">
        <div className="failure-button">Source name cannot be loaded</div>
      </Button>
    </Popover>
  );
};

const getAzureSourceName = (id) => {
  const { data: sources, isSuccess } = useGetSourceListQuery({
    provider: 'azure',
  });

  if (isSuccess) {
    const sourcename = sources.find((source) => source.id === id);
    if (sourcename) {
      return sourcename.name;
    } else {
      return sourceNotFoundPopover();
    }
  } else {
    return <Spinner isSVG size="md" />;
  }
};

const getAWSSourceName = (id) => {
  const { data: sources, isSuccess } = useGetSourceListQuery({
    provider: 'aws',
  });

  if (isSuccess) {
    const sourcename = sources.find((source) => source.id === id);
    if (sourcename) {
      return sourcename.name;
    } else {
      return sourceNotFoundPopover();
    }
  } else {
    return <Spinner isSVG size="md" />;
  }
};

const parseGCPSharedWith = (sharedWith) => {
  const splitGCPSharedWith = sharedWith[0].split(':');
  return splitGCPSharedWith[1];
};

const AWSDetails = ({ id }) => {
  const composes = useSelector((state) => state.composes);
  const compose = composes.byId[id];

  return (
    <DescriptionList isHorizontal isCompact className=" pf-u-pl-xl">
      <DescriptionListGroup>
        <DescriptionListTerm>UUID</DescriptionListTerm>
        <DescriptionListDescription>
          <ClipboardCopy
            hoverTip="Copy"
            clickTip="Copied"
            variant="inline-compact"
            ouiaId="aws-uuid"
          >
            {id}
          </ClipboardCopy>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {compose.request.image_requests[0].upload_request.options
        .share_with_sources && (
        <DescriptionListGroup>
          <DescriptionListTerm>Source</DescriptionListTerm>
          <DescriptionListDescription>
            {getAWSSourceName(
              compose.request.image_requests[0].upload_request.options
                .share_with_sources?.[0]
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {compose.request.image_requests[0].upload_request.options
        .share_with_accounts?.[0] && (
        <DescriptionListGroup>
          <DescriptionListTerm>Shared with</DescriptionListTerm>
          <DescriptionListDescription>
            <Button
              component="a"
              target="_blank"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              isInline
              // the format of an account link is taken from
              // https://docs.aws.amazon.com/signin/latest/userguide/sign-in-urls-defined.html
              href={`https://${compose.request.image_requests[0].upload_request.options.share_with_accounts[0]}.signin.aws.amazon.com/console/`}
            >
              {
                compose.request.image_requests[0].upload_request.options
                  .share_with_accounts[0]
              }
            </Button>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

const AWSIdentifiers = ({ id }) => {
  return <ClonesTable composeId={id} />;
};

const AzureDetails = ({ id }) => {
  const composes = useSelector((state) => state.composes);
  const compose = composes.byId[id];

  return (
    <>
      <DescriptionList isHorizontal isCompact className=" pf-u-pl-xl">
        <DescriptionListGroup>
          <DescriptionListTerm>UUID</DescriptionListTerm>
          <DescriptionListDescription>
            <ClipboardCopy
              hoverTip="Copy"
              clickTip="Copied"
              variant="inline-compact"
              ouiaId="azure-uuid"
            >
              {id}
            </ClipboardCopy>
          </DescriptionListDescription>
        </DescriptionListGroup>
        {compose.request.image_requests[0].upload_request.options.source_id && (
          <DescriptionListGroup>
            <DescriptionListTerm>Source</DescriptionListTerm>
            <DescriptionListDescription>
              {getAzureSourceName(
                compose.request.image_requests[0].upload_request.options
                  .source_id
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
        <DescriptionListGroup>
          <DescriptionListTerm>Resource Group</DescriptionListTerm>
          <DescriptionListDescription>
            {
              compose.request.image_requests[0].upload_request.options
                .resource_group
            }
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};

const AzureIdentifiers = ({ id }) => {
  const composes = useSelector((state) => state.composes);
  const compose = composes.byId[id];

  return (
    <>
      <DescriptionList isHorizontal isCompact className=" pf-u-pl-xl">
        <DescriptionListGroup>
          <DescriptionListTerm>Image name</DescriptionListTerm>
          <DescriptionListDescription>
            {compose?.image_status?.status === 'success' ? (
              <ClipboardCopy
                hoverTip="Copy"
                clickTip="Copied"
                variant="inline-compact"
              >
                {compose.image_status.upload_status.options.image_name}
              </ClipboardCopy>
            ) : compose?.image_status?.status === 'failure' ? (
              <p></p>
            ) : (
              <Spinner isSVG size="md" />
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};

const GCPDetails = ({ id, sharedWith }) => {
  const composes = useSelector((state) => state.composes);
  const compose = composes.byId[id];

  return (
    <>
      <DescriptionList isHorizontal isCompact className=" pf-u-pl-xl">
        <DescriptionListGroup>
          <DescriptionListTerm>UUID</DescriptionListTerm>
          <DescriptionListDescription>
            <ClipboardCopy
              hoverTip="Copy"
              clickTip="Copied"
              variant="inline-compact"
              ouiaId="gcp-uuid"
            >
              {id}
            </ClipboardCopy>
          </DescriptionListDescription>
        </DescriptionListGroup>
        {compose?.image_status?.status === 'success' && (
          <DescriptionListGroup>
            <DescriptionListTerm>Project ID</DescriptionListTerm>
            <DescriptionListDescription>
              {compose.image_status.upload_status.options.project_id}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
        {sharedWith && (
          <DescriptionListGroup>
            <DescriptionListTerm>Shared with</DescriptionListTerm>
            <DescriptionListDescription>
              {parseGCPSharedWith(sharedWith)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    </>
  );
};

const GCPIdentifiers = ({ id }) => {
  const composes = useSelector((state) => state.composes);
  const compose = composes.byId[id];

  return (
    <>
      <DescriptionList isHorizontal isCompact className=" pf-u-pl-xl">
        <DescriptionListGroup>
          <DescriptionListTerm>Image name</DescriptionListTerm>
          <DescriptionListDescription>
            {compose?.image_status?.status === 'success' ? (
              <ClipboardCopy
                hoverTip="Copy"
                clickTip="Copied"
                variant="inline-compact"
              >
                {compose.image_status.upload_status.options.image_name}
              </ClipboardCopy>
            ) : compose?.image_status?.status === 'failure' ? (
              <p></p>
            ) : (
              <Spinner isSVG size="md" />
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};

const ImageDetails = ({ id }) => {
  const composes = useSelector((state) => state.composes);
  const compose = composes.byId[id];

  return (
    <>
      <div className="pf-u-font-weight-bold pf-u-pb-md">Build Information</div>
      {
        // the information about the image's target differs between images
        // built by api and images built by the service
        (compose.request.image_requests[0].image_type === 'aws' ||
          compose?.image_status?.upload_status?.type === 'aws') && (
          <AWSDetails id={id} />
        )
      }
      {(compose.request.image_requests[0].image_type === 'azure' ||
        compose?.image_status?.upload_status?.type === 'azure') && (
        <AzureDetails id={id} />
      )}
      {(compose.request.image_requests[0].image_type === 'gcp' ||
        compose?.image_status?.upload_status?.type === 'gcp') && (
        <GCPDetails id={id} sharedWith={compose.share_with_accounts} />
      )}
      {(compose.request.image_requests[0].image_type === 'guest-image' ||
        compose.request.image_requests[0].image_type === 'image-installer' ||
        compose.request.image_requests[0].image_type === 'vsphere' ||
        compose.request.image_requests[0].image_type === 'vsphere-ova' ||
        compose.request.image_requests[0].image_type ===
          'rhel-edge-installer' ||
        compose.request.image_requests[0].image_type ===
          'rhel-edge-commit') && (
        <DescriptionList isHorizontal isCompact className=" pf-u-pl-xl">
          <DescriptionListGroup>
            <DescriptionListTerm>UUID</DescriptionListTerm>
            <DescriptionListDescription>
              <ClipboardCopy
                hoverTip="Copy"
                clickTip="Copied"
                variant="inline-compact"
                ouiaId="other-targets-uuid"
              >
                {id}
              </ClipboardCopy>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      )}
      {(compose.request.image_requests[0].image_type === 'aws' ||
        compose?.image_status?.upload_status?.type === 'aws' ||
        compose.request.image_requests[0].image_type === 'gcp' ||
        compose?.image_status?.upload_status?.type === 'gcp' ||
        compose.request.image_requests[0].image_type === 'azure' ||
        compose?.image_status?.upload_status?.type === 'azure') && (
        <>
          <br />
          <div className="pf-u-font-weight-bold pf-u-pb-md">
            Cloud Provider Identifiers
          </div>
        </>
      )}
      {(compose.request.image_requests[0].image_type === 'aws' ||
        compose?.image_status?.upload_status?.type === 'aws') && (
        <AWSIdentifiers id={id} />
      )}
      {(compose.request.image_requests[0].image_type === 'azure' ||
        compose?.image_status?.upload_status?.type === 'azure') && (
        <AzureIdentifiers id={id} />
      )}
      {(compose.request.image_requests[0].image_type === 'gcp' ||
        compose?.image_status?.upload_status?.type === 'gcp') && (
        <GCPIdentifiers id={id} />
      )}
    </>
  );
};

AWSDetails.propTypes = {
  id: PropTypes.string,
};

AWSIdentifiers.propTypes = {
  id: PropTypes.string,
};

AzureDetails.propTypes = {
  id: PropTypes.string,
};

AzureIdentifiers.propTypes = {
  id: PropTypes.string,
};

GCPDetails.propTypes = {
  id: PropTypes.string,
  sharedWith: PropTypes.arrayOf(PropTypes.string),
};

GCPIdentifiers.propTypes = {
  id: PropTypes.string,
};

ImageDetails.propTypes = {
  id: PropTypes.string,
};

export default ImageDetails;
