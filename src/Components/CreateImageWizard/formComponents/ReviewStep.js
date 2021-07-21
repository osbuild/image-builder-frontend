import React from 'react';
import { TextContent, Text, TextVariants, TextListItem, TextListVariants, TextListItemVariants, Gallery, GalleryItem } from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { releaseValues } from '../steps/imageOutput';
import { registerValues } from '../steps/registration';
import { googleAccType } from '../steps/googleCloud';

const ReviewStep = () => {
    const { getState } = useFormApi();
    return (
        <TextContent>
            <Text>
                    Review the information and click the Create button
                    to create your image using the following criteria.
            </Text>
            <Text component={ TextVariants.h3 }>Image output</Text>
            <Gallery component={ TextListVariants.dl } data-testid='review-image-output'>
                <GalleryItem>
                    <TextListItem component={ TextListItemVariants.dt }>Release</TextListItem>
                </GalleryItem>
                <GalleryItem>
                    <TextListItem component={ TextListItemVariants.dd }>
                        {releaseValues?.[getState()?.values?.release]}
                    </TextListItem>
                </GalleryItem>
            </Gallery>
            <Text component={ TextVariants.h3 }>Target environment</Text>
            {getState()?.values?.['aws-account-id'] && <>
                <Text id="destination-header">Amazon Web Services</Text>
                <Gallery component={ TextListVariants.dl } data-testid='review-image-upload-aws'>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dt }>Account ID</TextListItem>
                    </GalleryItem>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dd }>{getState()?.values?.['aws-account-id']}</TextListItem>
                    </GalleryItem>
                </Gallery>
            </>}
            {getState()?.values?.['google-account-type'] && <>
                <Text id="destination-header">Google Cloud Platform</Text>
                <Gallery component={ TextListVariants.dl } data-testid='review-image-upload-google'>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dt }>
                            {googleAccType?.[getState()?.values?.['google-account-type']]}
                        </TextListItem>
                    </GalleryItem>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dd }>
                            {getState()?.values?.['google-email'] || getState()?.values?.['google-domain']}
                        </TextListItem>
                    </GalleryItem>
                </Gallery>
            </>}
            {getState()?.values?.['azure-subscription-id'] && <>
                <Text id="destination-header">Microsoft Azure</Text>
                <Gallery component={ TextListVariants.dl } data-testid='review-image-upload-azure'>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dt }>Subscription ID</TextListItem>
                    </GalleryItem>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dd }>{getState()?.values?.['azure-subscription-id']}</TextListItem>
                    </GalleryItem>
                </Gallery>
                <Gallery>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dt }>Tenant ID</TextListItem>
                    </GalleryItem>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dd }>{getState()?.values?.['azure-tenant-id']}</TextListItem>
                    </GalleryItem>
                </Gallery>
                <Gallery>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dt }>Resource group</TextListItem>
                    </GalleryItem>
                    <GalleryItem>
                        <TextListItem component={ TextListItemVariants.dd }>{getState()?.values?.['azure-resource-group']}</TextListItem>
                    </GalleryItem>
                </Gallery>
            </>}
            {getState()?.values?.['register-system'] === 'subscribe-now-radio' &&
             getState()?.values?.release.includes('rhel') && <>
                    <Text component={ TextVariants.h3 }>Registration</Text>
                    <Gallery component={ TextListVariants.dl } data-testid='review-image-registration'>
                        <GalleryItem>
                            <TextListItem component={ TextListItemVariants.dt }>Subscription</TextListItem>
                        </GalleryItem>
                        <GalleryItem>
                            <TextListItem component={ TextListItemVariants.dd }>
                                {getState()?.values?.['register-system'] === 'subscribe-now-radio' ?
                                    'Register the system on first boot' :
                                registerValues?.[getState()?.values?.['register-system']?.title]
                                }
                            </TextListItem>
                        </GalleryItem>
                    </Gallery>
                    <Gallery>
                        <GalleryItem>
                            <TextListItem component={ TextListItemVariants.dt }>Activation key</TextListItem>
                        </GalleryItem>
                        <GalleryItem>
                            <TextListItem component={ TextListItemVariants.dd } type="password">
                                {'*'.repeat(getState()?.values?.['subscription-activation']?.length)}
                            </TextListItem>
                        </GalleryItem>
                    </Gallery>
                </>}
        </TextContent>
    );
};

export default ReviewStep;
