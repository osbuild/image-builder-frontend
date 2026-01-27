import React, { useState } from 'react';

import {
  Button,
  Content,
  ContentVariants,
  ExpandableSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  useWizardContext,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';

import './ReviewStep.scss';
import {
  ContentList,
  DetailsList,
  FirewallList,
  FirstBootList,
  FSCList,
  HostnameList,
  ImageOutputList,
  KernelList,
  LocaleList,
  RegisterAapList,
  RegisterLaterList,
  RegisterNowList,
  RegisterSatelliteList,
  ServicesList,
  TargetEnvAWSList,
  TargetEnvAzureList,
  TargetEnvGCPList,
  TargetEnvOciList,
  TargetEnvOtherList,
  TimezoneList,
  UsersList,
} from './ReviewStepTextLists';

import isRhel from '../../../../../src/Utilities/isRhel';
import { targetOptions } from '../../../../constants';
import { useIsOnPremise } from '../../../../Hooks';
import { useAppSelector } from '../../../../store/hooks';
import { isImageMode as isImageModeDistribution } from '../../../../store/typeGuards';
import {
  selectAapRegistration,
  selectBlueprintDescription,
  selectBlueprintName,
  selectDistribution,
  selectFirewall,
  selectHostname,
  selectImageTypes,
  selectIsImageMode,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectNtpServers,
  selectRegistrationType,
  selectServices,
  selectTimezone,
  selectUsers,
} from '../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../utilities/hasSpecificTargetOnly';
import SecurityInformation from '../Oscap/components/SecurityInformation';

const Review = () => {
  const { goToStepById } = useWizardContext();
  const isOnPremise = useIsOnPremise();

  const isImageMode = useAppSelector(selectIsImageMode);
  const aapRegistration = useAppSelector(selectAapRegistration);
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);
  const distribution = useAppSelector(selectDistribution);
  const environments = useAppSelector(selectImageTypes);
  const registrationType = useAppSelector(selectRegistrationType);
  const hostname = useAppSelector(selectHostname);
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);
  const firewall = useAppSelector(selectFirewall);
  const services = useAppSelector(selectServices);
  const users = useAppSelector(selectUsers);
  const kernel = useAppSelector(selectKernel);

  const [isExpandedAap, setIsExpandedAap] = useState(true);
  const [isExpandedImageOutput, setIsExpandedImageOutput] = useState(true);
  const [isExpandedTargetEnvs, setIsExpandedTargetEnvs] = useState(true);
  const [isExpandedFSC, setIsExpandedFSC] = useState(true);
  const [isExpandedContent, setIsExpandedContent] = useState(true);
  const [isExpandedRegistration, setIsExpandedRegistration] = useState(true);
  const [isExpandedImageDetail, setIsExpandedImageDetail] = useState(true);
  const [isExpandedSecurityDetail, setIsExpandedSecurityDetail] =
    useState(true);
  const [isExpandedTimezone, setIsExpandedTimezone] = useState(true);
  const [isExpandedLocale, setIsExpandedLocale] = useState(true);
  const [isExpandedHostname, setIsExpandedHostname] = useState(true);
  const [isExpandedKernel, setIsExpandedKernel] = useState(true);
  const [isExpandedFirewall, setIsExpandedFirewall] = useState(true);
  const [isExpandedServices, setIsExpandedServices] = useState(true);
  const [isExpandableFirstBoot, setIsExpandedFirstBoot] = useState(true);
  const [isExpandedUsers, setIsExpandedUsers] = useState(true);

  const onToggleAap = (isExpandedAap: boolean) =>
    setIsExpandedAap(isExpandedAap);
  const onToggleImageOutput = (isExpandedImageOutput: boolean) =>
    setIsExpandedImageOutput(isExpandedImageOutput);
  const onToggleTargetEnvs = (isExpandedTargetEnvs: boolean) =>
    setIsExpandedTargetEnvs(isExpandedTargetEnvs);
  const onToggleFSC = (isExpandedFSC: boolean) =>
    setIsExpandedFSC(isExpandedFSC);
  const onToggleContent = (isExpandedContent: boolean) =>
    setIsExpandedContent(isExpandedContent);
  const onToggleRegistration = (isExpandedRegistration: boolean) =>
    setIsExpandedRegistration(isExpandedRegistration);
  const onToggleImageDetail = (isExpandedImageDetail: boolean) =>
    setIsExpandedImageDetail(isExpandedImageDetail);
  const onToggleSecurityDetails = (isExpandedSecurityDetail: boolean) =>
    setIsExpandedSecurityDetail(isExpandedSecurityDetail);
  const onToggleTimezone = (isExpandedTimezone: boolean) =>
    setIsExpandedTimezone(isExpandedTimezone);
  const onToggleLocale = (isExpandedLocale: boolean) =>
    setIsExpandedLocale(isExpandedLocale);
  const onToggleHostname = (isExpandedHostname: boolean) =>
    setIsExpandedHostname(isExpandedHostname);
  const onToggleKernel = (isExpandedKernel: boolean) =>
    setIsExpandedKernel(isExpandedKernel);
  const onToggleFirewall = (isExpandedFirewall: boolean) =>
    setIsExpandedFirewall(isExpandedFirewall);
  const onToggleServices = (isExpandedServices: boolean) =>
    setIsExpandedServices(isExpandedServices);
  const onToggleFirstBoot = (isExpandableFirstBoot: boolean) =>
    setIsExpandedFirstBoot(isExpandableFirstBoot);
  const onToggleUsers = (isExpandedUsers: boolean) =>
    setIsExpandedUsers(isExpandedUsers);

  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');

  type RevisitStepButtonProps = {
    ariaLabel: string;
    testId: string;
    stepId: string;
  };

  const RevisitStepButton = ({
    ariaLabel,
    testId,
    stepId,
  }: RevisitStepButtonProps) => {
    return (
      <Button
        icon={<ArrowRightIcon />}
        variant='link'
        aria-label={ariaLabel}
        data-testid={testId}
        component='span'
        onClick={() => revisitStep(stepId)}
        className='pf-v6-u-p-0 pf-v6-u-font-weight-bold'
        isInline
      >
        Revisit step
      </Button>
    );
  };

  const revisitStep = (stepId: string) => {
    goToStepById(stepId);
  };

  const composeExpandable = (label: string, testId: string, stepId: string) => {
    return (
      <Split hasGutter>
        <SplitItem
          isFilled
          className='pf-v6-u-min-width pf-v6-u-text-align-start'
        >
          <Button variant='link' component='span' isInline>
            {label}
          </Button>
        </SplitItem>
        <SplitItem isFilled>
          <RevisitStepButton
            ariaLabel={`Revisit ${label} step`}
            testId={testId}
            stepId={stepId}
          />
        </SplitItem>
      </Split>
    );
  };

  const wizardStepId = isImageMode ? 'wizard-users' : 'wizard-users-optional';

  // This is needed because on first render (during create)
  // the distribution is set to a known distribution
  const isPackageMode = !isImageModeDistribution(distribution) && !isImageMode;

  return (
    <>
      <ExpandableSection
        toggleContent={composeExpandable(
          'Image output',
          'revisit-image-output',
          'step-image-output',
        )}
        onToggle={(_event, isExpandedImageOutput) =>
          onToggleImageOutput(isExpandedImageOutput)
        }
        isExpanded={isExpandedImageOutput}
        isIndented
        data-testid='image-output-expandable'
      >
        <ImageOutputList />
      </ExpandableSection>
      <ExpandableSection
        toggleContent={composeExpandable(
          'Target environments',
          'revisit-target-environments',
          'step-image-output',
        )}
        onToggle={(_event, isExpandedTargetEnvs) =>
          onToggleTargetEnvs(isExpandedTargetEnvs)
        }
        isExpanded={isExpandedTargetEnvs}
        isIndented
        data-testid='target-environments-expandable'
      >
        <Stack hasGutter>
          {environments.includes('aws') && (
            <StackItem>
              <TargetEnvAWSList />
            </StackItem>
          )}
          {environments.includes('gcp') && (
            <StackItem>
              <TargetEnvGCPList />
            </StackItem>
          )}
          {environments.includes('azure') && (
            <StackItem>
              <TargetEnvAzureList />
            </StackItem>
          )}
          {environments.includes('oci') && (
            <StackItem>
              <TargetEnvOciList />
            </StackItem>
          )}
          {environments.includes('vsphere') && (
            <StackItem>
              <Content>
                <Content component={ContentVariants.h3}>
                  {targetOptions.vsphere} (.vmdk)
                </Content>
                <TargetEnvOtherList />
              </Content>
            </StackItem>
          )}
          {environments.includes('vsphere-ova') && (
            <StackItem>
              <Content>
                <Content component={ContentVariants.h3}>
                  {targetOptions['vsphere-ova']} (.ova)
                </Content>
                <TargetEnvOtherList />
              </Content>
            </StackItem>
          )}
          {environments.includes('guest-image') && (
            <StackItem>
              <Content>
                <Content component={ContentVariants.h3}>
                  {targetOptions['guest-image']} (.qcow2)
                </Content>
                <TargetEnvOtherList />
              </Content>
            </StackItem>
          )}
          {environments.includes('image-installer') && (
            <StackItem>
              <Content>
                <Content component={ContentVariants.h3}>
                  {targetOptions['image-installer']} (.iso)
                </Content>
                <TargetEnvOtherList />
              </Content>
            </StackItem>
          )}
          {environments.includes('wsl') && (
            <StackItem>
              <Content>
                <Content component={ContentVariants.h3}>
                  WSL - {targetOptions.wsl} (.wsl)
                </Content>
                <TargetEnvOtherList />
              </Content>
            </StackItem>
          )}
        </Stack>
      </ExpandableSection>
      {isRhel(distribution) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Registration',
            'revisit-registration',
            'step-register',
          )}
          onToggle={(_event, isExpandedRegistration) =>
            onToggleRegistration(isExpandedRegistration)
          }
          isExpanded={isExpandedRegistration}
          isIndented
          data-testid='registration-expandable'
        >
          {registrationType === 'register-later' && <RegisterLaterList />}
          {registrationType === 'register-satellite' && (
            <RegisterSatelliteList />
          )}
          {registrationType.startsWith('register-now') && <RegisterNowList />}
        </ExpandableSection>
      )}

      {isPackageMode && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Security',
            'revisit-compliance',
            'step-oscap',
          )}
          onToggle={(_event, isExpandedSecurityDetail) =>
            onToggleSecurityDetails(isExpandedSecurityDetail)
          }
          isExpanded={isExpandedSecurityDetail}
          isIndented
          data-testid='compliance-detail-expandable'
        >
          <SecurityInformation />
        </ExpandableSection>
      )}
      {!hasWslTargetOnly && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'File system configuration',
            'revisit-file-system',
            'step-file-system',
          )}
          onToggle={(_event, isExpandedFSC) => onToggleFSC(isExpandedFSC)}
          isExpanded={isExpandedFSC}
          isIndented
          data-testid='file-system-configuration-expandable'
        >
          <FSCList />
        </ExpandableSection>
      )}
      {isPackageMode && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Content',
            'revisit-custom-repositories',
            'wizard-custom-repositories',
          )}
          onToggle={(_event, isExpandedContent) =>
            onToggleContent(isExpandedContent)
          }
          isExpanded={isExpandedContent}
          isIndented
          data-testid='content-expandable'
        >
          <ContentList />
        </ExpandableSection>
      )}
      {users.length > 0 && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Users',
            'revisit-users',
            wizardStepId,
          )}
          onToggle={(_event, isExpandedUsers) => onToggleUsers(isExpandedUsers)}
          isExpanded={isExpandedUsers}
          isIndented
          data-testid='users-expandable'
        >
          <UsersList />
        </ExpandableSection>
      )}
      {isPackageMode && (timezone || (ntpServers && ntpServers.length > 0)) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Timezone',
            'revisit-timezone',
            'wizard-timezone',
          )}
          onToggle={(_event, isExpandedTimezone) =>
            onToggleTimezone(isExpandedTimezone)
          }
          isExpanded={isExpandedTimezone}
          isIndented
          data-testid='timezone-expandable'
        >
          <TimezoneList />
        </ExpandableSection>
      )}
      {isPackageMode &&
        ((languages && languages.length > 0) ||
          (keyboard && keyboard.length > 0)) && (
          <ExpandableSection
            toggleContent={composeExpandable(
              'Locale',
              'revisit-locale',
              'wizard-locale',
            )}
            onToggle={(_event, isExpandedLocale) =>
              onToggleLocale(isExpandedLocale)
            }
            isExpanded={isExpandedLocale}
            isIndented
            data-testid='locale-expandable'
          >
            <LocaleList />
          </ExpandableSection>
        )}
      {hostname && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Hostname',
            'revisit-hostname',
            'wizard-hostname',
          )}
          onToggle={(_event, isExpandedHostname) =>
            onToggleHostname(isExpandedHostname)
          }
          isExpanded={isExpandedHostname}
          isIndented
          data-testid='hostname-expandable'
        >
          <HostnameList />
        </ExpandableSection>
      )}
      {(kernel.name || kernel.append.length > 0) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Kernel',
            'revisit-kernel',
            'wizard-kernel',
          )}
          onToggle={(_event, isExpandedKernel) =>
            onToggleKernel(isExpandedKernel)
          }
          isExpanded={isExpandedKernel}
          isIndented
          data-testid='kernel-expandable'
        >
          <KernelList />
        </ExpandableSection>
      )}
      {(firewall.ports.length > 0 ||
        firewall.services.disabled.length > 0 ||
        firewall.services.enabled.length > 0) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Firewall',
            'revisit-firewall',
            'wizard-firewall',
          )}
          onToggle={(_event, isExpandedFirewall) =>
            onToggleFirewall(isExpandedFirewall)
          }
          isExpanded={isExpandedFirewall}
          isIndented
          data-testid='firewall-expandable'
        >
          <FirewallList />
        </ExpandableSection>
      )}
      {(services.enabled.length > 0 ||
        services.disabled.length > 0 ||
        services.masked.length > 0) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Systemd services',
            'revisit-services',
            'wizard-services',
          )}
          onToggle={(_event, isExpandedServices) =>
            onToggleServices(isExpandedServices)
          }
          isExpanded={isExpandedServices}
          isIndented
          data-testid='services-expandable'
        >
          <ServicesList />
        </ExpandableSection>
      )}
      {aapRegistration.callbackUrl && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Ansible Automation Platform',
            'revisit-aap',
            'wizard-aap',
          )}
          onToggle={(_event, isExpandableAap) => onToggleAap(isExpandableAap)}
          isExpanded={isExpandedAap}
          isIndented
          data-testid='aap-expandable'
        >
          <RegisterAapList />
        </ExpandableSection>
      )}
      {!isOnPremise && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'First boot',
            'revisit-first-boot',
            'wizard-first-boot',
          )}
          onToggle={(_event, isExpandableFirstBoot) =>
            onToggleFirstBoot(isExpandableFirstBoot)
          }
          isExpanded={isExpandableFirstBoot}
          isIndented
          data-testid='firstboot-expandable'
        >
          <FirstBootList />
        </ExpandableSection>
      )}
      {(blueprintName || blueprintDescription) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Details',
            'revisit-details',
            'step-details',
          )}
          onToggle={(_event, isExpandedImageDetail) =>
            onToggleImageDetail(isExpandedImageDetail)
          }
          isExpanded={isExpandedImageDetail}
          isIndented
          data-testid='image-details-expandable'
        >
          <DetailsList />
        </ExpandableSection>
      )}
    </>
  );
};

export default Review;
