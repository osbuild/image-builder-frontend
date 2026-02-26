import {
  FormGroup,
  FormHelperText,
  HelperText,
  Switch,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeFips,
  selectFips,
} from '../../../../../store/wizardSlice';

const ComplianceSection = () => {
  const dispatch = useAppDispatch();
  const fips = useAppSelector(selectFips);

  return (
    <>
      <Title headingLevel='h2' size='lg'>
        Compliance
      </Title>
      <FormGroup>
        <Switch
          id='fips-enabled-switch'
          label='Enable FIPS mode'
          isChecked={fips.enabled}
          onChange={(_event, checked) => dispatch(changeFips(checked))}
          hasCheckIcon
        />
        <FormHelperText>
          <HelperText>
            Enable FIPS 140-2 compliant cryptographic algorithms. This setting
            is applied at build time and persists on boot.
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </>
  );
};

export default ComplianceSection;
