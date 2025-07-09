import React, { useEffect, useState } from 'react';

import {
  Button,
  Checkbox,
  Content,
  FormGroup,
  Popover,
  Radio,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import { useFlag } from '@unleash/proxy-client-react';

import { INSIGHTS_URL, RHC_URL, RHEL_10_BETA } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeRegistrationType,
  selectDistribution,
  selectRegistrationType,
} from '../../../../../store/wizardSlice';

const InsightsPopover = () => {
  return (
    <Popover
      headerContent="About Red Hat Insights"
      position="right"
      minWidth="30rem"
      bodyContent={
        <Content>
          <Content>
            Red Hat Insights client provides actionable intelligence about your
            Red Hat Enterprise Linux environments, helping to identify and
            address operational and vulnerability risks before an issue results
            in downtime.
          </Content>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={INSIGHTS_URL}
          >
            Learn more about Red Hat Insights
          </Button>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0"
        aria-label="About remote host configuration (rhc)"
        isInline
      />
    </Popover>
  );
};

const RhcPopover = () => {
  return (
    <Popover
      headerContent="About remote host configuration (rhc)"
      position="right"
      minWidth="30rem"
      bodyContent={
        <Content>
          <Content>
            Remote host configuration allows Red Hat Enterprise Linux hosts to
            connect to Red Hat Insights. Remote host configuration is required
            to use the Red Hat Insights Remediations service.
          </Content>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href={RHC_URL}
          >
            Learn more about remote host configuration
          </Button>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0"
        aria-label="About remote host configuration (rhc)"
        isInline
      />
    </Popover>
  );
};

const Registration = () => {
  const dispatch = useAppDispatch();
  const distribution = useAppSelector(selectDistribution);
  const registrationType = useAppSelector(selectRegistrationType);

  const [showOptions, setShowOptions] = useState(
    registrationType === 'register-later'
  );

  const isSatelliteRegistrationEnabled = useFlag(
    'image-builder.satellite.enabled'
  );

  // TO DO: Remove when rhc starts working for RHEL 10 Beta
  useEffect(() => {
    if (distribution === RHEL_10_BETA) {
      dispatch(changeRegistrationType('register-now-insights'));
    }
  }, []);

  return (
    <FormGroup label="Registration method">
      <Radio
        label="Automatically register and enable advanced capabilities"
        isChecked={
          registrationType === 'register-now' ||
          registrationType === 'register-now-insights' ||
          registrationType === 'register-now-rhc'
        }
        onChange={(_event, checked) => {
          // TO DO: Update when rhc starts working for RHEL 10 Beta
          if (checked && distribution !== RHEL_10_BETA) {
            dispatch(changeRegistrationType('register-now-rhc'));
          } else if (checked && distribution === RHEL_10_BETA) {
            dispatch(changeRegistrationType('register-now-insights'));
          }
        }}
        id="register-system-now"
        name="register-system-now"
        autoFocus
        description={
          <Button
            component="a"
            variant="link"
            isDisabled={!registrationType.startsWith('register-now')}
            isInline
            onClick={() => setShowOptions(!showOptions)}
          >
            {`${!showOptions ? 'Show' : 'Hide'} additional connection options`}
          </Button>
        }
        body={
          showOptions && (
            <Checkbox
              className="pf-v6-u-ml-lg"
              label={
                <>
                  Enable predictive analytics and management capabilities
                  <InsightsPopover />
                </>
              }
              isChecked={
                registrationType === 'register-now-insights' ||
                registrationType === 'register-now-rhc'
              }
              onChange={(_event, checked) => {
                if (checked) {
                  dispatch(changeRegistrationType('register-now-insights'));
                } else {
                  dispatch(changeRegistrationType('register-now'));
                }
              }}
              id="register-system-now-insights"
              name="register-system-insights"
              body={
                <Checkbox
                  label={
                    <>
                      Enable remote remediations and system management with
                      automation
                      <RhcPopover />
                    </>
                  }
                  isChecked={registrationType === 'register-now-rhc'}
                  onChange={(_event, checked) => {
                    if (checked) {
                      dispatch(changeRegistrationType('register-now-rhc'));
                    } else {
                      dispatch(changeRegistrationType('register-now-insights'));
                    }
                  }}
                  // TO DO: Remove when rhc starts working for RHEL 10 Beta
                  isDisabled={distribution === RHEL_10_BETA}
                  id="register-system-now-rhc"
                  name="register-system-rhc"
                />
              }
            />
          )
        }
      />
      <Radio
        label="Register later"
        isChecked={registrationType === 'register-later'}
        onChange={() => {
          dispatch(changeRegistrationType('register-later'));
          setShowOptions(false);
        }}
        id="register-later"
        name="register-later"
      />
      {isSatelliteRegistrationEnabled && (
        <Radio
          label="Register with Satellite"
          isChecked={registrationType === 'register-satellite'}
          onChange={() => {
            dispatch(changeRegistrationType('register-satellite'));
            setShowOptions(false);
          }}
          id="register-satellite"
          name="register-satellite"
        />
      )}
    </FormGroup>
  );
};

export default Registration;
