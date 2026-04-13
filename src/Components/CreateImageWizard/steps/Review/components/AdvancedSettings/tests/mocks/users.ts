export const adminUser = {
  name: 'admin',
  // Passwords are empty because the component only checks hasPassword,
  // not the value. Snyk is also complaining endlessly about hardcoded
  // password
  password: '',
  hasPassword: true,
  ssh_key: '',
  groups: [] as string[],
  isAdministrator: true,
};

export const developerUser = {
  name: 'developer',
  // as per the above comment
  password: '',
  hasPassword: true,
  ssh_key: '',
  groups: [] as string[],
  isAdministrator: false,
};

export const guestUser = {
  name: 'guest',
  // as per the first comment
  password: '',
  hasPassword: true,
  ssh_key: '',
  groups: [] as string[],
  isAdministrator: false,
};
