import React, { useState } from 'react';

import {
  EnvironmentStateType,
  filterEnvironment,
  useGetAllowedTargets,
} from './steps/ImageOutput/Environment';
import { GCPAccountTypes } from './steps/TargetEnvironment/GCP/GCPTarget';
import { useGetAccountData } from './steps/TargetEnvironment/SourcesSelect';

import { RHEL_9, X86_64 } from '../../constants';
import { ArchitectureItem, Distributions } from '../../store/imageBuilderApi';

type ImageWizardContextPropType = {
  releaseState: [
    Distributions,
    React.Dispatch<React.SetStateAction<Distributions>>
  ];
  architectureState: [
    ArchitectureItem['arch'],
    React.Dispatch<React.SetStateAction<ArchitectureItem['arch']>>
  ];
  environmentState: [
    EnvironmentStateType,
    React.Dispatch<React.SetStateAction<EnvironmentStateType>>
  ];
  isAwsManualState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  awsSourceState: [
    [number, string],
    React.Dispatch<React.SetStateAction<[number, string]>>
  ];
  associatedAwsAccountIdState: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ];
  isShareGoogleAccountState: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ];
  gcpAccountTypeState: [
    GCPAccountTypes,
    React.Dispatch<React.SetStateAction<GCPAccountTypes>>
  ];
  gcpAccountEmailState: [string, React.Dispatch<React.SetStateAction<string>>];
  gcpDomainState: [string, React.Dispatch<React.SetStateAction<string>>];
  isAzureManualState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  azureSourceState: [
    [number, string],
    React.Dispatch<React.SetStateAction<[number, string]>>
  ];
  azureTenantIdState: [string, React.Dispatch<React.SetStateAction<string>>];
  azureSubscriptionIdState: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ];
  azureResourceGroupState: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ];
};

export const ImageWizardContext =
  React.createContext<ImageWizardContextPropType>({
    releaseState: [RHEL_9, () => {}],
    architectureState: [X86_64, () => {}],
    environmentState: [
      {
        aws: { selected: false, authorized: false },
        azure: { selected: false, authorized: false },
        gcp: { selected: false, authorized: false },
        oci: { selected: false, authorized: false },
        'vsphere-ova': { selected: false, authorized: false },
        vsphere: { selected: false, authorized: false },
        'guest-image': { selected: false, authorized: false },
        'image-installer': { selected: false, authorized: false },
        wsl: { selected: false, authorized: false },
      },
      () => {},
    ],
    isAwsManualState: [false, () => {}],
    awsSourceState: [[0, ''], () => {}],
    associatedAwsAccountIdState: ['', () => {}],
    isShareGoogleAccountState: [false, () => {}],
    gcpAccountTypeState: ['googleAccount', () => {}],
    gcpAccountEmailState: ['', () => {}],
    gcpDomainState: ['', () => {}],
    isAzureManualState: [false, () => {}],
    azureSourceState: [[0, ''], () => {}],
    azureTenantIdState: ['', () => {}],
    azureSubscriptionIdState: ['', () => {}],
    azureResourceGroupState: ['', () => {}],
  });

