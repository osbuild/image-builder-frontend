import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nodeFetch, { Request, Response } from 'node-fetch';

import { renderWithReduxRouter } from '../../test/testUtils';

Object.assign(global, { fetch: nodeFetch, Request, Response });

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'stage',
  }),
}));

window.HTMLElement.prototype.scrollTo = function () {};

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'image-builder.import.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

const BLUEPRINT_JSON = `{
    "customizations": {
      "files": [
      ],
      "kernel": {
      },
      "openscap": {
      },
      "packages": [
        "aide",
        "sudo",
        "audit",
        "rsyslog",
        "firewalld",
        "nftables",
        "libselinux"
      ],
      "services": {
        "enabled": [
          "crond",
          "firewalld",
          "systemd-journald",
          "rsyslog",
          "auditd"
        ]
      },
      "subscription": {
      }
    },
    "description": "Tested blueprint",
    "distribution": "rhel-93",
    "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
    "image_requests": [
      {
        "architecture": "aarch64",
        "image_type": "aws",
        "upload_request": {
          "options": {
            "share_with_sources": [
              "473980"
            ]
          },
          "type": "aws"
        }
      }
    ],
    "name": "Blueprint test"
  }`;

const INVALID_JSON = `{
  "name": "Blueprint test"
}`;

const INVALID_ARCHITECTURE_JSON = `{
    "customizations": {
      "files": [
      ],
      "kernel": {
      },
      "openscap": {
      },
      "packages": [
        "aide",
        "sudo",
        "audit",
        "rsyslog",
        "firewalld",
        "nftables",
        "libselinux"
      ],
      "services": {
        "enabled": [
          "crond",
          "firewalld",
          "systemd-journald",
          "rsyslog",
          "auditd"
        ]
      },
      "subscription": {
      }
    },
    "description": "Tested blueprint",
    "distribution": "rhel-93",
    "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
    "image_requests": [
      {
        "architecture": "aaaaa",
        "image_type": "aws",
        "upload_request": {
          "options": {
            "share_with_sources": [
              "473980"
            ]
          },
          "type": "aws"
        }
      }
    ],
    "name": "Blueprint test"
  }`;

const INVALID_IMAGE_TYPE_JSON = `{
    "customizations": {
      "files": [
      ],
      "kernel": {
      },
      "openscap": {
      },
      "packages": [
        "aide",
        "sudo",
        "audit",
        "rsyslog",
        "firewalld",
        "nftables",
        "libselinux"
      ],
      "services": {
        "enabled": [
          "crond",
          "firewalld",
          "systemd-journald",
          "rsyslog",
          "auditd"
        ]
      },
      "subscription": {
      }
    },
    "description": "Tested blueprint",
    "distribution": "rhel-93",
    "id": "052bf998-7955-45ad-952d-49ce3573e0b7",
    "image_requests": [
      {
        "architecture": "aaaaa",
        "image_type": "aws",
        "upload_request": {
          "options": {
            "share_with_sources": [
              "473980"
            ]
          },
          "type": "aws"
        }
      }
    ],
    "name": "Blueprint test"
  }`;

const uploadFile = async (filename: string, content: string): Promise<void> => {
  const user = userEvent.setup();
  const fileInput: HTMLElement | null =
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (fileInput) {
    const file = new File([content], filename, { type: 'application/json' });
    user.upload(fileInput, file);
  }
};

describe('Import model', () => {
  const user = userEvent.setup();

  test('renders import component', async () => {
    renderWithReduxRouter('', {});
    const importButton = await screen.findByTestId('import-blueprint-button');
    await waitFor(() => expect(importButton).toBeInTheDocument());
  });

  const setUp = async () => {
    renderWithReduxRouter('', {});
    const importBlueprintBtn = await screen.findByTestId(
      'import-blueprint-button'
    );
    await waitFor(() => user.click(importBlueprintBtn));
    const reviewButton = await screen.findByRole('button', {
      name: /review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toHaveClass('pf-m-disabled'));
  };

  test('should show alert on invalid blueprint', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });

  test('should show alert on invalid blueprint incorrect architecture', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_ARCHITECTURE_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });

  test('should show alert on invalid blueprint incorrect image type', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, INVALID_IMAGE_TYPE_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    expect(reviewButton).toHaveClass('pf-m-disabled');
    const helperText = await screen.findByText(
      /not compatible with the blueprints format\./i
    );
    await waitFor(() => expect(helperText).toBeInTheDocument());
  });

  test('should enable button on correct blueprint and go to wizard', async () => {
    await setUp();
    await uploadFile(`blueprints.json`, BLUEPRINT_JSON);
    const reviewButton = screen.getByTestId('import-blueprint-finish');
    await waitFor(() => expect(reviewButton).not.toHaveClass('pf-m-disabled'));
    user.click(reviewButton);

    await waitFor(async () =>
      expect(
        await screen.findByText('Image output', { selector: 'h1' })
      ).toBeInTheDocument()
    );
  });
});
