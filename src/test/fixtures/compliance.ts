export const mockPolicies = {
  data: [
    {
      id: '393bca7e-5d2b-4646-a86c-373fc5c50d8b',
      title: 'CIS workstation l1',
      description: 'Fancy description',
      business_objective: null,
      compliance_threshold: 100,
      total_system_count: 0,
      type: 'policy',
      os_major_version: 8,
      profile_title:
        'CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation',
      ref_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
    },
    {
      id: '0ee9a781-b53f-4d9e-91e1-d75aed088c44',
      title: 'CIS workstation l2',
      description: 'Fancy description',
      compliance_threshold: 100,
      total_system_count: 100,
      type: 'policy',
      os_major_version: 8,
      profile_title:
        'CIS Red Hat Enterprise Linux 8 Benchmark for Level 2 - Workstation',
      ref_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l2',
    },
    {
      id: '88359aa5-ba7e-44d9-9048-02c7918ff58c',
      title: 'STIG GUI',
      description: 'Fancy description',
      compliance_threshold: 100,
      total_system_count: 30,
      type: 'policy',
      os_major_version: 8,
      profile_title: 'DISA STIG with GUI for Red Hat Enterprise Linux 8',
      ref_id: 'xccdf_org.ssgproject.content_profile_stig_gui',
    },
    {
      id: 'custom-policy-123',
      title: 'Custom CIS Policy (Partial Rules)',
      description: 'A customized policy where user removed some rules',
      compliance_threshold: 100,
      total_system_count: 5,
      type: 'policy',
      os_major_version: 8,
      profile_title:
        'Custom CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation',
      ref_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
    },
  ],
  meta: {
    total: 4,
  },
};
