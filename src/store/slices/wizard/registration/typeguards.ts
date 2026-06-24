import { REGISTER_NOW_TYPES } from './constants';
import type { RegisterNowType, RegistrationType } from './types';

export const isRegisterNowType = (
  type: RegistrationType,
): type is RegisterNowType => {
  return REGISTER_NOW_TYPES.includes(type as RegisterNowType);
};
