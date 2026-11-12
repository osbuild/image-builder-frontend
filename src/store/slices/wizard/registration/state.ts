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
};

export const emptyRegistrationState: RegistrationOptions = {
  serverUrl: '',
  baseUrl: '',
};

export const initialState: RegistrationSlice = {
  type: process.env.IS_ON_PREMISE
    ? 'register-now-insights'
    : 'register-now-rhc',
  options: emptyRegistrationState,
};
