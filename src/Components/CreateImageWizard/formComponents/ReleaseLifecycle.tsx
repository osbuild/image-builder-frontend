import React, { useContext } from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import {
  Button,
  ExpandableSection,
  FormGroup,
  Panel,
  PanelMain,
  Text,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';

import {
  RELEASES,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9,
  RHEL_9_FULL_SUPPORT,
  RHEL_9_MAINTENANCE_SUPPORT,
} from '../../../constants';
import 'chartjs-adapter-moment';
import { toMonthAndYear } from '../../../Utilities/time';

Chart.register(annotationPlugin);
Chart.register(...registerables);

const currentDate = new Date().toString();

export const chartMajorVersionCfg = {
  data: {
    labels: ['RHEL 9', 'RHEL 8'],
    datasets: [
      {
        label: 'Full support',
        backgroundColor: '#0066CC',
        data: [
          {
            x: RHEL_9_FULL_SUPPORT,
            y: 'RHEL 9',
          },
          {
            x: RHEL_8_FULL_SUPPORT,
            y: 'RHEL 8',
          },
        ],
      },
      {
        label: 'Maintenance support',
        backgroundColor: '#8BC1F7',
        data: [
          {
            x: RHEL_9_MAINTENANCE_SUPPORT,
            y: 'RHEL 9',
          },
          {
            x: RHEL_8_MAINTENANCE_SUPPORT,
            y: 'RHEL 8',
          },
        ],
      },
    ],
  },
  options: {
    indexAxis: 'y' as const,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'year' as const,
        },
        min: '2019-01-01' as const,
        max: '2033-01-01' as const,
      },
      y: {
        stacked: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        position: 'bottom' as const,
      },
      annotation: {
        annotations: {
          today: {
            type: 'line' as const,
            xMin: currentDate,
            xMax: currentDate,
            borderColor: 'black',
            borderWidth: 2,
            borderDash: [8, 2],
          },
        },
      },
    },
  },
};

export const MajorReleasesLifecyclesChart = () => {
  return (
    <Panel>
      <PanelMain maxHeight="10rem">
        <Bar
          data-testid="release-lifecycle-chart"
          options={chartMajorVersionCfg.options}
          data={chartMajorVersionCfg.data}
        />
      </PanelMain>
    </Panel>
  );
};

const ReleaseLifecycle = () => {
  const { getState } = useFormApi();
  const { currentStep } = useContext(WizardContext);
  const release = getState().values.release;
  const [isExpanded, setIsExpanded] = React.useState(true);

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  if (release === RHEL_8) {
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
          isIndented
        >
          <FormGroup label="Release lifecycle">
            <MajorReleasesLifecyclesChart />
          </FormGroup>
          <br />
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={'https://access.redhat.com/support/policy/updates/errata'}
          >
            View Red Hat Enterprise Linux Life Cycle dates
          </Button>
        </ExpandableSection>
      );
    } else if (currentStep.name === 'review') {
      return (
        <>
          <Text className="pf-v5-u-font-size-sm">
            {RELEASES.get(release)} will be supported through{' '}
            {toMonthAndYear(RHEL_8_FULL_SUPPORT[1])}, with optional ELS support
            through {toMonthAndYear(RHEL_8_MAINTENANCE_SUPPORT[1])}. Consider
            building an image with {RELEASES.get(RHEL_9)} to extend the support
            period.
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
