import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
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
  changeCompliance,
  changeFips,
  changeFscMode,
  clearKernelAppend,
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  selectDistribution,
} from '../../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../../utilities/hasSpecificTargetOnly';
import { removeBetaFromRelease } from '../removeBetaFromRelease';

type ComplianceSelectOptionPropType = {
  policy: PolicyRead;
};

type ComplianceSelectOptionValueType = {
  policyID: string;
  profileID: string;
  title: string;
  toString: () => string;
};

const ComplianceSelectOption = ({ policy }: ComplianceSelectOptionPropType) => {
  const selectObj = (
    policyID: string,
    profileID: string,
    title: string,
  ): ComplianceSelectOptionValueType => ({
    policyID,
    profileID,
    title,
    toString: () => title || 'None',
  });

  const descr = (
    <>
      Threshold: {policy.compliance_threshold}
      <br />
      Active systems: {policy.total_system_count}
    </>
  );

  return (
    <SelectOption
      key={policy.id}
      value={selectObj(policy.id!, policy.ref_id!, policy.title!)}
      description={descr}
    >
      {policy.title}
    </SelectOption>
  );
};

const PolicySelector = () => {
  const policyID = useAppSelector(selectCompliancePolicyID);
  const policyTitle = useAppSelector(selectCompliancePolicyTitle);
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const majorVersion = release.split('-')[1];
  const hasWslTargetOnly = useHasSpecificTargetOnly('wsl');
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
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
            changeCompliance({
              policyID: pol.id,
              profileID: pol.ref_id,
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
      changeCompliance({
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      }),
    );
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
          dispatch(
            changeCompliance({
              profileID: selection.profileID,
              policyID: selection.policyID,
              policyTitle: selection.title,
            }),
          );
          dispatch(changeFips(response?.fips?.enabled || false));
        });
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
      isDisabled={isFetchingPolicies || hasWslTargetOnly}
      style={
        {
          width: '100%',
        } as React.CSSProperties
      }
    >
      {policyTitle || 'None'}
    </MenuToggle>
  );

  return (
    <FormGroup label='Policy'>
      <Select
        isScrollable
        isOpen={isOpen}
        onSelect={handleSelect}
        onOpenChange={handleToggle}
        selected={policyID}
        toggle={toggleCompliance}
        shouldFocusFirstItemOnOpen={false}
      >
        {complianceOptions()}
      </Select>
    </FormGroup>
  );
};

export default PolicySelector;
