import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const GLOBAL_PERMISSIONS = ['provisioning:reservation:write'];
const APP = 'provisioning';

const useProvisioningPermissions = () => {
  const { hasAccess: hasAWSAccess, isLoading: awsLoading } = usePermissions(
    APP,
    [...GLOBAL_PERMISSIONS, 'provisioning:reservation.aws:write'],
    false,
    true,
  );
  const { hasAccess: hasAzureAccess, isLoading: azureLoading } = usePermissions(
    APP,
    [...GLOBAL_PERMISSIONS, 'provisioning:reservation.azure:write'],
    false,
    true,
  );
  const { hasAccess: hasGCPAccess, isLoading: gcpLoading } = usePermissions(
    APP,
    [...GLOBAL_PERMISSIONS, 'provisioning:reservation.gcp:write'],
    false,
    true,
  );
  const isLoading = awsLoading || azureLoading || gcpLoading;
  return {
    permissions: {
      aws: hasAWSAccess,
      azure: hasAzureAccess,
      gcp: hasGCPAccess,
    },
    isLoading,
  };
};

export default useProvisioningPermissions;
