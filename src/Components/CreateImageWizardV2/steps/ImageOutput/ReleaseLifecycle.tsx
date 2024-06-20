import React, { useState } from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { ExpandableSection } from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Panel } from '@patternfly/react-core/dist/dynamic/components/Panel';
import { PanelMain } from '@patternfly/react-core/dist/dynamic/components/Panel';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';

import {
  RELEASE_LIFECYCLE_URL,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9_FULL_SUPPORT,
  RHEL_9_MAINTENANCE_SUPPORT,
} from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import 'chartjs-adapter-moment';

Chart.register(annotationPlugin);
Chart.register(...registerables);

const currentDate = new Date().toISOString();

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
  const release = useAppSelector(selectDistribution);
  const [isExpanded, setIsExpanded] = useState(true);

  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    setIsExpanded(isExpanded);
  };

  if (release === RHEL_8) {
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
          href={RELEASE_LIFECYCLE_URL}
        >
          View Red Hat Enterprise Linux Life Cycle dates
        </Button>
      </ExpandableSection>
    );
  }
};

export default ReleaseLifecycle;
