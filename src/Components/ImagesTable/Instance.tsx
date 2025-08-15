import React, { Suspense, useEffect, useState } from 'react';

import path from 'path';

import {
  Alert,
  Button,
  ClipboardCopy,
  List,
  ListItem,
  Modal,
  ModalVariant,
  Popover,
  PopoverPosition,
  Skeleton,
} from '@patternfly/react-core';
import {
  ListComponent,
  OrderType,
} from '@patternfly/react-core/dist/esm/components/List/List';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeUser } from '@redhat-cloud-services/types';
import { useLoadModule, useScalprum } from '@scalprum/react-core';
import cockpit from 'cockpit';
import { useNavigate } from 'react-router-dom';

import {
  AMPLITUDE_MODULE_NAME,
  FILE_SYSTEM_CUSTOMIZATION_URL,
  MODAL_ANCHOR,
  SEARCH_INPUT,
} from '../../constants';
import {
  useGetBlueprintsQuery,
  useGetComposeStatusQuery,
} from '../../store/backendApi';
import {
  selectBlueprintSearchInput,
  selectSelectedBlueprintId,
} from '../../store/BlueprintSlice';
import { LocalUploadStatus } from '../../store/cockpit/composerCloudApi';
import { useAppSelector } from '../../store/hooks';
import {
  BlueprintItem,
  ComposesResponseItem,
  ComposeStatus,
  ImageTypes,
} from '../../store/imageBuilderApi';
import {
  isAwss3UploadStatus,
  isAwsUploadRequestOptions,
  isGcpUploadRequestOptions,
  isOciUploadStatus,
} from '../../store/typeGuards';
import { resolveRelPath } from '../../Utilities/path';
import { useFlag } from '../../Utilities/useGetEnvironment';
import useProvisioningPermissions from '../../Utilities/useProvisioningPermissions';
import { GcpLaunchModal } from '../Launch/GcpLaunchModal';

type CloudInstancePropTypes = {
  compose: ComposesResponseItem;
};

export const CloudInstance = ({ compose }: CloudInstancePropTypes) => {
  const { initialized: chromeInitialized } = useChrome();
  const scalprum = useScalprum();
  const hasProvisioning = chromeInitialized && scalprum.config.provisioning;

  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  if (hasProvisioning) {
    return <ProvisioningLink compose={compose} composeStatus={data} />;
  }

  return <DisabledProvisioningLink />;
};

const DisabledProvisioningLink = () => {
  return (
    <Button variant='link' isInline isDisabled>
      Launch
    </Button>
  );
};

type ProvisioningLinkPropTypes = {
  compose: ComposesResponseItem;
  composeStatus: ComposeStatus | undefined;
};

