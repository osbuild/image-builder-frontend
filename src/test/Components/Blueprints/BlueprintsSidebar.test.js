import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useFlag } from '@unleash/proxy-client-react';

import { renderWithReduxRouter } from '../../testUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) =>
    flag === 'image-builder.new-wizard.enabled' ? true : false
  ),
}));

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

describe('mocking unleash calls', () => {
  test('new wizard flag is set to true', () => {
    const experimentalWizard = useFlag('image-builder.new-wizard.enabled');
    expect(experimentalWizard).toBe(true);
  });
});

describe('Blueprint sidebar', () => {
  const user = userEvent.setup();
  test('renders BlueprintsSidebar component', async () => {
    await renderWithReduxRouter('', {});
    await screen.findByTestId('images-table');

    // Check if the search input is rendered
    await screen.findByPlaceholderText('Search by blueprint name');

    // Check if the blueprints are rendered
    screen.getByText('blueprint1');
    screen.getByText('blueprint2');
  });

  test('filters blueprints based on search input', async () => {
    renderWithReduxRouter('', {});
    await screen.findByTestId('images-table');

    // Enter search query
    const searchInput = await screen.findByPlaceholderText(
      'Search by blueprint name'
    );
    await user.type(searchInput, 'blueprint1');

    // Check if only the matching blueprint is rendered
    const blueprintCard1 = screen.getByText('blueprint1');
    expect(blueprintCard1).toBeInTheDocument();

    const blueprintCard2 = screen.queryByText('blueprint2');
    expect(blueprintCard2).not.toBeInTheDocument();
  });

  test('filters images based on selected blueprint', async () => {
    renderWithReduxRouter('', {});
    await screen.findByTestId('images-table');

    // Select first blueprint radio button
    const blueprintInput = screen.getAllByRole('radio')[0];
    await user.click(blueprintInput);

    // Check if the images are rendered
    const firstImage = screen.getByText('test-image-name');
    expect(firstImage).toBeInTheDocument();

    const secondImage = screen.getByRole('cell', {
      name: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
    });
    expect(secondImage).toBeInTheDocument();

    // expected this image to be filtered out
    const filteredBlueprint = screen.queryByText(
      'edbae1c2-62bc-42c1-ae0c-3110ab718f58'
    );
    expect(filteredBlueprint).not.toBeInTheDocument();
  });
});
