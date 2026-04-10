import { RegistrationType } from '@/store/slices';

export type REGISTER_NOW_OPTIONS =
  | 'register-now'
  | 'register-now-insights'
  | 'register-now-rhc';

export const isRegisterNowType = (
  type: RegistrationType,
): type is REGISTER_NOW_OPTIONS => {
  return type.startsWith('register-now');
};
