import React from 'react';

import { Skeleton } from '@patternfly/react-core';

import {
  ImageTypes,
  useGetComposeClonesQuery,
} from '../../store/imageBuilderApi';
import { ComposesResponseItem } from '../../store/imageBuilderApi';

const targetOptions: { [key in ImageTypes]: string } = {
  aws: 'Amazon Web Services',
  azure: 'Microsoft Azure',
  'edge-commit': 'Edge Commit',
  'edge-installer': 'Edge Installer',
  gcp: 'Google Cloud Platform',
  'guest-image': 'Virtualization - Guest image',
  'image-installer': 'Bare metal - Installer',
  vsphere: 'VMWare vSphere',
  'vsphere-ova': 'VMWare vSphere',
  wsl: 'Windows Subsystem for Linux',
  ami: 'Amazon Web Services',
  'rhel-edge-commit': 'RHEL Edge Commit',
  'rhel-edge-installer': 'RHEL Edge Installer',
  vhd: '',
  oci: 'Oracle Cloud Infrastructure',
};

type TargetPropTypes = {
  compose: ComposesResponseItem;
};

export const Target = ({ compose }: TargetPropTypes) => {
  return <p>{targetOptions[compose.request.image_requests[0].image_type]}</p>;
};

type AwsTargetPropTypes = {
  compose: ComposesResponseItem;
};

export const AwsTarget = ({ compose }: AwsTargetPropTypes) => {
  const { data, isSuccess } = useGetComposeClonesQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const text = `Amazon Web Services (${data.data.length + 1})`;
  return <>{text}</>;
};
