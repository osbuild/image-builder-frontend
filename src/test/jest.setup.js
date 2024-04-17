import 'whatwg-fetch';
//Needed for correct jest extends types
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';

import { server } from './mocks/server';

// ResizeObserver is needed for responsive Chart.js charts.
// As it's not defined in jsdom it needs to be mocked or polyfilled
// Following is the minimal mock implementation needed for
// the tests to run correctly
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// or with options:
failOnConsole({
  shouldFailOnWarn: false,
  silenceMessage: (errorMessage) => {
    if (
      // Upgrading @patternfly/react-core caused propTypes error in Pf4FormTemplate
      // https://github.com/data-driven-forms/react-forms/issues/1352
      errorMessage.includes(
        'Failed prop type: Invalid prop `FormWrapper` supplied to `FormTemplate`, expected one of type [function].'
      )
    ) {
      // eslint-disable-next-line no-console
      console.log(
        'Suppressed error',
        'Failed prop type: Invalid prop `FormWrapper` supplied to `FormTemplate`, expected one of type [function]',
        'see [https://github.com/data-driven-forms/react-forms/issues/1352]'
      );
      return true;
    }
    // TODO [2023-08] CreateImageWizard warnings to be fixed later.
    if (
      errorMessage.includes('CreateImageWizard') &&
      (errorMessage.includes(
        'Cannot update a component (`ReactFinalForm`) while rendering a different component (`TargetEnvironment`)'
      ) ||
        errorMessage.includes(
          'Cannot update a component (`TextField`) while rendering a different component (`TextField`). To locate the bad setState() call inside `TextField`'
        ) ||
        errorMessage.includes(
          'Cannot update a component (`TextField`) while rendering a different component (`FormSpy`)'
        ) ||
        errorMessage.includes(
          "Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application."
        ) ||
        // [2023-09] Suppresses an error that occurs on the GCP step of the Wizard.
        errorMessage.includes(
          'Warning: Cannot update a component (`ForwardRef(Field)`) while rendering a different component (`Radio`). To locate the bad setState() call inside `Radio`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render'
        ))
    ) {
      // eslint-disable-next-line no-console
      console.warn(errorMessage);
      return true;
    }
    return false;
  },
});

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn(() => true),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
