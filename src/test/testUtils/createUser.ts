import { userEvent } from '@testing-library/user-event';

export type UserEventInstance = ReturnType<typeof userEvent.setup>;

export const createUser = () => userEvent.setup({ delay: null });
