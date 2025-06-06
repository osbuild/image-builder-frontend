import { ReactNode } from 'react';

// Create a usable component to conditionally render react components. This
// is especially useful when there are multiple components that need to be
// rendered conditionally and improves the readability of the code.
export const RenderComponent = ({
  when,
  children: child,
}: {
  when: boolean | undefined;
  children: ReactNode;
}) => {
  if (!when) {
    return null;
  }

  return child;
};
