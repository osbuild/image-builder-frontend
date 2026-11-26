import {
  AapRegistration,
  RegistrationOptions,
  RegistrationSlice,
  SatelliteRegistration,
} from './types';

export const emptyAapState: AapRegistration = {
  callbackUrl: '',
  hostConfigKey: '',
};

export const emptySatelliteState: SatelliteRegistration = {
  command: '',
  caCerts: [],
};

export const emptyRegistrationState: RegistrationOptions = {
  serverUrl: '',
  baseUrl: '',
  activationKey: '',
  orgId: '',
  insights: true,
  rhc: !process.env.IS_ON_PREMISE,
};

export const initialState: RegistrationSlice = {
  type: 'register-now',
  options: emptyRegistrationState,
};
