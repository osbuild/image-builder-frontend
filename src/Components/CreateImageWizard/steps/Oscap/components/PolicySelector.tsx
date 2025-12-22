import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';

import { useSelectorHandlers } from './useSelectorHandlers';

import {
  useGetComplianceCustomizationsQuery,
  useLazyGetComplianceCustomizationsQuery,
} from '../../../../../store/backendApi';
import {
  PolicyRead,
  usePoliciesQuery,
} from '../../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeFips,
  changeFscMode,
  clearKernelAppend,
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  selectDistribution,
  setCompliancePolicy,
  setOscapProfile,
} from '../../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../../utilities/hasSpecificTargetOnly';
import { removeBetaFromRelease } from '../removeBetaFromRelease';

type ComplianceSelectOptionPropType = {
  policy: PolicyRead;
};

type ComplianceSelectOptionValueType = {
  policyID?: string;
  title?: string;
  toString: () => string;
};

const ComplianceSelectOption = ({ policy }: ComplianceSelectOptionPropType) => {
  const selectObj = (
    policyID: string,
    title: string,
  ): ComplianceSelectOptionValueType => ({
    policyID,
    title,
    toString: () => title || 'None',
  });

  return (
    <SelectOption key={policy.id} value={selectObj(policy.id!, policy.title!)}>
      {policy.title}
    </SelectOption>
  );
};

type PolicySelectorProps = {
  isDisabled?: boolean;
};

const PolicySelector = ({ isDisabled = false }: PolicySelectorProps) => {
  const policyID = useAppSelector(selectCompliancePolicyID);
  const policyTitle = useAppSelector(selectCompliancePolicyTitle);
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const majorVersion = release.split('-')[1];
  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const {
    clearCompliancePackages,
    handleKernelAppend,
    handlePackages,
    handlePartitions,
    handleServices,
  } = useSelectorHandlers();

  const {
    data: policies,
    isFetching: isFetchingPolicies,
    isSuccess: isSuccessPolicies,
  } = usePoliciesQuery({
    filter: `os_major_version=${majorVersion}`,
    limit: 50,
    sortBy: ['title:asc'],
  });

  const { data: currentProfileData } = useGetComplianceCustomizationsQuery(
    {
      distribution: release,
      policy: policyID!,
    },
    { skip: !policyID },
  );

  const [trigger] = useLazyGetComplianceCustomizationsQuery();

  useEffect(() => {
    if (!policies || policies.data === undefined) {
      return;
    }

    if (policyID && !policyTitle) {
      for (const p of policies.data) {
        const pol = p as PolicyRead;
        if (pol.id === policyID) {
          dispatch(
            setCompliancePolicy({
              policyID: pol.id,
              policyTitle: pol.title,
            }),
          );
        }
      }
    }
  }, [isSuccessPolicies]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClear = () => {
    dispatch(
      setCompliancePolicy({
        policyID: undefined,
        policyTitle: undefined,
      }),
    );
    dispatch(setOscapProfile(undefined));
    clearCompliancePackages(currentProfileData?.packages || []);
    dispatch(changeFscMode('automatic'));
    handleServices(undefined);
    dispatch(clearKernelAppend());
    dispatch(changeFips(false));
  };

  const applyChanges = (selection: ComplianceSelectOptionValueType) => {
    if (selection.policyID === undefined) {
      // handle user has selected 'None' case
      handleClear();
    } else {
      setIsApplying(true);
      const oldOscapPackages = currentProfileData?.packages || [];
      trigger(
        {
          distribution: release,
          policy: selection.policyID,
        },
        true, // preferCacheValue
      )
        .unwrap()
        .then((response) => {
          const oscapPartitions = response.filesystem || [];
          const newOscapPackages = response.packages || [];
          handlePartitions(oscapPartitions);
          handlePackages(
            oldOscapPackages,
            newOscapPackages,
            'Required by chosen compliance policy',
          );
          handleServices(response.services);
          handleKernelAppend(response.kernel?.append);
          dispatch(changeFips(response.fips?.enabled || false));
          dispatch(
            setCompliancePolicy({
              policyID: selection.policyID,
              policyTitle: selection.title,
            }),
          );
        })
        .finally(() => setIsApplying(false));
    }
  };

  const handleSelect = (
    _event?: React.MouseEvent<Element, MouseEvent>,
    selection?: string | number,
  ) => {
    if (selection === undefined) return;

    applyChanges(selection as unknown as ComplianceSelectOptionValueType);
    setIsOpen(false);
  };

  const complianceOptions = () => {
    if (!policies || policies.data === undefined) {
      return [];
    }

    if (isFetchingPolicies) {
      return [
        <SelectOption key='compliance-loader' value='loader'>
          <Spinner size='lg' />
        </SelectOption>,
      ];
    }

    const res = [
      <SelectOption
        key='compliance-none-option'
        value={{ toString: () => 'None', compareTo: () => false }}
      >
        None
      </SelectOption>,
    ];
    for (const p of policies.data) {
      // there is a mismatch between API type and real data
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (p === undefined) {
        continue;
      }
      const pol = p as PolicyRead;
      res.push(<ComplianceSelectOption key={pol.id} policy={pol} />);
    }
    return res;
  };

  const toggleCompliance = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ouiaId='compliancePolicySelect'
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={
        isDisabled || isFetchingPolicies || hasWslTargetOnly || isApplying
      }
      isFullWidth
      style={{ maxWidth: 'none' }}
    >
      {isApplying ? (
        <>
          <Spinner size='sm' /> Applying policy...
        </>
      ) : (
        policyTitle || 'None'
      )}
    </MenuToggle>
  );

  return (
    <FormGroup>
      <Select
        isScrollable
        isOpen={isOpen}
        onSelect={handleSelect}
        onOpenChange={handleToggle}
        selected={policyID}
        toggle={toggleCompliance}
        shouldFocusFirstItemOnOpen={false}
      >
        <SelectList>{complianceOptions()}</SelectList>
      </Select>
    </FormGroup>
  );
};

export default PolicySelector;
