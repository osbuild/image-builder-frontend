import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { v4 as uuidv4 } from 'uuid';

import {
  PolicyRead,
  usePoliciesQuery,
} from '../../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  Filesystem,
  Services,
  useGetOscapCustomizationsForPolicyQuery,
  useLazyGetOscapCustomizationsForPolicyQuery,
} from '../../../../../store/imageBuilderApi';
import {
  addKernelArg,
  addPackage,
  addPartition,
  changeCompliance,
  changeDisabledServices,
  changeEnabledServices,
  changeFileSystemConfigurationType,
  changeMaskedServices,
  clearKernelAppend,
  clearPartitions,
  removePackage,
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  selectDistribution,
} from '../../../../../store/wizardSlice';
import { useHasSpecificTargetOnly } from '../../../utilities/hasSpecificTargetOnly';
import { parseSizeUnit } from '../../../utilities/parseSizeUnit';
import { Partition, Units } from '../../FileSystem/components/FileSystemTable';
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
    title: string
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
    data: policies,
    isFetching: isFetchingPolicies,
    isSuccess: isSuccessPolicies,
  } = usePoliciesQuery({
    filter: `os_major_version=${majorVersion}`,
  });

  const { data: currentProfileData } = useGetOscapCustomizationsForPolicyQuery(
    {
      distribution: release,
      policy: policyID!,
    },
    { skip: !policyID }
  );

  const [trigger] = useLazyGetOscapCustomizationsForPolicyQuery();

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
            })
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
      })
    );
    clearOscapPackages(currentProfileData?.packages || []);
    dispatch(changeFileSystemConfigurationType('automatic'));
    handleServices(undefined);
    dispatch(clearKernelAppend());
  };

  const handlePackages = (
    oldOscapPackages: string[],
    newOscapPackages: string[]
  ) => {
    clearOscapPackages(oldOscapPackages);

    for (const pkg of newOscapPackages) {
      dispatch(
        addPackage({
          name: pkg,
          summary: 'Required by chosen compliance policy',
          repository: 'distro',
        })
      );
    }
  };

  const clearOscapPackages = (oscapPackages: string[]) => {
    for (const pkg of oscapPackages) {
      dispatch(removePackage(pkg));
    }
  };

  const handlePartitions = (oscapPartitions: Filesystem[]) => {
    dispatch(clearPartitions());

    const newPartitions = oscapPartitions.map((filesystem) => {
      const [size, unit] = parseSizeUnit(filesystem.min_size);
      const partition: Partition = {
        mountpoint: filesystem.mountpoint,
        min_size: size.toString(),
        unit: unit as Units,
        id: uuidv4(),
      };
      return partition;
    });

    if (newPartitions.length > 0) {
      dispatch(changeFileSystemConfigurationType('manual'));
      for (const partition of newPartitions) {
        dispatch(addPartition(partition));
      }
    }
  };

  const handleServices = (services: Services | undefined) => {
    dispatch(changeEnabledServices(services?.enabled || []));
    dispatch(changeMaskedServices(services?.masked || []));
    dispatch(changeDisabledServices(services?.disabled || []));
  };

  const handleKernelAppend = (kernelAppend: string | undefined) => {
    dispatch(clearKernelAppend());

    if (kernelAppend) {
      const kernelArgsArray = kernelAppend.split(' ');
      for (const arg of kernelArgsArray) {
        dispatch(addKernelArg(arg));
      }
    }
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
        true // preferCacheValue
      )
        .unwrap()
        .then((response) => {
          const oscapPartitions = response.filesystem || [];
          const newOscapPackages = response.packages || [];
          handlePartitions(oscapPartitions);
          handlePackages(oldOscapPackages, newOscapPackages);
          handleServices(response.services);
          handleKernelAppend(response.kernel?.append);
          dispatch(
            changeCompliance({
              profileID: selection.profileID,
              policyID: selection.policyID,
              policyTitle: selection.title,
            })
          );
        });
    }
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent>,
    selection: string
  ) => {
    if (selection) {
      applyChanges(selection as unknown as ComplianceSelectOptionValueType);
      setIsOpen(false);
    }
  };

  const complianceOptions = () => {
    if (!policies || policies.data === undefined) {
      return [];
    }

    const res = [
      <SelectOption
        key="compliance-none-option"
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
      ouiaId="compliancePolicySelect"
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
    <FormGroup label="Policy">
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
