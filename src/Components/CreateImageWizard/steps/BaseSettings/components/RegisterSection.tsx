import { useState } from 'react';

import { Alert, Title } from '@patternfly/react-core';

import Registration from '../../Registration/components/Registration';

const RegisterSection = () => {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <>
      <Title headingLevel='h2' size='lg'>
        Register
      </Title>
      <Registration onErrorChange={setShowAlert} />
      {showAlert && (
        <Alert title='Activation keys unavailable' variant='danger' isInline>
          Activation keys cannot be reached, try again later.
        </Alert>
      )}
    </>
  );
};

export default RegisterSection;
