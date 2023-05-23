import 'whatwg-fetch';
import { server } from './mocks/server';

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn(() => true),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Upgrading @patternfly/react-core caused propTypes error in Pf4FormTemplate
// https://github.com/data-driven-forms/react-forms/issues/1352
const filter1 = (args) => {
  if (
    args[2] ===
    'Invalid prop `FormWrapper` supplied to `FormTemplate`, expected one of type [function].'
  ) {
    return [true, args[2]];
  }
  return [false, null];
};

class FilteredConsole {
  constructor(console) {
    this.console = console;
    this.filters = [filter1];
  }

  logSuppressedError(err) {
    this.console.info('Suppressed error: ', err);
  }

  filter(...args) {
    for (const fn of this.filters) {
      const [f, msg] = fn(args);
      if (f) {
        this.logSuppressedError(msg);
        return true;
      }
    }
    return false;
  }

  log(...args) {
    this.console.log(...args);
  }

  info(...args) {
    this.console.info(...args);
  }

  warn(...args) {
    if (!this.filter(...args)) this.console.warn(...args);
  }

  error(...args) {
    if (!this.filter(...args)) this.console.error(...args);
  }
}

window.console = new FilteredConsole(window.console);
