import React from 'react';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { screen } from '@testing-library/react';

import { renderWithRedux } from '@/test/testUtils';

import CustomWizardFooter from '../CustomWizardFooter';

const renderFooter = (
  props: Partial<React.ComponentProps<typeof CustomWizardFooter>> = {},
) => {
  return renderWithRedux(
    <Wizard>
      <WizardStep
        name='Test step'
        id='test-step'
        footer={
          <CustomWizardFooter hasErrors={false} isOnPremise={true} {...props} />
        }
      >
        Step content
      </WizardStep>
    </Wizard>,
  );
};

describe('CustomWizardFooter', () => {
  test('Next and Review image are enabled by default', async () => {
    renderFooter();

    expect(await screen.findByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Review image' })).toBeEnabled();
  });

  test('Next and Review image are disabled when disableNext is set', async () => {
    renderFooter({ disableNext: true });

    expect(await screen.findByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Review image' })).toBeDisabled();
  });
});
