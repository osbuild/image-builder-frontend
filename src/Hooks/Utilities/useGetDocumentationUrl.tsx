import { useEffect, useState } from 'react';

import {
  IB_HOSTED_LIGHTSPEED_DOCUMENTATION_URL,
  IB_ON_PREMISE_OSBUILD_DOCUMENTATION_URL,
  IB_ON_PREMISE_RHEL10_DOCUMENTATION_URL,
  IB_ON_PREMISE_RHEL9_DOCUMENTATION_URL,
} from '../../constants';
import { selectIsOnPremise } from '../../store/envSlice';
import { useAppSelector } from '../../store/hooks';
import { getHostDistro } from '../../Utilities/getHostInfo';

export const useGetDocumentationUrl = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const [hostDistro, setHostDistro] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnPremise) return;

    async function runDetection() {
      const detected = await getHostDistro();
      setHostDistro(detected);
    }
    runDetection();
  }, []);

  // Hosted service (console) -> Lightspeed docs
  if (!isOnPremise) return IB_HOSTED_LIGHTSPEED_DOCUMENTATION_URL;
  // On-prem (cockpit): wait for host distro detection to avoid incorrect initial link
  if (hostDistro === null) {
    return IB_ON_PREMISE_OSBUILD_DOCUMENTATION_URL;
  }
  const effectiveDistro = hostDistro || '';
  // Fedora -> upstream/osbuild
  if (effectiveDistro.startsWith('fedora-')) {
    return IB_ON_PREMISE_OSBUILD_DOCUMENTATION_URL;
  }
  // RHEL by major version
  if (effectiveDistro.startsWith('rhel-9')) {
    return IB_ON_PREMISE_RHEL9_DOCUMENTATION_URL;
  }
  if (effectiveDistro.startsWith('rhel-10')) {
    return IB_ON_PREMISE_RHEL10_DOCUMENTATION_URL;
  }
  // Unknown -> upstream/osbuild
  return IB_ON_PREMISE_OSBUILD_DOCUMENTATION_URL;
};
