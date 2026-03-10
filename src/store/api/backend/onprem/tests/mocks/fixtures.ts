import {
  type ComposerCreateBlueprintRequest,
  type ComposerImageRequest,
  type OpenScapProfile,
} from '@/store/api/backend';

// Base blueprint fixture - minimal blueprint without customizations
export const createMinimalBlueprint = (
  overrides?: Partial<ComposerCreateBlueprintRequest>,
): ComposerCreateBlueprintRequest => ({
  name: 'test-blueprint',
  description: 'Test description',
  distribution: 'rhel-9',
  customizations: {},
  image_requests: [],
  ...overrides,
});

// Blueprint with basic customizations
export const createBlueprintWithBasicCustomizations =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      packages: ['vim', 'git', 'curl'],
      hostname: 'my-server',
      users: [
        {
          name: 'admin',
          groups: ['wheel'],
          ssh_key: 'ssh-rsa AAAAB3...',
          hasPassword: false,
        },
      ],
    },
    image_requests: [],
  });

// Blueprint with subscription
export const createBlueprintWithSubscription =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      subscription: {
        organization: 12345,
        'activation-key': 'my-activation-key',
        'server-url': 'https://subscription.rhsm.redhat.com',
        'base-url': 'https://cdn.redhat.com',
        insights: true,
        rhc: false,
      },
    },
    image_requests: [],
  });

// Blueprint with subscription including optional fields
export const createBlueprintWithFullSubscription =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      subscription: {
        organization: 67890,
        'activation-key': 'key123',
        'server-url': 'https://server.example.com',
        'base-url': 'https://base.example.com',
        insights: false,
        rhc: true,
        insights_client_proxy: 'http://proxy.example.com:8080',
      },
    },
    image_requests: [],
  });

// Blueprint with subscription and other customizations
export const createBlueprintWithMixedCustomizations =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      packages: ['nginx'],
      hostname: 'webserver',
      subscription: {
        organization: 11111,
        'activation-key': 'web-key',
        'server-url': 'https://subscription.rhsm.redhat.com',
        'base-url': 'https://cdn.redhat.com',
        insights: true,
      },
    },
    image_requests: [],
  });

// Blueprint with users
export const createBlueprintWithUsers = (
  password: string,
): ComposerCreateBlueprintRequest => ({
  name: 'test-blueprint',
  description: 'Test description',
  distribution: 'rhel-9',
  customizations: {
    users: [
      {
        name: 'testuser',
        groups: ['wheel', 'docker'],
        ssh_key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...',
        password: password,
      },
      {
        name: 'anotheruser',
        groups: ['users'],
      },
    ],
  },
  image_requests: [],
});

// Blueprint with users and other customizations
export const createBlueprintWithUsersAndPackages =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      packages: ['htop'],
      hostname: 'server.example.com',
      users: [
        {
          name: 'admin',
          ssh_key: 'ssh-rsa KEY123',
        },
      ],
    },
    image_requests: [],
  });

// Blueprint with OpenSCAP profile
export const createBlueprintWithOpenScap =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      openscap: {
        profile_id: 'xccdf_org.ssgproject.content_profile_cis',
        profile_name: 'CIS Red Hat Enterprise Linux 9 Benchmark',
        profile_description: 'This profile defines a baseline...',
      } as OpenScapProfile,
    },
    image_requests: [],
  });

// Blueprint with OpenSCAP and packages
export const createBlueprintWithOpenScapAndPackages =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      packages: ['aide'],
      openscap: {
        profile_id: 'xccdf_org.ssgproject.content_profile_pci-dss',
        profile_name: 'PCI-DSS',
      } as OpenScapProfile,
    },
    image_requests: [],
  });

// Complex blueprint with all customizations
export const createSecureServerBlueprint =
  (): ComposerCreateBlueprintRequest => ({
    name: 'secure-server',
    description: 'Secure server blueprint',
    distribution: 'rhel-9',
    customizations: {
      packages: ['firewalld', 'aide', 'audit'],
      hostname: 'secure.example.com',
      users: [
        {
          name: 'secadmin',
          groups: ['wheel'],
          ssh_key: 'ssh-rsa AAAAB3...',
        },
      ],
      subscription: {
        organization: 54321,
        'activation-key': 'secure-key',
        'server-url': 'https://subscription.rhsm.redhat.com',
        'base-url': 'https://cdn.redhat.com',
        insights: true,
        rhc: true,
      },
      openscap: {
        profile_id: 'xccdf_org.ssgproject.content_profile_stig',
        profile_name: 'DISA STIG',
        profile_description: 'Security Technical Implementation Guide',
      } as OpenScapProfile,
    },
    image_requests: [],
  });

// Blueprint with packages only
export const createBlueprintWithPackages =
  (): ComposerCreateBlueprintRequest => ({
    name: 'test-blueprint',
    description: 'Test description',
    distribution: 'rhel-9',
    customizations: {
      packages: ['vim'],
    },
    image_requests: [],
  });

// Image request fixtures
export const createGuestImageRequest = (): ComposerImageRequest => ({
  architecture: 'x86_64',
  image_type: 'guest-image',
  upload_request: {
    type: 'aws.s3',
    options: {},
  },
});

export const createAmiImageRequest = (
  accountId = '123456789012',
): ComposerImageRequest => ({
  architecture: 'x86_64',
  image_type: 'ami',
  upload_request: {
    type: 'aws',
    options: {
      share_with_accounts: [accountId],
    },
  },
});

export const createAmiImageRequestAarch64 = (
  accountId = '999888777666',
): ComposerImageRequest => ({
  architecture: 'aarch64',
  image_type: 'ami',
  upload_request: {
    type: 'aws',
    options: {
      share_with_accounts: [accountId],
    },
  },
});

export const createAzureImageRequest = (): ComposerImageRequest => ({
  architecture: 'x86_64',
  image_type: 'vhd',
  upload_request: {
    type: 'azure',
    options: {
      tenant_id: 'tenant-123',
      subscription_id: 'sub-456',
      resource_group: 'my-rg',
    },
  },
});

export const createLocalImageRequest = (): ComposerImageRequest => ({
  architecture: 'x86_64',
  image_type: 'guest-image',
  upload_request: {
    type: 'local',
    options: {},
  },
});

// Distribution list for testing
export const testDistributions = [
  'rhel-8',
  'rhel-9',
  'rhel-10',
  'centos-9',
  'fedora-40',
];
