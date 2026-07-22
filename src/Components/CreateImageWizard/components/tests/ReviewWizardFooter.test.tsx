import React from 'react';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithRedux } from '@/test/testUtils';

import ReviewWizardFooter from '../ReviewWizardFooter';

vi.mock('@/Hooks', () => ({
  useCreateBPWithNotification: () => ({ isSuccess: false, reset: vi.fn() }),
  useUpdateBPWithNotification: () => ({ isSuccess: false, reset: vi.fn() }),
}));

vi.mock('@/Components/CreateImageWizard/utilities/useValidation', () => ({
  useBlueprintValidation: () => ({ isValid: false, firstErrorStepId: null }),
}));

vi.mock(
  '@/Components/CreateImageWizard/steps/Review/Footer/CreateDropdown',
  () => ({
    CreateSaveAndBuildBtn: () => null,
    CreateSaveButton: () => null,
  }),
);

vi.mock(
  '@/Components/CreateImageWizard/steps/Review/Footer/EditDropdown',
  () => ({
    EditSaveAndBuildBtn: () => null,
    EditSaveButton: () => null,
  }),
);

describe('ReviewWizardFooter', () => {
  it('clears pending inputs when going back', async () => {
    const { store } = renderWithRedux(
      <Wizard startIndex={2}>
        <WizardStep name='Advanced settings' id='advanced-settings-step'>
          Advanced settings
        </WizardStep>
        <WizardStep
          name='Review'
          id='review-step'
          footer={<ReviewWizardFooter />}
        >
          Review
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
