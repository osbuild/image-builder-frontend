import React, { useState } from 'react';
import {
    DescriptionList, DescriptionListTerm, DescriptionListGroup, DescriptionListDescription,
    List, ListItem,
    Tabs, Tab, TabTitleText,
    Text, TextContent, TextVariants, TextList, TextListVariants, TextListItem, TextListItemVariants
} from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { releaseValues } from '../steps/imageOutput';
import { registerValues } from '../steps/registration';
import { googleAccType } from '../steps/googleCloud';

const ReviewStep = () => {
    const [ activeTabKey, setActiveTabKey ] = useState(0);
    const { getState } = useFormApi();

    const handleTabClick = (event, tabIndex) => {
        setActiveTabKey(tabIndex);
    };

    return (
        <>
            <Text>
                    Review the information and click &quot;Create image&quot;
                    to create the image using the following criteria.
            </Text>
            <DescriptionList>
                <DescriptionListGroup>
                    <DescriptionListTerm>Release</DescriptionListTerm>
                    <DescriptionListDescription>
                        {releaseValues?.[getState()?.values?.release]}
                    </DescriptionListDescription>
                </DescriptionListGroup>
            </DescriptionList>
            <Tabs isFilled activeKey={ activeTabKey } onSelect={ handleTabClick } className="pf-u-w-75">
                <Tab eventKey={ 0 } title={ <TabTitleText>Target environment</TabTitleText> } data-testid='tab-target'>
                    <List isPlain iconSize="large">
                        {getState()?.values?.['target-environment']?.aws &&
                            <ListItem icon={ <img className='provider-icon' src='/apps/frontend-assets/partners-icons/aws.svg' /> }>
                                <TextContent>
                                    <Text component={ TextVariants.h3 }>
                                    Amazon Web Services
                                    </Text>
                                    <TextList component={ TextListVariants.dl }>
                                        <TextListItem component={ TextListItemVariants.dt }>Account ID</TextListItem>
                                        <TextListItem component={ TextListItemVariants.dd }>
                                            {getState()?.values?.['aws-account-id']}
                                        </TextListItem>
                                    </TextList>
                                </TextContent>
                            </ListItem>
                        }
                        {getState()?.values?.['target-environment']?.google &&
                            <ListItem
                                className='pf-c-list__item pf-u-mt-md'
                                icon={ <img className='provider-icon' src='/apps/frontend-assets/partners-icons/google-cloud-short.svg' /> }>
                                <TextContent>
                                    <Text component={ TextVariants.h3 }>Google Cloud Platform</Text>
                                    <TextList component={ TextListVariants.dl }>
                                        <TextListItem component={ TextListItemVariants.dt }>
                                            {googleAccType?.[getState()?.values?.['google-account-type']]}
                                        </TextListItem>
                                        <TextListItem component={ TextListItemVariants.dd }>
                                            {getState()?.values?.['google-email'] || getState()?.values?.['google-domain']}
                                        </TextListItem>
                                    </TextList>
                                </TextContent>
                            </ListItem>
                        }
                        {getState()?.values?.['target-environment']?.azure &&
                            <ListItem
                                className='pf-c-list__item pf-u-mt-md'
                                icon={ <img className='provider-icon' src='/apps/frontend-assets/partners-icons/microsoft-azure-short.svg' /> }>
                                <TextContent>
                                    <Text component={ TextVariants.h3 }>Microsoft Azure</Text>
                                    <TextList component={ TextListVariants.dl }>
                                        <TextListItem component={ TextListItemVariants.dt }>
                                        Subscription ID
                                        </TextListItem>
                                        <TextListItem component={ TextListItemVariants.dd }>
                                            {getState()?.values?.['azure-subscription-id']}
                                        </TextListItem>
                                        <TextListItem component={ TextListItemVariants.dt }>
                                    Tenant ID
                                        </TextListItem>
                                        <TextListItem component={ TextListItemVariants.dd }>
                                            {getState()?.values?.['azure-tenant-id']}
                                        </TextListItem>
                                        <TextListItem component={ TextListItemVariants.dt }>
                                        Resource group
                                        </TextListItem>
                                        <TextListItem component={ TextListItemVariants.dd }>
                                            {getState()?.values?.['azure-resource-group']}
                                        </TextListItem>
                                    </TextList>
                                </TextContent>
                            </ListItem>
                        }
                    </List>
                </Tab>
                <Tab eventKey={ 1 } title={ <TabTitleText>Registration</TabTitleText> } data-testid='tab-registration'>
                    {getState()?.values?.['register-system'] === 'register-later-radio-button' &&
                        <TextContent>
                            <TextList component={ TextListVariants.dl }>
                                <TextListItem component={ TextListItemVariants.dt }>
                                    Subscription
                                </TextListItem>
                                <TextListItem component={ TextListItemVariants.dd }>
                                    Register the system later
                                </TextListItem>
                            </TextList>
                        </TextContent>
                    }
                    {getState()?.values?.['register-system'] === 'subscribe-now-radio' &&
                    getState()?.values?.release.includes('rhel') &&
                        <TextContent>
                            <TextList component={ TextListVariants.dl }>
                                <TextListItem component={ TextListItemVariants.dt }>
                                    Subscription
                                </TextListItem>
                                <TextListItem component={ TextListItemVariants.dd }>
                                    {getState()?.values?.['register-system'] === 'subscribe-now-radio' ?
                                        'Register the system on first boot' :
                                        registerValues?.[getState()?.values?.['register-system']?.title]
                                    }
                                </TextListItem>
                                <TextListItem component={ TextListItemVariants.dt }>
                                    Activation key
                                </TextListItem>
                                <TextListItem component={ TextListItemVariants.dd }>
                                    {getState()?.values?.['subscription-activation']}
                                </TextListItem>
                            </TextList>
                        </TextContent>
                    }
                </Tab>
                <Tab eventKey={ 2 } title={ <TabTitleText>System configuration</TabTitleText> } data-testid='tab-system'>
                    <TextContent>
                        <Text component={ TextVariants.h3 }>Packages</Text>
                        <TextList component={ TextListVariants.dl }>
                            <TextListItem component={ TextListItemVariants.dt }>
                                Chosen
                            </TextListItem>
                            <TextListItem component={ TextListItemVariants.dd } data-testid='chosen-packages-count'>
                                {getState()?.values?.['selected-packages']?.length || 0}
                            </TextListItem>
                        </TextList>
                    </TextContent>
                </Tab>
            </Tabs>
        </>
    );
};

export default ReviewStep;
