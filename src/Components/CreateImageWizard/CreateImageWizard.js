import React from 'react';
import ImageCreator from './ImageCreator';
import { useNavigate, useLocation } from 'react-router-dom';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import DocumentationButton from '../sharedComponents/DocumentationButton';
import './CreateImageWizard.scss';
import { useDispatch } from 'react-redux';
import api from '../../api';
import { UNIT_KIB, UNIT_MIB, UNIT_GIB } from '../../constants';
import isRhel from '../../Utilities/isRhel';
import { composeAdded } from '../../store/actions/actions';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import {
  review,
  awsTarget,
  registration,
  googleCloudTarger,
  msAzureTarget,
  packages,
  imageOutput,
  fileSystemConfiguration,
  imageName,
} from './steps';

import {
  fileSystemConfigurationValidator,
  targetEnvironmentValidator,
} from './validators';

const handleKeyDown = (e, handleClose) => {
  if (e.key === 'Escape') {
    handleClose();
  }
};

const onSave = (values) => {
  let customizations = {
    packages: values['selected-packages']?.map((p) => p.name),
  };

  if (values['register-system'] === 'register-now-insights') {
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

  if (values['file-system-config-toggle'] === 'manual') {
    customizations.filesystem = [];
    for (let fsc of values['file-system-configuration']) {
      customizations.filesystem.push({
        mountpoint: fsc.mountpoint,
        min_size: fsc.size * fsc.unit,
      });
    }
  }

  let requests = [];
  if (values['target-environment']?.aws) {
    let request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'ami',
          upload_request: {
            type: 'aws',
            options: {
              share_with_accounts: [values['aws-account-id']],
            },
          },
        },
      ],
      customizations,
    };
    requests.push(request);
  }

  if (values['target-environment']?.gcp) {
    let share = '';
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
    }

    let request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'gcp',
          upload_request: {
            type: 'gcp',
            options: {
              share_with_accounts: [share],
            },
          },
        },
      ],
      customizations,
    };

    requests.push(request);
  }

  if (values['target-environment']?.azure) {
    let request = {
      distribution: values.release,
      image_name: values?.['image-name'],
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'vhd',
          upload_request: {
            type: 'azure',
            options: {
              tenant_id: values['azure-tenant-id'],
              subscription_id: values['azure-subscription-id'],
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
    let request = {
      distribution: values.release,
      image_name: values?.['image-name'],
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

  if (values['target-environment']?.['guest-image']) {
    let request = {
      distribution: values.release,
      image_name: values?.['image-name'],
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
    let request = {
      distribution: values.release,
      image_name: values?.['image-name'],
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

const getPackageDescription = async (release, arch, packageName) => {
  const args = [release, arch, packageName];
  let { data, meta } = await api.getPackages(...args);
  let summary;

  // the package should be found in the 0 index
  // if not then fetch all package matches and search for the package
  if (data[0]?.name === packageName) {
    summary = data[0]?.summary;
  } else {
    if (data?.length !== meta.count) {
      ({ data } = await api.getPackages(...args, meta.count));
    }

    const pack = data.find((pack) => packageName === pack.name);
    summary = pack?.summary;
  }

  // if no matching package is found return an empty string for description
  return summary || '';
};

// map the compose request object to the expected form state
const requestToState = (composeRequest) => {
  if (composeRequest) {
    const imageRequest = composeRequest.image_requests[0];
    const uploadRequest = imageRequest.upload_request;
    let formState = {};

    formState['image-name'] = composeRequest.image_name;

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
      formState['aws-account-id'] =
        uploadRequest?.options?.share_with_accounts[0];
    } else if (targetEnvironment === 'azure') {
      formState['azure-tenant-id'] = uploadRequest?.options?.tenant_id;
      formState['azure-subscription-id'] =
        uploadRequest?.options?.subscription_id;
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
      }
    }

    // customizations
    // packages
    let packs = [];
    composeRequest?.customizations?.packages?.forEach(async (packName) => {
      const packageDescription = await getPackageDescription(
        composeRequest?.distribution,
        imageRequest?.architecture,
        packName
      );
      const pack = {
        name: packName,
        summary: packageDescription,
      };
      packs.push(pack);
    });
    formState['selected-packages'] = packs;

    // filesystem
    const fs = composeRequest?.customizations?.filesystem;
    if (fs) {
      formState['file-system-config-toggle'] = 'manual';
      let fileSystemConfiguration = [];
      for (let fsc of fs) {
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
      if (subscription.insights) {
        formState['register-system'] = 'register-now-insights';
      } else {
        formState['register-system'] = 'register-now';
      }

      formState['subscription-activation-key'] = subscription['activation-key'];
      formState['subscription-organization-id'] = subscription.organization;

      if (insights.chrome.isProd()) {
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

    return formState;
  } else {
    return;
  }
};

const formStepHistory = (composeRequest) => {
  if (composeRequest) {
    const imageRequest = composeRequest.image_requests[0];
    const uploadRequest = imageRequest.upload_request;
    let steps = ['image-output'];

    if (uploadRequest.type === 'aws') {
      steps.push('aws-target-env');
    } else if (uploadRequest.type === 'azure') {
      steps.push('azure-target-env');
    } else if (uploadRequest.type === 'gcp') {
      steps.push('google-cloud-target-env');
    }

    if (isRhel(composeRequest?.distribution)) {
      steps.push('registration');
    }

    steps = steps.concat([
      'File system configuration',
      'packages',
      'image-name',
    ]);

    return steps;
  } else {
    return [];
  }
};

const CreateImageWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const composeRequest = location?.state?.composeRequest;
  const initialState = requestToState(composeRequest);
  const stepHistory = formStepHistory(composeRequest);

  const handleClose = () => navigate('/');

  return (
    <ImageCreator
      onClose={handleClose}
      onSubmit={({ values, setIsSaving }) => {
        setIsSaving(() => true);
        const requests = onSave(values);
        Promise.all(
          requests.map((request) =>
            api.composeImage(request).then((response) => {
              dispatch(
                composeAdded(
                  {
                    ...response,
                    request,
                    image_status: { status: 'pending' },
                  },
                  true
                )
              );
            })
          )
        )
          .then(() => {
            navigate('/');
            dispatch(
              addNotification({
                variant: 'success',
                title: 'Your image is being created',
              })
            );

            setIsSaving(false);
          })
          .catch((err) => {
            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Your image could not be created',
                description:
                  'Status code ' +
                  err.response.status +
                  ': ' +
                  err.response.statusText,
              })
            );

            setIsSaving(false);
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
            className: 'image_builder',
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
            crossroads: ['target-environment', 'release'],
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
              googleCloudTarger,
              msAzureTarget,
              registration,
              packages,
              fileSystemConfiguration,
              imageName,
              review,
            ],
            initialState: {
              activeStep: location?.state?.initialStep || 'image-output', // name of the active step
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
