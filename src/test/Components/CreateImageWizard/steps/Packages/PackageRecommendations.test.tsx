import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { vi } from 'vitest';

import PackageRecommendations from '../../../../../Components/CreateImageWizard/steps/Packages/PackageRecommendations';
import { RHEL_8, RHEL_9, RHEL_10 } from '../../../../../constants';
import {
  serviceReducer as reducer,
  serviceMiddleware as middleware,
} from '../../../../../store';
import { mockPkgRecommendations } from '../../../../fixtures/packages';

// Mock the analytics hook
const mockTrack = vi.fn();
vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  default: () => ({
    analytics: {
      track: mockTrack,
    },
    isBeta: () => false,
  }),
}));

// Mock API hooks
const mockUseRecommendPackageMutation = vi.fn();
const mockUseSearchRpmMutation = vi.fn();
const mockUseListRepositoriesQuery = vi.fn();

vi.mock('../../../../../store/imageBuilderApi', () => ({
  useRecommendPackageMutation: () => mockUseRecommendPackageMutation(),
}));

vi.mock('../../../../../store/contentSourcesApi', () => ({
  useSearchRpmMutation: () => mockUseSearchRpmMutation(),
  useListRepositoriesQuery: () => mockUseListRepositoriesQuery(),
}));

// Mock Redux selectors
const mockSelectDistribution = vi.fn();
const mockSelectArchitecture = vi.fn();
const mockSelectPackages = vi.fn();

vi.mock('../../../../../store/wizardSlice', () => ({
  selectDistribution: () => mockSelectDistribution(),
  selectArchitecture: () => mockSelectArchitecture(),
  selectPackages: () => mockSelectPackages(),
  addPackage: vi.fn(),
}));

vi.mock('../../../../../store/hooks', () => ({
  useAppSelector: (selector: unknown) => {
    if (selector === mockSelectDistribution) return RHEL_9;
    if (selector === mockSelectArchitecture) return 'x86_64';
    if (selector === mockSelectPackages) return [{ name: 'git' }];
    return null;
  },
  useAppDispatch: () => vi.fn(),
}));

vi.mock('../../../../../Utilities/useDebounce', () => ({
  default: (value: unknown) => value,
}));

// Helper function to render component with Redux store
const renderWithReduxStore = (
  component: React.ReactElement,
  preloadedState = {}
) => {
  const store = configureStore({
    reducer: reducer,
    middleware: middleware,
    preloadedState,
  });

  return render(<Provider store={store}>{component}</Provider>);
};

