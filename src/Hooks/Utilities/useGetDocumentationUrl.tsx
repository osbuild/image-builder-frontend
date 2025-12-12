import { useIsOnPremise } from './useIsOnPremise';

import {
  IB_DOCUMENTATION_URL,
  IB_ON_PREMISE_DOCUMENTATION_URL,
} from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { selectDistribution } from '../../store/wizardSlice';

export const useGetDocumentationUrl = () => {
  const distro = useAppSelector(selectDistribution);
  const isOnPremise = useIsOnPremise();

  // NOTE: we can turn `distro.startsWith('fedora-')`
  // if we feel like it's necessary. For the scope of
  // this PR, it's probably a little bit too much.
  const distroId = typeof distro === 'string' ? distro : '';
  return isOnPremise && distroId.startsWith('fedora-')
    ? IB_ON_PREMISE_DOCUMENTATION_URL
    : IB_DOCUMENTATION_URL;
};
