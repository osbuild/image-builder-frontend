/* eslint-disable @typescript-eslint/no-unused-vars */

type PermissionObject = {
  allowed: boolean;
  addEventListener(eventType: string, callback: () => void): void;
  removeEventListener(eventType: string, callback: () => void): void;
};

export const cockpitPermission = ({ admin = false }): PermissionObject => {
  return {
    allowed: admin,
    addEventListener: (eventType: string, callback: () => void) => {},
    removeEventListener: (eventType: string, callback: () => void) => {},
  };
};
