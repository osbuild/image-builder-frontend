// UID range for regular users per LOGIN.DEFS(5) defaults
export const MIN_REGULAR_UID = 1000;
export const MAX_REGULAR_UID = 60000;

// GID range for regular groups per LOGIN.DEFS(5) defaults
export const MIN_REGULAR_GID = 1000;
export const MAX_REGULAR_GID = 60000;

// Linux UID/GID are 32-bit unsigned (uid_t/gid_t)
export const MAX_ID = 4294967294;

// System groups available by default in RHEL
export const SYSTEM_GROUPS = ['wheel'];
