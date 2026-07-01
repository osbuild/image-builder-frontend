import React, { createContext, useCallback, useContext, useState } from 'react';

type ValidationContextType = {
  forceShowErrors: boolean;
  setForceShowErrors: () => void;
};

const ValidationContext = createContext<ValidationContextType>({
  forceShowErrors: false,
  setForceShowErrors: () => {},
});

export const useValidationContext = () => useContext(ValidationContext);

export const ValidationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [forceShowErrors, setForce] = useState(false);

  const setForceShowErrors = useCallback(() => {
    setForce(true);
  }, []);

  return (
    <ValidationContext.Provider value={{ forceShowErrors, setForceShowErrors }}>
      {children}
    </ValidationContext.Provider>
  );
};
