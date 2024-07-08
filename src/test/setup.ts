import { server } from './mocks/server';
import 'vitest-canvas-mock';

// scrollTo is not defined in jsdom - needed for the navigation to the wizard
window.HTMLElement.prototype.scrollTo = function () {};

// ResizeObserver is not defined and needs to be mocked and stubbed
const MockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', MockResizeObserver);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
