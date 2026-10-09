import React from 'react';

import {
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Spinner,
} from '@patternfly/react-core';

import { useSecuritySummary } from '@/store/api/backend';
import { PolicyRead, usePolicyQuery } from '@/store/api/compliance';
import { useAppSelector } from '@/store/hooks';
import { selectCompliancePolicyID } from '@/store/slices/wizard';

const PolicyDetails = (): JSX.Element => {
  const compliancePolicyID = useAppSelector(selectCompliancePolicyID);

  const {
    data: policyInfo,
    isFetching: isFetchingPolicyInfo,
    isSuccess: isSuccessPolicyInfo,
    error: policyError,
  } = usePolicyQuery(
    {
      policyId: compliancePolicyID || '',
    },
    {
      skip: !compliancePolicyID,
    },
  );

  const isPolicyDataLoading = !!compliancePolicyID && isFetchingPolicyInfo;
  const shouldShowData =
    !!compliancePolicyID && isSuccessPolicyInfo && !policyError;
  const hasCriticalError = !!compliancePolicyID && !!policyError;

  const policy = policyInfo?.data as PolicyRead | undefined;

  const { packages, services, kernel, filesystem, complianceError } =
    useSecuritySummary();

  return (
    <>
      {isPolicyDataLoading && <Spinner size='lg' />}
      {shouldShowData && (
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Policy type</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.type ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Policy description</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.description ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Business objective</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.business_objective ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Compliance threshold</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.compliance_threshold !== undefined
                ? `${policy.compliance_threshold}%`
                : '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {packages.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>Added packages</DescriptionListTerm>
              <DescriptionListDescription>
                <LabelGroup numLabels={7} aria-label='Added packages'>
                  {packages.map((pkg) => (
                    <Label variant='outline' key={pkg}>
                      {pkg}
                    </Label>
                  ))}
                </LabelGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {filesystem.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>Included partitioning</DescriptionListTerm>
              <DescriptionListDescription>
                <LabelGroup numLabels={7} aria-label='Included partitioning'>
                  {filesystem.map((fs) => (
                    <Label variant='outline' key={fs.mountpoint}>
                      {fs.mountpoint}
                    </Label>
                  ))}
                </LabelGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {kernel.append.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>Kernel arguments</DescriptionListTerm>
              <DescriptionListDescription>
                <LabelGroup numLabels={7} aria-label='Kernel arguments'>
                  {kernel.append.map((arg) => (
                    <Label variant='outline' key={arg}>
                      {arg}
                    </Label>
                  ))}
                </LabelGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {(services.enabled.length > 0 || services.masked.length > 0) && (
            <DescriptionListGroup>
              <DescriptionListTerm>Systemd services</DescriptionListTerm>
              <DescriptionListDescription>
                {services.enabled.length > 0 && (
                  <LabelGroup
                    numLabels={7}
                    categoryName='Enabled services'
                    aria-label='Enabled services'
                  >
                    {services.enabled.map((svc) => (
                      <Label variant='outline' key={svc}>
                        {svc}
                      </Label>
                    ))}
                  </LabelGroup>
                )}
                {services.masked.length > 0 && (
                  <LabelGroup
                    numLabels={7}
                    categoryName='Masked services'
                    aria-label='Masked services'
                  >
                    {services.masked.map((svc) => (
                      <Label variant='outline' key={svc}>
                        {svc}
                      </Label>
                    ))}
                  </LabelGroup>
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      )}
      {(hasCriticalError || !!complianceError) && (
        <Content component={ContentVariants.p} className='pf-v6-u-color-200'>
          {hasCriticalError
            ? 'Unable to load policy details. Please try again.'
            : 'Unable to load policy customizations. Please try again.'}
        </Content>
      )}
    </>
  );
};

export default PolicyDetails;
