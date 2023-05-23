import React, { useEffect, useState } from 'react';

import { FormSpy } from '@data-driven-forms/react-form-renderer';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Button,
  Checkbox,
  FormGroup,
  Popover,
  Radio,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { HelpIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

const RHSMPopover = () => {
  return (
    <Popover
      headerContent="About Red Hat Subscription Management"
      position="right"
      minWidth="30rem"
      bodyContent={
        <TextContent>
          <Text>
            Registered systems are entitled to support services, errata,
            patches, and upgrades.
          </Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/products/red-hat-subscription-management"
          >
            Learn more about Red Hat Subscription Management
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-c-form__group-label-help"
        aria-label="About Remote Host Configuration (RHC)"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

const InsightsPopover = () => {
  return (
    <Popover
      headerContent="About Red Hat Insights"
      position="right"
      minWidth="30rem"
      bodyContent={
        <TextContent>
          <Text>
            Red Hat Insights client provides actionable intelligence about your
            Red Hat Enterprise Linux environments, helping to identify and
            address operational and vulnerability risks before an issue results
            in downtime.
          </Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/products/red-hat-insights"
          >
            Learn more about Red Hat Insights
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-c-form__group-label-help"
        aria-label="About Remote Host Configuration (RHC)"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

const RHCPopover = () => {
  return (
    <Popover
      headerContent="About Remote Host Configuration (RHC)"
      position="right"
      minWidth="30rem"
      bodyContent={
        <TextContent>
          <Text>
            RHC allows Red Hat Enterprise Linux hosts to connect to Red Hat
            Insights. RHC is required to use the Red Hat Insights Remediations
            service.
          </Text>
          <Button
            component="a"
            target="_blank"
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            href="https://access.redhat.com/articles/rhc"
          >
            Learn more about Remote Host Configuration
          </Button>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        className="pf-c-form__group-label-help"
        aria-label="About Remote Host Configuration (RHC)"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

const Registration = ({ label, ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [showOptions, setShowOptions] = useState(false);
  const registerSystem = getState()?.values?.['register-system'];

  useEffect(() => {
    if (registerSystem === 'register-now-insights') {
      setShowOptions(true);
    }

    if (registerSystem === 'register-now') {
      setShowOptions(true);
    }
  }, []);

  return (
    <FormSpy>
      {() => (
        <FormGroup label={label}>
          <Radio
            autoFocus
            label={
              (!showOptions &&
                'Automatically register and enable advanced capabilities') || (
                <>
                  Monitor & manage subscriptions and access to Red Hat content
                  <RHSMPopover />
                </>
              )
            }
            data-testid="registration-radio-now"
            name="register-system"
            id="register-system-now"
            isChecked={registerSystem.startsWith('register-now')}
            onChange={() => {
              change(input.name, 'register-now-rhc');
            }}
            description={
              !showOptions && (
                <Button
                  component="a"
                  data-testid="registration-additional-options"
                  variant="link"
                  isDisabled={!registerSystem.startsWith('register-now')}
                  isInline
                  onClick={() => setShowOptions(!showOptions)}
                >
                  Show additional connection options
                </Button>
              )
            }
            body={
              showOptions && (
                <Checkbox
                  className="pf-u-ml-lg"
                  label={
                    <>
                      Enable predictive analytics and management capabilities
                      <InsightsPopover />
                    </>
                  }
                  data-testid="registration-checkbox-insights"
                  isChecked={
                    registerSystem === 'register-now-insights' ||
                    registerSystem === 'register-now-rhc'
                  }
                  onChange={(checked) => {
                    if (checked) {
                      change(input.name, 'register-now-insights');
                    } else {
                      change(input.name, 'register-now');
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
                          <RHCPopover />
                        </>
                      }
                      data-testid="registration-checkbox-rhc"
                      isChecked={registerSystem === 'register-now-rhc'}
                      onChange={(checked) => {
                        if (checked) {
                          change(input.name, 'register-now-rhc');
                        } else {
                          change(input.name, 'register-now-insights');
                        }
                      }}
                      id="register-system-now-rhc"
                      name="register-system-rhc"
                    />
                  }
                />
              )
            }
          />
          <Radio
            name="register-system"
            className="pf-u-mt-md"
            data-testid="registration-radio-later"
            id="register-system-later"
            label="Register later"
            isChecked={registerSystem === 'register-later'}
            onChange={() => {
              setShowOptions(false);
              change(input.name, 'register-later');
            }}
          />
        </FormGroup>
      )}
    </FormSpy>
  );
};

Registration.propTypes = {
  label: PropTypes.node,
};

export default Registration;