describe('PackageRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseListRepositoriesQuery.mockReturnValue({
      data: { data: [] },
      isSuccess: true,
    });

    mockUseSearchRpmMutation.mockReturnValue([
      vi.fn(),
      {
        data: [],
        isSuccess: false,
        isLoading: false,
      },
    ]);
  });

  describe('getDistributionForRecommendations function behavior', () => {
    test('should send correct distribution values for different RHEL versions', async () => {
      const mockFetchRecommendedPackages = vi.fn().mockResolvedValue({
        data: mockPkgRecommendations,
      });

      mockUseRecommendPackageMutation.mockReturnValue([
        mockFetchRecommendedPackages,
        {
          data: mockPkgRecommendations,
          isSuccess: true,
          isLoading: false,
          isError: false,
        },
      ]);

      // Test different RHEL distributions
      const testCases = [
        { input: RHEL_8, expected: 'rhel-8' },
        { input: RHEL_9, expected: 'rhel-9' },
        { input: RHEL_10, expected: 'rhel-10' },
        { input: 'rhel-8.5', expected: 'rhel-8' },
        { input: 'rhel-9.2', expected: 'rhel-9' },
        { input: 'unknown-distro', expected: 'rhel-9' }, // fallback
      ];

      for (const { input, expected } of testCases) {
        vi.mocked(mockSelectDistribution).mockReturnValue(input);

        renderWithReduxStore(<PackageRecommendations />);

        await waitFor(() => {
          expect(mockFetchRecommendedPackages).toHaveBeenCalledWith({
            recommendPackageRequest: {
              packages: ['git'],
              recommendedPackages: 5,
              distribution: expected,
            },
          });
        });

        vi.clearAllMocks();
        mockUseRecommendPackageMutation.mockReturnValue([
          mockFetchRecommendedPackages,
          {
            data: mockPkgRecommendations,
            isSuccess: true,
            isLoading: false,
            isError: false,
          },
        ]);
      }
    });
  });

  describe('API Request with distribution field', () => {
    test('should send distribution field in recommendations request', async () => {
      const mockFetchRecommendedPackages = vi.fn().mockResolvedValue({
        data: mockPkgRecommendations,
      });

      mockUseRecommendPackageMutation.mockReturnValue([
        mockFetchRecommendedPackages,
        {
          data: mockPkgRecommendations,
          isSuccess: true,
          isLoading: false,
          isError: false,
        },
      ]);

      vi.mocked(mockSelectDistribution).mockReturnValue(RHEL_9);
      vi.mocked(mockSelectPackages).mockReturnValue([
        { name: 'git' },
        { name: 'vim' },
      ]);

      renderWithReduxStore(<PackageRecommendations />);

      await waitFor(() => {
        expect(mockFetchRecommendedPackages).toHaveBeenCalledWith({
          recommendPackageRequest: {
            packages: ['git', 'vim'],
            recommendedPackages: 5,
            distribution: 'rhel-9',
          },
        });
      });
    });
  });

  describe('Analytics tracking with modelVersion', () => {
    test('should track analytics with distribution and modelVersion', async () => {
      const mockResponse = {
        data: {
          ...mockPkgRecommendations,
          modelVersion: 'rpm_rex_42',
        },
      };

      const mockFetchRecommendedPackages = vi
        .fn()
        .mockResolvedValue(mockResponse);

      mockUseRecommendPackageMutation.mockReturnValue([
        mockFetchRecommendedPackages,
        {
          data: mockResponse.data,
          isSuccess: true,
          isLoading: false,
          isError: false,
        },
      ]);

      vi.mocked(mockSelectDistribution).mockReturnValue(RHEL_9);
      vi.mocked(mockSelectPackages).mockReturnValue([{ name: 'git' }]);

      renderWithReduxStore(<PackageRecommendations />);

      await waitFor(() => {
        expect(mockTrack).toHaveBeenCalledWith(
          'image-builder - Package Recommendations Shown',
          {
            module: 'image-builder',
            isPreview: false,
            shownRecommendations: mockPkgRecommendations.packages,
            selectedPackages: ['git'],
            distribution: 'rhel-9',
            modelVersion: 'rpm_rex_42',
          }
        );
      });
    });

    test('should track analytics when adding single recommendation', async () => {
      const mockResponse = {
        data: {
          ...mockPkgRecommendations,
          modelVersion: 'rpm_rex_42',
        },
      };

      const mockFetchRecommendedPackages = vi
        .fn()
        .mockResolvedValue(mockResponse);

      mockUseRecommendPackageMutation.mockReturnValue([
        mockFetchRecommendedPackages,
        {
          data: mockResponse.data,
          isSuccess: true,
          isLoading: false,
          isError: false,
        },
      ]);

      vi.mocked(mockSelectDistribution).mockReturnValue(RHEL_8);
      vi.mocked(mockSelectPackages).mockReturnValue([{ name: 'curl' }]);

      renderWithReduxStore(<PackageRecommendations />);

      // Wait for recommendations to load
      await waitFor(() => {
        expect(screen.getByText('recommendedPackage1')).toBeInTheDocument();
      });

      // Click "Add package" button for first recommendation
      const addButton = screen.getAllByText('Add package')[0];
      addButton.click();

      await waitFor(() => {
        expect(mockTrack).toHaveBeenCalledWith(
          'image-builder - Recommended Package Added',
          expect.objectContaining({
            module: 'image-builder',
            isPreview: false,
            packageName: 'recommendedPackage1',
            selectedPackages: ['curl'],
            shownRecommendations: mockPkgRecommendations.packages,
            distribution: 'rhel-8',
            modelVersion: 'rpm_rex_42',
          })
        );
      });
    });
  });

  describe('Component rendering', () => {
    test('should display recommendations when packages are selected', async () => {
      const mockFetchRecommendedPackages = vi.fn().mockResolvedValue({
        data: mockPkgRecommendations,
      });

      mockUseRecommendPackageMutation.mockReturnValue([
        mockFetchRecommendedPackages,
        {
          data: mockPkgRecommendations,
          isSuccess: true,
          isLoading: false,
          isError: false,
        },
      ]);

      vi.mocked(mockSelectPackages).mockReturnValue([{ name: 'git' }]);

      renderWithReduxStore(<PackageRecommendations />);

      await waitFor(() => {
        expect(screen.getByText('recommendedPackage1')).toBeInTheDocument();
      });

      expect(screen.getByText('recommendedPackage2')).toBeInTheDocument();
      expect(screen.getByText('recommendedPackage3')).toBeInTheDocument();
    });

    test('should show empty state when no packages selected', async () => {
      vi.mocked(mockSelectPackages).mockReturnValue([]);

      renderWithReduxStore(<PackageRecommendations />);

      expect(
        screen.getByText('Select packages to generate recommendations.')
      ).toBeInTheDocument();
    });
  });
});