const ProvisioningLink = ({
  compose,
  composeStatus,
}: ProvisioningLinkPropTypes) => {
  const launchEofFlag = useFlag('image-builder.launcheof');
  const [userData, setUserData] = useState<ChromeUser | void>(undefined);

  const { analytics, auth } = useChrome();

  useEffect(() => {
    (async () => {
      const data = await auth.getUser();
      setUserData(data);
    })();
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exposedScalprumModule, error] = useLoadModule(
    {
      scope: 'provisioning',
      module: './ProvisioningWizard',
    },
    {},
  );

  const { permissions, isLoading: isLoadingPermission } =
    useProvisioningPermissions();

  // Recomputing this value on every render made the modal crash. Using a state
  // helps avoiding this situation as the value is only set the first time.
  const [appendTo] = useState(
    document.querySelector(MODAL_ANCHOR) as HTMLElement,
  );

  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);
  const blueprintSearchInput =
    useAppSelector(selectBlueprintSearchInput) || SEARCH_INPUT;
  const { selectedBlueprintVersion } = useGetBlueprintsQuery(
    { search: blueprintSearchInput },
    {
      selectFromResult: ({ data }) => ({
        selectedBlueprintVersion: data?.data.find(
          (blueprint: BlueprintItem) => blueprint.id === selectedBlueprintId,
        )?.version,
      }),
    },
  );

  if (
    error ||
    !exposedScalprumModule ||
    composeStatus?.image_status.status !== 'success'
  ) {
    return <DisabledProvisioningLink />;
  }

  const ProvisioningWizard = exposedScalprumModule.default;
  const provider = getImageProvider(compose);

  const options = compose.request.image_requests[0].upload_request.options;

  let sourceIds = undefined;
  let accountIds = undefined;

  if (isGcpUploadRequestOptions(options)) {
    accountIds = options.share_with_accounts;
  }

  if (isAwsUploadRequestOptions(options)) {
    accountIds = options.share_with_accounts;
    sourceIds = options.share_with_sources;
  }

  const btn = (
    <Button
      spinnerAriaLabel='Loading launch'
      isLoading={isLoadingPermission}
      variant='link'
      isInline
      onClick={() => {
        analytics.track(`${AMPLITUDE_MODULE_NAME} - Link Clicked`, {
          module: AMPLITUDE_MODULE_NAME,
          image_name: compose.image_name,
          current_path: window.location.pathname,
          account_id: userData?.identity.internal?.account_id || 'Not found',
        });

        setIsModalOpen(true);
      }}
    >
      Launch
    </Button>
  );
  const buttonWithTooltip = (
    <Popover
      triggerAction='hover'
      position={PopoverPosition.left}
      aria-label='Outdated image tooltip'
      headerContent={<div>A newer version is available</div>}
      bodyContent={
        <div>This image can be launched, but it is not the latest version.</div>
      }
    >
      {btn}
    </Popover>
  );

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <Suspense fallback='loading...'>
        {selectedBlueprintVersion &&
        compose.blueprint_version !== selectedBlueprintVersion
          ? buttonWithTooltip
          : btn}
        {launchEofFlag && isModalOpen && provider === 'gcp' && (
          <GcpLaunchModal
            isOpen={isModalOpen}
            handleModalToggle={handleModalToggle}
            compose={compose}
            composeStatus={composeStatus}
          />
        )}
        {!launchEofFlag && isModalOpen && (
          <Modal
            isOpen
            appendTo={appendTo}
            variant={ModalVariant.large}
            aria-label='Open launch wizard'
          >
            <ProvisioningWizard
              hasAccess={permissions[provider]}
              onClose={() => setIsModalOpen(false)}
              image={{
                name: compose.image_name || compose.id,
                id: compose.id,
                architecture: compose.request.image_requests[0].architecture,
                provider: provider,
                sourceIDs: sourceIds,
                accountIDs: accountIds,
                uploadOptions:
                  compose.request.image_requests[0].upload_request.options,
                uploadStatus: composeStatus.image_status.upload_status,
              }}
            />
          </Modal>
        )}
      </Suspense>
    </>
  );
};

const getImageProvider = (compose: ComposesResponseItem) => {
  const imageType = compose.request.image_requests[0].image_type;
  switch (imageType) {
    case 'aws':
      return 'aws';
    case 'ami':
      return 'aws';
    case 'azure':
      return 'azure';
    case 'gcp':
      return 'gcp';
    default:
      //TODO check with Provisioning: what if imageType is not 'aws', 'ami', or 'azure'?
      return 'aws';
  }
};

type OciInstancePropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
};