export const useInitializeImageWizardContext = () => {
  //
  // Image output step states
  //
  const [release, setRelease] = useState<Distributions>(RHEL_9);
  const [arch, setArch] = useState<ArchitectureItem['arch']>(X86_64);
  const { data: allowedTargets } = useGetAllowedTargets({
    architecture: arch,
    release: release,
  });
  const [environment, setEnvironment] = useState<EnvironmentStateType>(
    filterEnvironment(
      {
        aws: { selected: false, authorized: false },
        azure: { selected: false, authorized: false },
        gcp: { selected: false, authorized: false },
        oci: { selected: false, authorized: false },
        'vsphere-ova': { selected: false, authorized: false },
        vsphere: { selected: false, authorized: false },
        'guest-image': { selected: false, authorized: false },
        'image-installer': { selected: false, authorized: false },
        wsl: { selected: false, authorized: false },
      },
      allowedTargets
    )
  );
  // Update of the environment when the architecture and release are changed.
  // This pattern prevents the usage of a useEffect See https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevAllowedTargets, setPrevAllowedTargets] = useState(allowedTargets);
  if (!isIdenticalToPrev(prevAllowedTargets, allowedTargets)) {
    setPrevAllowedTargets(allowedTargets);
    setEnvironment(filterEnvironment(environment, allowedTargets));
  }

  //
  // Target environment states
  //
  // AWS
  const [awsManual, setAwsManual] = useState(false);
  const [awsSource, setAwsSource] = useState<[number, string]>([0, '']);
  const { accountId: awsID } = useGetAccountData(awsSource[0], 'aws');
  const [awsAccountId, setAwsAccountId] = useState(awsID);
  const [prevAwsID, setPrevAwsID] = useState(awsID);
  if (awsID !== prevAwsID) {
    setPrevAwsID(awsID);
    setAwsAccountId(awsID);
  }
  // GCP
  const [shareGoogleAccount, setShareGoogleAccount] = useState(true);
  const [gcpAccountType, setGcpAccountType] =
    useState<GCPAccountTypes>('googleAccount');
  const [gcpAccountEmail, setGcpAccountEmail] = useState('');
  const [gcpDomain, setGcpDomain] = useState('');
  // Azure
  const [azureManual, setAzureManual] = useState(false);
  const [azureSource, setAzureSource] = useState<[number, string]>([0, '']);
  const { tenantId, subscriptionId } = useGetAccountData(
    azureSource[0],
    'azure'
  );
  const [azureTenantId, setAzureTenantId] = useState(tenantId);
  const [azureSubId, setAzureSubId] = useState(subscriptionId);
  const [azureResourceGroup, setAzureResourceGroup] = useState('');
  const [prevTenantId, setPrevTenantId] = useState(tenantId);
  const [prevSubscriptionId, setPrevSubscriptionId] = useState(subscriptionId);
  if (prevTenantId !== tenantId || prevSubscriptionId !== subscriptionId) {
    setPrevTenantId(tenantId);
    setPrevSubscriptionId(subscriptionId);
    setAzureTenantId(tenantId);
    setAzureSubId(subscriptionId);
    // when the tenant id or the subscription_id is changing, reset the resource
    // group as the user will need to update it from a new list.
    setAzureResourceGroup('');
  }
  const context: ImageWizardContextPropType = {
    releaseState: [release, setRelease],
    architectureState: [arch, setArch],
    environmentState: [environment, setEnvironment],
    isAwsManualState: [awsManual, setAwsManual],
    awsSourceState: [awsSource, setAwsSource],
    associatedAwsAccountIdState: [awsAccountId, setAwsAccountId],
    isShareGoogleAccountState: [shareGoogleAccount, setShareGoogleAccount],
    gcpAccountTypeState: [gcpAccountType, setGcpAccountType],
    gcpAccountEmailState: [gcpAccountEmail, setGcpAccountEmail],
    gcpDomainState: [gcpDomain, setGcpDomain],
    isAzureManualState: [azureManual, setAzureManual],
    azureSourceState: [azureSource, setAzureSource],
    azureTenantIdState: [azureTenantId, setAzureTenantId],
    azureSubscriptionIdState: [azureSubId, setAzureSubId],
    azureResourceGroupState: [azureResourceGroup, setAzureResourceGroup],
  };
  return context;
};

/**
 * Helper function to avoid having an extra useEffect.
 * @return true if the array in prevAllowedTargets is equivalent to the array
 * allowedTargets, false otherwise
 */
const isIdenticalToPrev = (
  prevAllowedTargets: string[],
  allowedTargets: string[]
) => {
  let identicalToPrev = true;
  if (allowedTargets.length === prevAllowedTargets.length) {
    allowedTargets.forEach((elem) => {
      if (!prevAllowedTargets.includes(elem)) {
        identicalToPrev = false;
      }
    });
  } else {
    identicalToPrev = false;
  }
  return identicalToPrev;
};
