import { UserWithAdditionalInfo } from '../../../../../store/wizardSlice';

/**
 * Check if a user is "defined" - has started filling any field.
 * A user is considered defined if they have any of:
 * - password
 * - SSH key
 * - groups
 * - current group input (typing in progress)
 */
export const isUserDefined = (user: UserWithAdditionalInfo): boolean => {
  return (
    !!user.password ||
    !!user.ssh_key ||
    user.groups.length > 0 ||
    !!user.currentGroupInput.trim()
  );
};
