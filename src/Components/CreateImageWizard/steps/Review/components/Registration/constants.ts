import { REGISTER_NOW_OPTIONS } from './types';

const LIGHTSPEED = 'Enable predictive analytics and management capabilities';
const RHC = 'Enable remote remediations and system management with automation';

export const REGISTER_NOW_FEATURES: Record<REGISTER_NOW_OPTIONS, string[]> = {
  'register-now': ['Register with Red Hat Subscription Manager (RHSM)'],
  'register-now-insights': [LIGHTSPEED],
  'register-now-rhc': [LIGHTSPEED, RHC],
};
