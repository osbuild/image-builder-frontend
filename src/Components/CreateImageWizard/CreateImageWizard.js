import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useFlag } from '@unleash/proxy-client-react';
import { useDispatch, useStore } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import ImageCreator from './ImageCreator';
import {
  awsTarget,
  fileSystemConfiguration,
  googleCloudTarget,
  imageName,
  imageOutput,
  msAzureTarget,
  packages,
  packagesContentSources,
  registration,
  repositories,
  review,
  oscap,
} from './steps';
import {
  fileSystemConfigurationValidator,
  targetEnvironmentValidator,
} from './validators';

import './CreateImageWizard.scss';
import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../constants';
import {
  useComposeImageMutation,
  useGetArchitecturesQuery,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import isRhel from '../../Utilities/isRhel';
import { resolveRelPath } from '../../Utilities/path';
import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import DocumentationButton from '../sharedComponents/DocumentationButton';

const handleKeyDown = (e, handleClose) => {
  if (e.key === 'Escape') {
    handleClose();
  }
};

const onSave = (values) => {
  const customizations = {
    packages: values['selected-packages']?.map((p) => p.name),
  };

  if (values['payload-repositories']?.length > 0) {
    customizations['payload_repositories'] = [
      ...values['payload-repositories'],
    ];
  }

  if (values['custom-repositories']?.length > 0) {
    customizations['custom_repositories'] = [...values['custom-repositories']];
  }

  if (values['register-system'] === 'register-now-rhc') {
    customizations.subscription = {
      'activation-key': values['subscription-activation-key'],
      insights: true,
      rhc: true,
      organization: Number(values['subscription-organization-id']),
      'server-url': values['subscription-server-url'],
      'base-url': values['subscription-base-url'],
    };
  } else if (values['register-system'] === 'register-now-insights') {
    customizations.subscription = {
      'activation-key': values['subscription-activation-key'],
      insights: true,
      organization: Number(values['subscription-organization-id']),
      'server-url': values['subscription-server-url'],
      'base-url': values['subscription-base-url'],
    };
  } else if (values['register-system'] === 'register-now') {
    customizations.subscription = {
      'activation-key': values['subscription-activation-key'],
      insights: false,
      organization: Number(values['subscription-organization-id']),
      'server-url': values['subscription-server-url'],
      'base-url': values['subscription-base-url'],
    };
  }

  if (values['file-system-config-radio'] === 'manual') {
    customizations.filesystem = [];
    for (const fsc of values['file-system-configuration']) {
      customizations.filesystem.push({
        mountpoint: fsc.mountpoint,
        min_size: fsc.size * fsc.unit,
      });
    }
  }

  if (values['oscap-policy']) {
    customizations.openscap = {
      profile_id: values['oscap-policy'],
    };
  }

  const requests = [];
  if (values['target-environment']?.aws) {
    const options =
      values['aws-target-type'] === 'aws-target-type-source'
        ? { share_with_sources: [values['aws-sources-select']] }
        : { share_with_accounts: [values['aws-account-id']] };
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options,
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  if (values['target-environment']?.gcp) {
    let share = '';
    if (values['image_sharing'] === 'gcp-account') {
      switch (values['google-account-type']) {
        case 'googleAccount':
          share = `user:${values['google-email']}`;
          break;
        case 'serviceAccount':
          share = `serviceAccount:${values['google-email']}`;
          break;
        case 'googleGroup':
          share = `group:${values['google-email']}`;
          break;
        case 'domain':
          share = `domain:${values['google-domain']}`;
          break;
        // no default
      }
    }

    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'gcp',
          upload_request: {
            type: 'gcp',
            options: {},
          },
        },
      ],
      customizations,
    };

    if (share !== '') {
      request.options = [share];
    }
    requests.push(request);
  }

  if (values['target-environment']?.azure) {
    const upload_options =
      values['azure-type'] === 'azure-type-source'
        ? { source_id: values['azure-sources-select'] }
        : {
            tenant_id: values['azure-tenant-id'],
            subscription_id: values['azure-subscription-id'],
          };
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'azure',
          upload_request: {
            type: 'azure',
            options: {
              ...upload_options,
              resource_group: values['azure-resource-group'],
            },
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  if (values['target-environment']?.vsphere) {
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'vsphere',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  if (values['target-environment']?.['vsphere-ova']) {
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'vsphere-ova',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  if (values['target-environment']?.['guest-image']) {
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'guest-image',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  if (values['target-environment']?.['image-installer']) {
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'image-installer',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  if (values['target-environment']?.wsl) {
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'wsl',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  return requests;
};

const parseSizeUnit = (bytesize) => {
  let size;
  let unit;

  if (bytesize % UNIT_GIB === 0) {
    size = bytesize / UNIT_GIB;
    unit = UNIT_GIB;
  } else if (bytesize % UNIT_MIB === 0) {
    size = bytesize / UNIT_MIB;
    unit = UNIT_MIB;
  } else if (bytesize % UNIT_KIB === 0) {
    size = bytesize / UNIT_KIB;
    unit = UNIT_KIB;
  }

  return [size, unit];
};

// map the compose request object to the expected form state
const requestToState = (composeRequest, distroInfo, isBeta, isProd) => {
  if (composeRequest) {
    const imageRequest = composeRequest.image_requests[0];
    const uploadRequest = imageRequest.upload_request;
    const formState = {};

    formState['image-name'] = composeRequest.image_name;
    formState['image-description'] = composeRequest.image_description;

    formState.release = composeRequest?.distribution;
    // set defaults for target environment first
    formState['target-environment'] = {
      aws: false,
      azure: false,
      gcp: false,
      'guest-image': false,
    };
    // then select the one from the request
    // if the image type is to a cloud provider we use the upload_request.type
    // or if the image is intended for download we use the image_type
    let targetEnvironment;
    if (uploadRequest.type === 'aws.s3') {
      targetEnvironment = imageRequest.image_type;
    } else {
      targetEnvironment = uploadRequest.type;
    }

    formState['target-environment'][targetEnvironment] = true;

    if (targetEnvironment === 'aws') {
      const shareWithSource = uploadRequest?.options?.share_with_sources?.[0];
      const shareWithAccount = uploadRequest?.options?.share_with_accounts?.[0];
      formState['aws-sources-select'] = shareWithSource;
      formState['aws-account-id'] = shareWithAccount;
      if (shareWithAccount && !shareWithSource) {
        formState['aws-target-type'] = 'aws-target-type-account-id';
      } else {
        // if both shareWithAccount & shareWithSource are present, set radio
        // to sources - this is essentially an arbitrary decision
        // additionally, note that the source is not validated against the actual
        // sources
        formState['aws-target-type'] = 'aws-target-type-source';
      }
    } else if (targetEnvironment === 'azure') {
      if (uploadRequest?.options?.source_id) {
        formState['azure-type'] = 'azure-type-source';
        formState['azure-sources-select'] = uploadRequest?.options?.source_id;
      } else {
        formState['azure-type'] = 'azure-type-manual';
        formState['azure-tenant-id'] = uploadRequest?.options?.tenant_id;
        formState['azure-subscription-id'] =
          uploadRequest?.options?.subscription_id;
      }
      formState['azure-resource-group'] =
        uploadRequest?.options?.resource_group;
    } else if (targetEnvironment === 'gcp') {
      // parse google account info
      // roughly in the format `accountType:accountEmail`
      const accountInfo = uploadRequest?.options?.share_with_accounts[0];
      const [accountTypePrefix, account] = accountInfo.split(':');

      switch (accountTypePrefix) {
        case 'user':
          formState['google-account-type'] = 'googleAccount';
          formState['google-email'] = account;
          break;
        case 'serviceAccount':
          formState['google-account-type'] = 'serviceAccount';
          formState['google-email'] = account;
          break;
        case 'group':
          formState['google-account-type'] = 'googleGroup';
          formState['google-email'] = account;
          break;
        case 'domain':
          formState['google-account-type'] = 'domain';
          formState['google-domain'] = account;
          break;
        // no default
      }
    }

    // customizations
    // packages
    const packages = composeRequest?.customizations?.packages?.map((name) => {
      return {
        name: name,
        summary: undefined,
      };
    });
    formState['selected-packages'] = packages;

    // repositories
    // 'original-payload-repositories' is treated as read-only and is used to populate
    // the table in the repositories step
    // This is necessary because there may be repositories present in the request's
    // json blob that are not managed using the content sources API. In that case,
    // they are still displayed in the table of repositories but without any information
    // from the content sources API (in other words, only the URL of the repository is
    // displayed). This information needs to persist throughout the lifetime of the
    // Wizard as it is needed every time the repositories step is visited.
    formState['original-payload-repositories'] =
      composeRequest?.customizations?.payload_repositories;
    // 'payload-repositories' is mutable and is used to generate the request
    // sent to image-builder
    formState['payload-repositories'] =
      composeRequest?.customizations?.payload_repositories;

    // these will be overwritten by the repositories step if revisited, and generated from the payload repositories added there
    formState['custom-repositories'] =
      composeRequest?.customizations?.custom_repositories;

    // filesystem
    const fs = composeRequest?.customizations?.filesystem;
    if (fs) {
      formState['file-system-config-radio'] = 'manual';
      const fileSystemConfiguration = [];
      for (const fsc of fs) {
        const [size, unit] = parseSizeUnit(fsc.min_size);
        fileSystemConfiguration.push({
          mountpoint: fsc.mountpoint,
          size,
          unit,
        });
      }

      formState['file-system-configuration'] = fileSystemConfiguration;
    }

    // subscription
    const subscription = composeRequest?.customizations?.subscription;
    if (subscription) {
      if (subscription.rhc) {
        formState['register-system'] = 'register-now-rhc';
      } else if (subscription.insights) {
        formState['register-system'] = 'register-now-insights';
      } else {
        formState['register-system'] = 'register-now';
      }

      formState['subscription-activation-key'] = subscription['activation-key'];
      formState['subscription-organization-id'] = subscription.organization;

      if (isProd) {
        formState['subscription-server-url'] = 'subscription.rhsm.redhat.com';
        formState['subscription-base-url'] = 'https://cdn.redhat.com/';
      } else {
        formState['subscription-server-url'] =
          'subscription.rhsm.stage.redhat.com';
        formState['subscription-base-url'] = 'https://cdn.stage.redhat.com/';
      }
    } else {
      formState['register-system'] = 'register-later';
    }

    // oscap policy
    if (isBeta) {
      formState['oscap-policy'] =
        composeRequest?.customizations?.openscap?.profile_id;
    }

    return formState;
  } else {
    return;
  }
};

const formStepHistory = (composeRequest, contentSourcesEnabled, isBeta) => {
  if (composeRequest) {
    const imageRequest = composeRequest.image_requests[0];
    const uploadRequest = imageRequest.upload_request;
    // the order of steps must match the order of the steps in the Wizard
    const steps = ['image-output'];

    if (uploadRequest.type === 'aws') {
      steps.push('aws-target-env');
    } else if (uploadRequest.type === 'azure') {
      steps.push('ms-azure-target-env');
    } else if (uploadRequest.type === 'gcp') {
      steps.push('google-cloud-target-env');
    }

    if (isRhel(composeRequest?.distribution)) {
      steps.push('registration');
    }

    if (isBeta) {
      steps.push('Compliance');
    }

    if (contentSourcesEnabled) {
      steps.push('File system configuration', 'packages', 'repositories');

      const customRepositories =
        composeRequest.customizations?.payload_repositories;
      if (customRepositories) {
        steps.push('packages-content-sources');
      }
    } else {
      steps.push('File system configuration', 'packages');
    }
    steps.push('details');

    return steps;
  } else {
    return [];
  }
};

const CreateImageWizard = () => {
  const [composeImage] = useComposeImageMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // composeId is an optional param that is used for Recreate image
  const { composeId } = useParams();

  const { data } = useGetComposeStatusQuery(
    { composeId: composeId },
    {
      skip: composeId ? false : true,
    }
  );
  const composeRequest = composeId ? data?.request : undefined;
  const contentSourcesEnabled = useFlag('image-builder.enable-content-sources');

  // TODO: This causes an annoying re-render when using Recreate image
  const { data: distroInfo } = useGetArchitecturesQuery(
    { distribution: composeRequest?.distribution },
    {
      // distroInfo is only needed when recreating an image, skip otherwise
      skip: composeId ? false : true,
    }
  );

  // Assume that if a request is available that we should start on review step
  // This will occur if 'Recreate image' is clicked
  const initialStep = composeRequest ? 'review' : undefined;

  const { isBeta, isProd } = useGetEnvironment();

  let initialState = requestToState(
    composeRequest,
    distroInfo,
    isBeta(),
    isProd()
  );
  const stepHistory = formStepHistory(
    composeRequest,
    contentSourcesEnabled,
    isBeta()
  );

  if (initialState) {
    initialState.isBeta = isBeta();
    initialState.contentSourcesEnabled = contentSourcesEnabled;
  } else {
    initialState = {
      isBeta: isBeta(),
      contentSourcesEnabled,
    };
  }

  const handleClose = () => navigate(resolveRelPath(''));

  // In case the `created_at` date is undefined when creating an image
  // a temporary value with current date is added
  const currentDate = new Date();

  return (
    <ImageCreator
      onClose={handleClose}
      onSubmit={({ values, setIsSaving }) => {
        setIsSaving(true);
        const requests = onSave(values);
        navigate(resolveRelPath(''));
        // https://redux-toolkit.js.org/rtk-query/usage/mutations#frequently-used-mutation-hook-return-values
        // If you want to immediately access the result of a mutation, you need to chain `.unwrap()`
        // if you actually want the payload or to catch the error.
        // We do this so we can dispatch the appropriate notification (success or failure).
        Promise.all(
          requests.map((composeRequest) =>
            composeImage({ composeRequest }).unwrap()
          )
        )
          .then(() => {
            dispatch(
              addNotification({
                variant: 'success',
                title: 'Your image is being created',
              })
            );
          })
          .catch((err) => {
            let msg = err.response.statusText;
            if (err.response.data?.errors[0]?.detail) {
              msg = err.response.data?.errors[0]?.detail;
            }

            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Your image could not be created',
                description: 'Status code ' + err.response.status + ': ' + msg,
              })
            );
          });
      }}
      defaultArch="x86_64"
      customValidatorMapper={{
        fileSystemConfigurationValidator,
        targetEnvironmentValidator,
      }}
      schema={{
        fields: [
          {
            component: componentTypes.WIZARD,
            name: 'image-builder-wizard',
            className: 'imageBuilder',
            isDynamic: true,
            inModal: true,
            onKeyDown: (e) => {
              handleKeyDown(e, handleClose);
            },
            buttonLabels: {
              submit: 'Create image',
            },
            showTitles: true,
            title: 'Create image',
            crossroads: [
              'target-environment',
              'release',
              'payload-repositories',
            ],
            description: (
              <>
                Image builder allows you to create a custom image and push it to
                target environments. <DocumentationButton />
              </>
            ),
            // order in this array does not reflect order in wizard nav, this order is managed inside
            // of each step by `nextStep` property!
            fields: [
              imageOutput,
              awsTarget,
              googleCloudTarget,
              msAzureTarget,
              registration,
              packages,
              packagesContentSources,
              repositories,
              fileSystemConfiguration,
              imageName,
              review,
              oscap,
            ],
            initialState: {
              activeStep: initialStep || 'image-output', // name of the active step
              activeStepIndex: stepHistory.length, // active index
              maxStepIndex: stepHistory.length, // max achieved index
              prevSteps: stepHistory, // array with names of previously visited steps
            },
          },
        ],
      }}
      initialValues={initialState}
    />
  );
};

export default CreateImageWizard;
