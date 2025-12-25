import React, { createContext, useCallback, useContext, useRef } from 'react';

import { LabelInputRef } from '../../../LabelInput';

type GroupInputContextType = {
  registerRef: (ref: LabelInputRef | null) => void;
  unregisterRef: (ref: LabelInputRef | null) => void;
  flushAllInputs: () => void;
};

const GroupInputContext = createContext<GroupInputContextType | null>(null);

export const useGroupInputContext = () => {
  const context = useContext(GroupInputContext);
  if (!context) {
    throw new Error(
      'useGroupInputContext must be used within a GroupInputProvider',
    );
  }
  return context;
};

export const GroupInputProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const refsRef = useRef<Set<LabelInputRef>>(new Set());

  const registerRef = useCallback((ref: LabelInputRef | null) => {
    if (ref) {
      refsRef.current.add(ref);
    }
  }, []);

  const unregisterRef = useCallback((ref: LabelInputRef | null) => {
    if (ref) {
      refsRef.current.delete(ref);
    }
  }, []);

  const flushAllInputs = useCallback(() => {
    refsRef.current.forEach((ref) => {
      ref.flushInput();
    });
  }, []);

  return (
    <GroupInputContext.Provider
      value={{ registerRef, unregisterRef, flushAllInputs }}
    >
      {children}
    </GroupInputContext.Provider>
  );
};
