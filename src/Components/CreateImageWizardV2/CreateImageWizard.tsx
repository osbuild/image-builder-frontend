import React, { useEffect, useState } from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  useWizardContext,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import {
  EnvironmentStateType,
  filterEnvironment,
  hasUserSelectedAtLeastOneEnv,
  useGetAllowedTargets,
} from './steps/ImageOutput/Environment';
import ImageOutputStep from './steps/ImageOutput/ImageOutput';
import ReviewStep from './steps/Review/ReviewStep';
import AWSTarget, {
  validateAWSAccountID,
} from './steps/TargetEnvironment/AWS/AWSTarget';
import AzureTarget, {
  validateAzureId,
} from './steps/TargetEnvironment/Azure/AzureTarget';
import GCPTarget, {
  GCPAccountTypes,
  validateGCPData,
} from './steps/TargetEnvironment/GCP/GCPTarget';
import { useGetAccountData } from './steps/TargetEnvironment/SourcesSelect';

import { RHEL_9, X86_64 } from '../../constants';
import './CreateImageWizard.scss';
import { ArchitectureItem, Distributions } from '../../store/imageBuilderApi';
import { resolveRelPath } from '../../Utilities/path';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

/**
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

type CustomWizardFooterPropType = {
  isNextDisabled: boolean;
};
/**
 * The custom wizard footer is only switching the order of the buttons compared
 * to the default wizard footer from the PF5 library.
 */
const CustomWizardFooter = ({ isNextDisabled }: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooterWrapper>
      <Button
        variant="primary"
        onClick={goToNextStep}
        isDisabled={isNextDisabled}
      >
        Next
      </Button>
      <Button variant="secondary" onClick={goToPrevStep}>
        Back
      </Button>
      <Button variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

const CreateImageWizard = () => {
  const navigate = useNavigate();
  //
  // Image output step states
  //
  const [release, setRelease] = useState<Distributions>(RHEL_9);
  const [arch, setArch] = useState<ArchitectureItem['arch']>(X86_64);
  const {
    data: allowedTargets,
    isFetching,
    isSuccess,
    isError,
  } = useGetAllowedTargets({
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
  const showTargetEnv =
    (environment.aws.selected && environment.aws.authorized) ||
    (environment.gcp.selected && environment.gcp.authorized) ||
    (environment.azure.selected && environment.azure.authorized);
  // AWS
  const [awsManual, setAwsManual] = useState(false);
  const [awsSource, setAwsSource] = useState<[number, string]>([0, '']);
  const { accountId: awsID, isError: awsIDError } = useGetAccountData(
    awsSource[0],
    'aws'
  );
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
  const {
    tenantId,
    subscriptionId,
    resourceGroups,
    isError: azureIDError,
  } = useGetAccountData(azureSource[0], 'azure');
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
  return (
    <>
      <ImageBuilderHeader />
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <Wizard onClose={() => navigate(resolveRelPath(''))} isVisitRequired>
          <WizardStep
            name="Image output"
            id="step-image-output"
            footer={
              <CustomWizardFooter
                isNextDisabled={!hasUserSelectedAtLeastOneEnv(environment)}
              />
            }
          >
            <ImageOutputStep
              release={release}
              setRelease={setRelease}
              arch={arch}
              setArch={setArch}
              environment={environment}
              setEnvironment={setEnvironment}
              isFetching={isFetching}
              isError={isError}
              isSuccess={isSuccess}
            />
          </WizardStep>
          <WizardStep
            name="Target environment"
            id="step-target-environment"
            isHidden={!showTargetEnv}
            steps={[
              <WizardStep
                name="Amazon Web Services"
                id="aws-sub-step"
                key="aws-sub-step"
                isHidden={
                  !(environment.aws.selected && environment.aws.authorized)
                }
                footer={
                  <CustomWizardFooter
                    isNextDisabled={!validateAWSAccountID(awsAccountId)}
                  />
                }
              >
                <AWSTarget
                  manual={awsManual}
                  setManual={setAwsManual}
                  source={awsSource}
                  setSource={setAwsSource}
                  isErrorFetchingDetails={awsIDError}
                  associatedAccountId={awsAccountId}
                  setAssociatedAccountId={setAwsAccountId}
                />
              </WizardStep>,
              <WizardStep
                name="Google Cloud Platform"
                id="gcp-sub-step"
                key="gcp-sub-step"
                isHidden={
                  !(environment.gcp.selected && environment.gcp.authorized)
                }
                footer={
                  <CustomWizardFooter
                    isNextDisabled={
                      !validateGCPData(
                        shareGoogleAccount,
                        gcpAccountType,
                        gcpAccountEmail,
                        gcpDomain
                      )
                    }
                  />
                }
              >
                <GCPTarget
                  shareGoogleAccount={shareGoogleAccount}
                  setShareGoogleAccount={setShareGoogleAccount}
                  accountType={gcpAccountType}
                  setAccountType={setGcpAccountType}
                  accountEmail={gcpAccountEmail}
                  setAccountEmail={setGcpAccountEmail}
                  domain={gcpDomain}
                  setDomain={setGcpDomain}
                />
              </WizardStep>,
              <WizardStep
                name="Microsoft Azure"
                id="azure-sub-step"
                key="azure-sub-step"
                isHidden={
                  !(environment.azure.selected && environment.azure.authorized)
                }
                footer={
                  <CustomWizardFooter
                    isNextDisabled={
                      !(
                        validateAzureId(azureTenantId) &&
                        validateAzureId(azureSubId) &&
                        azureResourceGroup
                      )
                    }
                  />
                }
              >
                <AzureTarget
                  manual={azureManual}
                  setManual={setAzureManual}
                  source={azureSource}
                  setSource={setAzureSource}
                  tenantId={azureTenantId}
                  setTenantId={setAzureTenantId}
                  subscriptionId={azureSubId}
                  setSubscriptionId={setAzureSubId}
                  isErrorFetchingDetails={azureIDError}
                  resourceGroups={resourceGroups}
                  resourceGroup={azureResourceGroup}
                  setResourceGroup={setAzureResourceGroup}
                />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name="Review"
            id="step-review"
            footer={<CustomWizardFooter isNextDisabled={true} />}
          >
            <ReviewStep
              release={release}
              arch={arch}
              environment={environment}
              awsManual={awsManual}
              awsAccountId={awsAccountId}
              awsSource={awsSource}
              gcpAccountType={gcpAccountType}
              gcpAccountEmail={gcpAccountEmail}
              gcpDomain={gcpDomain}
              azureManual={azureManual}
              azureSource={azureSource}
              azureTenantId={azureTenantId}
              azureSubscriptionId={azureSubId}
              azureResourceGroup={azureResourceGroup}
            />
          </WizardStep>
        </Wizard>
      </section>
    </>
  );
};

export default CreateImageWizard;
