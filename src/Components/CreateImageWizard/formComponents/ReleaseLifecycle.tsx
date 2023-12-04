import React, { useContext } from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartStack,
} from '@patternfly/react-charts';
import { ExpandableSection, FormGroup, Text } from '@patternfly/react-core';

import {
  RELEASES,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9_FULL_SUPPORT,
  RHEL_9_MAINTENANCE_SUPPORT,
} from '../../../constants';
import isRhel from '../../../Utilities/isRhel';

const MajorReleasesLifecyclesChart = () => {
  return (
    <div style={{ height: '150px', width: '600px' }}>
      <Chart
        domainPadding={{ x: [30, 25] }}
        legendData={[{ name: 'Full support' }, { name: 'Maintenance support' }]}
        legendPosition="bottom"
        height={150}
        name="Release lifecycle"
        padding={{
          bottom: 55, // Adjusted to accommodate legend
          left: 70,
          right: 50,
          top: 10,
        }}
        scale={{ x: 'linear', y: 'time' }}
        width={600}
      >
        <ChartAxis />
        <ChartAxis dependentAxis showGrid />
        <ChartStack horizontal>
          <ChartBar
            barWidth={25}
            data={[
              {
                name: 'Full support',
                x: 'RHEL 8',
                y: new Date(RHEL_8_FULL_SUPPORT[1]),
                y0: new Date(RHEL_8_FULL_SUPPORT[0]),
              },
              {
                name: 'Full support',
                x: 'RHEL 9',
                y: new Date(RHEL_9_FULL_SUPPORT[1]),
                y0: new Date(RHEL_9_FULL_SUPPORT[0]),
              },
            ]}
          />
          <ChartBar
            barWidth={25}
            data={[
              {
                name: 'Maintenance support',
                x: 'RHEL 8',
                y: new Date(RHEL_8_MAINTENANCE_SUPPORT[1]),
                y0: new Date(RHEL_8_MAINTENANCE_SUPPORT[0]),
              },
              {
                name: 'Maintenance support',
                x: 'RHEL 9',
                y: new Date(RHEL_9_MAINTENANCE_SUPPORT[1]),
                y0: new Date(RHEL_9_MAINTENANCE_SUPPORT[0]),
              },
            ]}
          />
        </ChartStack>
      </Chart>
    </div>
  );
};

const toMonthAndYear = (dateString: string) => {
  const options = {
    year: 'numeric' as const,
    month: 'long' as const,
  };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
};

const ReleaseLifecycle = () => {
  const { getState } = useFormApi();
  const { currentStep } = useContext(WizardContext);
  const release = getState().values.release;
  const [isExpanded, setIsExpanded] = React.useState(true);

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  if (isRhel(release)) {
    if (currentStep.name === 'image-output') {
      return (
        <ExpandableSection
          toggleText={
            isExpanded
              ? 'Hide information about release lifecycle'
              : 'Show information about release lifecycle'
          }
          onToggle={onToggle}
          isExpanded={isExpanded}
        >
          <FormGroup label="Release lifecycle">
            <MajorReleasesLifecyclesChart />
          </FormGroup>
        </ExpandableSection>
      );
    } else if (currentStep.name === 'review') {
      return (
        <>
          <Text className="pf-v5-u-font-size-sm">
            {RELEASES.get(release)} will be supported through{' '}
            {release === 'rhel-93'
              ? toMonthAndYear(RHEL_9_FULL_SUPPORT[0])
              : toMonthAndYear(RHEL_8_FULL_SUPPORT[0])}
            , with optional ELS support through{' '}
            {release === 'rhel-93'
              ? toMonthAndYear(RHEL_9_MAINTENANCE_SUPPORT[0])
              : toMonthAndYear(RHEL_8_MAINTENANCE_SUPPORT[0])}
            .
          </Text>
          <FormGroup label="Release lifecycle">
            <MajorReleasesLifecyclesChart />
          </FormGroup>
          <br />
        </>
      );
    }
  }
};

export default ReleaseLifecycle;
