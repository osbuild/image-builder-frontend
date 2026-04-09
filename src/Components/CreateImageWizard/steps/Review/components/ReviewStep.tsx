import React, { useState } from 'react';

import {
  Button,
  ExpandableSection,
  Split,
  SplitItem,
  useWizardContext,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';

import './ReviewStep.scss';
import { useCustomizationRestrictions } from '@/store/api/distributions';
import {
  selectFirewall,
  selectHostname,
  selectImageTypes,
  selectIsImageMode,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectNtpServers,
  selectServices,
  selectTimezone,
  selectUserGroups,
  selectUsers,
  UserGroup,
} from '@/store/slices/wizard';

import {
  ContentList,
  FirewallList,
  FirstBootList,
  FSCList,
  GroupsList,
  HostnameList,
  KernelList,
  LocaleList,
  ServicesList,
  TimezoneList,
  UsersList,
} from './ReviewStepTextLists';

import { useAppSelector } from '../../../../../store/hooks';

const Review = () => {
  const { goToStepById } = useWizardContext();

  const isImageMode = useAppSelector(selectIsImageMode);
  const environments = useAppSelector(selectImageTypes);
  const hostname = useAppSelector(selectHostname);
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);
  const firewall = useAppSelector(selectFirewall);
  const services = useAppSelector(selectServices);
  const users = useAppSelector(selectUsers);
  const userGroups = useAppSelector(selectUserGroups);
  const kernel = useAppSelector(selectKernel);

  const [isExpandedFSC, setIsExpandedFSC] = useState(true);
  const [isExpandedContent, setIsExpandedContent] = useState(true);
  const [isExpandedTimezone, setIsExpandedTimezone] = useState(true);
  const [isExpandedLocale, setIsExpandedLocale] = useState(true);
  const [isExpandedHostname, setIsExpandedHostname] = useState(true);
  const [isExpandedKernel, setIsExpandedKernel] = useState(true);
  const [isExpandedFirewall, setIsExpandedFirewall] = useState(true);
  const [isExpandedServices, setIsExpandedServices] = useState(true);
  const [isExpandableFirstBoot, setIsExpandedFirstBoot] = useState(true);
  const [isExpandedUsers, setIsExpandedUsers] = useState(true);
  const [isExpandedGroups, setIsExpandedGroups] = useState(true);

  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: environments,
  });

  const onToggleFSC = (isExpandedFSC: boolean) =>
    setIsExpandedFSC(isExpandedFSC);
  const onToggleContent = (isExpandedContent: boolean) =>
    setIsExpandedContent(isExpandedContent);
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
  const onToggleGroups = (isExpandedGroups: boolean) =>
    setIsExpandedGroups(isExpandedGroups);

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

  const filterNonEmptyGroups = (groups: UserGroup[]) => {
    return groups.filter((group) => group.name.trim());
  };

  return (
    <>
      {!restrictions.filesystem.shouldHide && (
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
      {!restrictions.repositories.shouldHide && (
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
      {!restrictions.users.shouldHide && users.length > 0 && (
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
      {!restrictions.users.shouldHide &&
        filterNonEmptyGroups(userGroups).length > 0 && (
          <ExpandableSection
            toggleContent={composeExpandable(
              'Groups',
              'revisit-groups',
              wizardStepId,
            )}
            onToggle={(_event, isExpandedGroups) =>
              onToggleGroups(isExpandedGroups)
            }
            isExpanded={isExpandedGroups}
            isIndented
            data-testid='groups-expandable'
          >
            <GroupsList groups={filterNonEmptyGroups(userGroups)} />
          </ExpandableSection>
        )}
      {!restrictions.timezone.shouldHide &&
        (timezone || (ntpServers && ntpServers.length > 0)) && (
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
      {!restrictions.locale.shouldHide &&
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
      {!restrictions.hostname.shouldHide && hostname && (
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
      {!restrictions.kernel.shouldHide &&
        (kernel.name || kernel.append.length > 0) && (
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
      {!restrictions.firewall.shouldHide &&
        (firewall.ports.length > 0 ||
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
      {!restrictions.services.shouldHide &&
        (services.enabled.length > 0 ||
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
      {!restrictions.firstBoot.shouldHide && (
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
    </>
  );
};

export default Review;
