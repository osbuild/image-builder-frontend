import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { selectImageSource as selectImageSourceState } from '@/store/wizardSlice';
import { clickWithWait, createUser } from '@/test/testUtils';

import {
  clickRefreshImageSources,
  openImageSourceSelect,
  renderImageSourceSelect,
  selectImageSource,
  togglePullInfoSection,
} from './helpers';
import { mockPodmanImages } from './mocks';

const mockRefetch = vi.fn();
const mockUsePodmanImagesQuery = vi.fn();

vi.mock('@/store/cockpit/cockpitApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/store/cockpit/cockpitApi')>();
  return {
    ...actual,
    usePodmanImagesQuery: () => mockUsePodmanImagesQuery(),
  };
});

describe('ImageSourceSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePodmanImagesQuery.mockReturnValue({
      data: mockPodmanImages,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
  });

  describe('Rendering', () => {
    test('displays image source label with required indicator', async () => {
      renderImageSourceSelect();

      expect(await screen.findByText('Image source')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('displays select with placeholder when no image selected', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', { name: /select an image/i }),
      ).toBeInTheDocument();
    });

    test('displays expandable section for pull info', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', {
          name: /show information about pulling images/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays refresh button', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', { name: /refresh image sources/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUsePodmanImagesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: mockRefetch,
      });
    });

    test('displays loading spinner and disabled toggle when loading', async () => {
      renderImageSourceSelect();

      const toggle = await screen.findByRole('button', {
        name: /loading images/i,
      });
      expect(toggle).toBeDisabled();
    });

    test('disables refresh button when loading', async () => {
      renderImageSourceSelect();

      const refreshButton = await screen.findByRole('button', {
        name: /refresh image sources/i,
      });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockUsePodmanImagesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });
    });

    test('displays error alert when query fails', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('heading', { name: /error listing images/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/unable to list podman images/i),
      ).toBeInTheDocument();
    });

    test('does not display expandable section when error', async () => {
      renderImageSourceSelect();

      await screen.findByRole('heading', { name: /error listing images/i });

      expect(
        screen.queryByRole('button', {
          name: /show information about pulling images/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('No Images State', () => {
    beforeEach(() => {
      mockUsePodmanImagesQuery.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });
    });

    test('displays "No images found" in dropdown when no images available', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      expect(
        await screen.findByRole('option', { name: /no images found/i }),
      ).toBeInTheDocument();
    });

    test('auto-expands pull info section when no images', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', {
          name: /hide information about pulling images/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays warning alert when no images found', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('heading', { name: /no images found/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Image Selection', () => {
    test('displays available images in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      expect(
        await screen.findByRole('option', {
          name: /red hat enterprise linux \(rhel - bootc\) 10\.0/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /red hat enterprise linux \(rhel - bootc\) latest/i,
        }),
      ).toBeInTheDocument();
    });

    test('selects image and updates redux state', async () => {
      const { store } = renderImageSourceSelect();
      const user = createUser();

      await selectImageSource(
        user,
        /red hat enterprise linux \(rhel - bootc\) 10\.0/i,
      );

      expect(selectImageSourceState(store.getState())).toBe(
        'registry.redhat.io/rhel10/rhel-bootc:10.0',
      );
    });

    test('displays selected image in toggle', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await selectImageSource(
        user,
        /red hat enterprise linux \(rhel - bootc\) 10\.0/i,
      );

      expect(
        await screen.findByRole('button', {
          name: /red hat enterprise linux \(rhel - bootc\) 10\.0/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays FROM helper text after selection', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await selectImageSource(
        user,
        /red hat enterprise linux \(rhel - bootc\) 10\.0/i,
      );

      expect(
        await screen.findByText(
          /from: registry\.redhat\.io\/rhel10\/rhel-bootc:10\.0/i,
        ),
      ).toBeInTheDocument();
    });

    test('closes dropdown after selection', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const option = await screen.findByRole('option', {
        name: /red hat enterprise linux \(rhel - bootc\) 10\.0/i,
      });
      await clickWithWait(user, option);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    test('calls refetch when refresh button clicked', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await clickRefreshImageSources(user);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Expandable Section', () => {
    test('expands pull info section when clicked', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);

      expect(
        await screen.findByRole('button', {
          name: /hide information about pulling images/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays pull command in expanded section', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);

      expect(await screen.findByText(/sudo podman pull/i)).toBeInTheDocument();
    });

    test('displays info alert when images are available', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);

      expect(
        await screen.findByRole('heading', { name: /note on pulling images/i }),
      ).toBeInTheDocument();
    });

    test('collapses section when clicked again', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);
      await togglePullInfoSection(user);

      expect(
        await screen.findByRole('button', {
          name: /show information about pulling images/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
