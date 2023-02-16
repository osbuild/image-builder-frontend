import 'whatwg-fetch';

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn(),
}));
