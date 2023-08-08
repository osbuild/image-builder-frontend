import 'whatwg-fetch';
import failOnConsole from 'jest-fail-on-console';

import { server } from './mocks/server';

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
