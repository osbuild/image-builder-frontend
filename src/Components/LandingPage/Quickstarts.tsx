import React, { useState } from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { ExpandableSection } from '@patternfly/react-core/dist/dynamic/components/ExpandableSection';
import ArrowRightIcon from '@patternfly/react-icons/dist/dynamic/icons/arrow-right-icon';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

export const Quickstarts = () => {
  const [showHint, setShowHint] = useState(true);

  const { quickStarts } = useChrome();
  const activateQuickstart = (qs: string) => () =>
    quickStarts.activateQuickstart(qs);

  return (
    <ExpandableSection
      className="pf-m-light pf-u-mb-xl expand-section"
      toggleText="Help get started with new features"
      onToggle={(_event, val) => setShowHint(val)}
      isExpanded={showHint}
      displaySize="lg"
    >
      <p className="pf-u-pt-sm">
        <Button
          icon={<ArrowRightIcon />}
          iconPosition="right"
          variant="link"
          isInline
          component="a"
          onClick={activateQuickstart('insights-launch-aws')}
          className="pf-u-font-weight-bold"
        >
          Launch an AWS Image
        </Button>
      </p>
      <p className="pf-u-pt-sm">
        <Button
          icon={<ArrowRightIcon />}
          iconPosition="right"
          variant="link"
          isInline
          component="a"
          onClick={activateQuickstart('insights-launch-azure')}
          className="pf-u-font-weight-bold"
        >
          Launch an Azure Image
        </Button>
      </p>
      <p className="pf-u-pt-sm">
        <Button
          icon={<ArrowRightIcon />}
          iconPosition="right"
          variant="link"
          isInline
          component="a"
          onClick={activateQuickstart('insights-launch-gcp')}
          className="pf-u-font-weight-bold"
        >
          Launch a GCP Image
        </Button>
      </p>
      <p className="pf-u-pt-sm">
        <Button
          icon={<ArrowRightIcon />}
          iconPosition="right"
          variant="link"
          isInline
          component="a"
          onClick={activateQuickstart('insights-custom-repos')}
          className="pf-u-font-weight-bold"
        >
          Build an Image with Custom Content
        </Button>
      </p>
    </ExpandableSection>
  );
};

export default Quickstarts;
