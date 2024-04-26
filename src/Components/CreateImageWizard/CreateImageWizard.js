import React from 'react';

import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { useFlag } from '@unleash/proxy-client-react';
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
import {
  CDN_PROD_URL,
  CDN_STAGE_URL,
  UNIT_GIB,
  UNIT_KIB,
  UNIT_MIB,
} from '../../constants';
import {
  useComposeImageMutation,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import isRhel from '../../Utilities/isRhel';
import { resolveRelPath } from '../../Utilities/path';
import { useGetEnvironment } from '../../Utilities/useGetEnvironment';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

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

  if (values['oscap-profile']) {
    customizations.openscap = {
      profile_id: values['oscap-profile'],
    };
    if (values['kernel']) {
      customizations.kernel = values['kernel'];
    }
    if (
      (Array.isArray(values['enabledServices']) &&
        values['enabledServices'].length > 0) ||
      (Array.isArray(values['maskedServices']) &&
        values['maskedServices'].length > 0)
    ) {
      customizations.services = {};
      if (values['enabledServices'].length > 0) {
        customizations.services.enabled = values['enabledServices'];
      }
      if (values['maskedServices'].length > 0) {
        customizations.services.masked = values['maskedServices'];
      }
    }
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
          architecture: values['arch'],
          image_type: 'aws',
          upload_request: {
            type: 'aws',
            options,
          },
        },
      ],
      customizations,
      client_id: 'ui',
    };
    requests.push(request);
  }

  if (values['target-environment']?.gcp) {
    let share = '';
    if (values['image-sharing'] === 'gcp-account') {
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
          architecture: values['arch'],
          image_type: 'gcp',
          upload_request: {
            type: 'gcp',
            options: {},
          },
        },
      ],
      customizations,
      client_id: 'ui',
    };

    if (share !== '') {
      request.image_requests[0].upload_request.options.share_with_accounts = [
        share,
      ];
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
          architecture: values['arch'],
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
      client_id: 'ui',
    };
    requests.push(request);
  }

  if (values['target-environment']?.oci) {
    const request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_description: values?.['image-description'],
      image_requests: [
        {
          architecture: values['arch'],
          image_type: 'oci',
          upload_request: {
            type: 'oci.objectstorage',
            options: {},
          },
        },
      ],
      customizations,
      client_id: 'ui',
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
          architecture: values['arch'],
          image_type: 'vsphere',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
      client_id: 'ui',
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
          architecture: values['arch'],
          image_type: 'vsphere-ova',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
      client_id: 'ui',
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
          architecture: values['arch'],
          image_type: 'guest-image',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
      client_id: 'ui',
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
          architecture: values['arch'],
          image_type: 'image-installer',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
      client_id: 'ui',
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
          architecture: values['arch'],
          image_type: 'wsl',
          upload_request: {
            type: 'aws.s3',
            options: {},
          },
        },
      ],
      customizations,
      client_id: 'ui',
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
const requestToState = (composeRequest, isProd, enableOscap) => {
  if (composeRequest) {
    const imageRequest = composeRequest.image_requests[0];
    const uploadRequest = imageRequest.upload_request;
    const formState = {};

    formState['image-name'] = composeRequest.image_name;
    formState['image-description'] = composeRequest.image_description;

    formState.release = composeRequest?.distribution;
    formState.arch = imageRequest.architecture;
    // set defaults for target environment first
    formState['target-environment'] = {
      aws: false,
      azure: false,
      gcp: false,
      oci: false,
      'guest-image': false,
    };
    // then select the one from the request
    // if the image type is to a cloud provider we use the upload_request.type
    // or if the image is intended for download we use the image_type
    let targetEnvironment;
    if (
      uploadRequest.type === 'aws.s3' ||
      uploadRequest.type === 'oci.objectstorage'
    ) {
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
          mountpoint: fsc.mountpoint.includes('/usr/')
            ? '/usr'
            : fsc.mountpoint,
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
        formState['subscription-base-url'] = CDN_PROD_URL;
      } else {
        formState['subscription-server-url'] =
          'subscription.rhsm.stage.redhat.com';
        formState['subscription-base-url'] = CDN_STAGE_URL;
      }
    } else {
      formState['register-system'] = 'register-later';
    }

    if (enableOscap) {
      formState['oscap-profile'] =
        composeRequest?.customizations?.openscap?.profile_id;
      formState['kernel'] = composeRequest?.customizations?.kernel;
      formState['enabledServices'] =
        composeRequest?.customizations?.services?.enabled;
      formState['maskedServices'] =
        composeRequest?.customizations?.services?.masked;
    }

    return formState;
  } else {
    return;
  }
};

const formStepHistory = (
  composeRequest,
  contentSourcesEnabled,
  enableOscap
) => {
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

    if (enableOscap) {
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

  // Assume that if a request is available that we should start on review step
  // This will occur if 'Recreate image' is clicked
  const initialStep = composeRequest ? 'review' : undefined;

  const { isBeta, isProd } = useGetEnvironment();

  // Only allow oscap to be used in Beta even if the flag says the feature is
  // activated.
  const oscapFeatureFlag = useFlag('image-builder.wizard.oscap.enabled');
  let initialState = requestToState(composeRequest, isProd(), oscapFeatureFlag);
  const stepHistory = formStepHistory(
    composeRequest,
    contentSourcesEnabled,
    oscapFeatureFlag
  );

  if (initialState) {
    initialState.isBeta = isBeta();
    initialState.contentSourcesEnabled = contentSourcesEnabled;
    initialState.enableOscap = oscapFeatureFlag;
  } else {
    initialState = {
      isBeta: isBeta(),
      enableOscap: oscapFeatureFlag,
      contentSourcesEnabled,
    };
  }

  const handleClose = () => navigate(resolveRelPath(''));

  return (
    <>
      <ImageBuilderHeader />
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <ImageCreator
          onClose={handleClose}
          onSubmit={async ({ values, setIsSaving }) => {
            setIsSaving(true);
            const requests = onSave(values);
            await Promise.allSettled(
              requests.map((composeRequest) => composeImage({ composeRequest }))
            );
            navigate(resolveRelPath(''));
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
                inModal: false,
                onKeyDown: (e) => {
                  handleKeyDown(e, handleClose);
                },
                buttonLabels: {
                  submit: 'Create image',
                },
                showTitles: true,
                crossroads: [
                  'target-environment',
                  'release',
                  'payload-repositories',
                ],
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
      </section>
    </>
  );
};

export default CreateImageWizard;
