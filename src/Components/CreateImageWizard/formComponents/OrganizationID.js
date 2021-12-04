import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Spinner, TextInput } from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';

const OrganizationID = () => {
    const { change } = useFormApi();
    const [ orgId, setOrgId ] = useState();
    useEffect(() => {
        // const userData = insights?.chrome?.auth?.getUser();
        // userData.then((user) => setOrgId(user?.identity?.internal?.org_id));
        (async () => {
            const userData = await insights?.chrome?.auth?.getUser();
            setOrgId(userData?.identity?.internal?.org_id);
            change('subscription-organization', userData?.identity?.internal?.org_id);
        })();

        return () => {
            setOrgId(undefined);
        };
    }, []);

    return (
        <Form>
            <FormGroup label="Organization ID" fieldId="organization-id" data-testid="organization-id">
                { orgId ?
                    <TextInput
                        isDisabled
                        type="text"
                        id="organization-id"
                        name="organization-id"
                        value={ orgId } />
                    : <Spinner isSVG size="md" /> }
            </FormGroup>
        </Form>
    );
};

export default OrganizationID;