export const OciInstance = ({ compose, isExpired }: OciInstancePropTypes) => {
  const navigate = useNavigate();
  const { data, isSuccess, isFetching, isError } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  const options = data?.image_status.upload_status?.options;

  if (options && !isOciUploadStatus(options)) {
    throw TypeError(
      `Error: options must be of type OciUploadStatus, not ${typeof options}.`,
    );
  }

  if (isExpired) {
    return (
      <Button
        component='a'
        target='_blank'
        variant='link'
        onClick={() => navigate(resolveRelPath(`imagewizard/${compose.id}`))}
        isInline
      >
        Recreate image
      </Button>
    );
  }

  return (
    <Popover
      position='bottom'
      headerContent={<div>Launch an OCI image</div>}
      minWidth='30rem'
      bodyContent={
        <>
          <p>
            To run the image copy the link below and follow the steps below:
          </p>
          <List component={ListComponent.ol} type={OrderType.number}>
            <ListItem>
              Go to &quot;Compute&quot; in Oracle Cloud and choose &quot; Custom
              Images&quot;.
            </ListItem>
            <ListItem>
              Click on &quot;Import image&quot;, choose &quot;Import from an
              object storage URL&quot;.
            </ListItem>
            <ListItem>
              Choose &quot;Import from an object storage URL&quot; and paste the
              URL in the &quot;Object Storage URL&quot; field. The image type
              has to be set to QCOW2 and the launch mode should be
              paravirtualized.
            </ListItem>
          </List>
          <br />
          {isSuccess && (
            <ClipboardCopy
              hoverTip='Copy'
              clickTip='Copied'
              variant='inline-compact'
              isBlock
            >
              {options?.url || ''}
            </ClipboardCopy>
          )}
          {isFetching && <Skeleton />}
          {isError && (
            <Alert
              title='The link to launch the image could not be loaded. Please refresh
              the page and try again.'
              variant='danger'
              isPlain
              isInline
            />
          )}
          <br />
          <Button
            component='a'
            target='_blank'
            variant='link'
            icon={<ExternalLinkAltIcon />}
            iconPosition='right'
            // TO DO update the link after documentation is up
            href={FILE_SYSTEM_CUSTOMIZATION_URL}
            className='pf-v6-u-pl-0'
          >
            Read more about launching OCI images
          </Button>
        </>
      }
    >
      <Button
        variant='link'
        className='pf-v6-u-p-0 pf-v6-u-font-size-sm'
        isDisabled={data?.image_status.status === 'success' ? false : true}
      >
        Image link
      </Button>
    </Popover>
  );
};

type AwsS3InstancePropTypes = {
  compose: ComposesResponseItem;
  isExpired: boolean;
};

export const AwsS3Instance = ({
  compose,
  isExpired,
}: AwsS3InstancePropTypes) => {
  const { analytics } = useChrome();

  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const fileExtensions: { [key in ImageTypes]: string } = {
    aws: '',
    azure: '',
    'edge-commit': '',
    'edge-installer': '',
    gcp: '',
    'guest-image': '.qcow2',
    'image-installer': '.iso',
    vsphere: '.vmdk',
    'vsphere-ova': '.ova',
    wsl: '.wsl',
    ami: '',
    'rhel-edge-commit': '',
    'rhel-edge-installer': '',
    vhd: '',
    oci: '',
  };

  const status = composeStatus?.image_status.status;
  const options = composeStatus?.image_status.upload_status?.options;

  if (options && !isAwss3UploadStatus(options)) {
    throw TypeError(
      `Error: options must be of type Awss3UploadStatus, not ${typeof options}.`,
    );
  }

  if (status !== 'success') {
    return (
      <Button component='a' isDisabled variant='link' isInline>
        Download ({fileExtensions[compose.request.image_requests[0].image_type]}
        )
      </Button>
    );
  }

  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      isInline
      href={options?.url}
      isDisabled={isExpired}
      onClick={() => {
        if (!process.env.IS_ON_PREMISE) {
          analytics.track(`${AMPLITUDE_MODULE_NAME} - Image Downloaded`, {
            module: AMPLITUDE_MODULE_NAME,
            blueprint_id: compose.blueprint_id,
            blueprint_version: compose.blueprint_version,
            image_type: compose.request.image_requests[0].image_type,
          });
        }
      }}
    >
      Download ({fileExtensions[compose.request.image_requests[0].image_type]})
    </Button>
  );
};

type LocalInstancePropTypes = {
  compose: ComposesResponseItem;
};

export const LocalInstance = ({ compose }: LocalInstancePropTypes) => {
  const { data: composeStatus, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });
  if (!isSuccess) {
    return <Skeleton />;
  }

  const status = composeStatus?.image_status.status;
  const options = composeStatus?.image_status.upload_status
    ?.options as unknown as LocalUploadStatus;

  if (status !== 'success') {
    return <></>;
  }

  const parsedPath = path.parse(options.artifact_path);
  const href = '/files#/?path=' + encodeURIComponent(parsedPath.dir);
  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      onClick={async (ev) => {
        ev.preventDefault();
        // Make sure the file is readable for the user, the artefact
        // directory is created as 700 by default.
        await cockpit.spawn(['chmod', '755', parsedPath.dir], {
          superuser: 'try',
        });
        cockpit.jump(href, cockpit.transport.host);
      }}
      href={href}
      isInline
    >
      Open in file browser
    </Button>
  );
};
