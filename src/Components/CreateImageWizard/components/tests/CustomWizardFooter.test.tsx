import React from 'react';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { fireEvent, screen } from '@testing-library/react';

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

  test('Back clears pending inputs', async () => {
    const { store } = renderWithRedux(
      <Wizard startIndex={2}>
        <WizardStep name='Previous step' id='previous-step'>
          Previous step
        </WizardStep>
        <WizardStep
          name='Current step'
          id='current-step'
          footer={<CustomWizardFooter hasErrors={false} isOnPremise />}
        >
          Current step
        </WizardStep>
      </Wizard>,
      {
        validation: {
          forceShowErrors: false,
          pendingInputs: ['hostname'],
        },
      },
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Back' }));

    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
  });
});
