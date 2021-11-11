import React from 'react';
import { TextContent, Text, TextVariants, Gallery, GalleryItem } from '@patternfly/react-core';
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
            <Gallery data-testid='review-image-output'>
                <GalleryItem>
                    <Text component={ TextVariants.h4 }>Release</Text>
                </GalleryItem>
                <GalleryItem>
                    <Text>
                        {releaseValues?.[getState()?.values?.release]}
                    </Text>
                </GalleryItem>
            </Gallery>
            <Text component={ TextVariants.h3 }>Target environment</Text>
            {getState()?.values?.['aws-account-id'] && <>
                <Text id="destination-header">Amazon Web Services</Text>
                <Gallery data-testid='review-image-upload-aws'>
                    <GalleryItem>
                        <Text component={ TextVariants.h4 }>Account ID</Text>
                    </GalleryItem>
                    <GalleryItem>
                        <Text>{getState()?.values?.['aws-account-id']}</Text>
                    </GalleryItem>
                </Gallery>
            </>}
            {getState()?.values?.['google-account-type'] && <>
                <Text id="destination-header">Google Cloud Platform</Text>
                <Gallery data-testid='review-image-upload-google'>
                    <GalleryItem>
                        <Text component={ TextVariants.h4 }>
                            {googleAccType?.[getState()?.values?.['google-account-type']]}
                        </Text>
                    </GalleryItem>
                    <GalleryItem>
                        <Text>
                            {getState()?.values?.['google-email'] || getState()?.values?.['google-domain']}
                        </Text>
                    </GalleryItem>
                </Gallery>
            </>}
            {getState()?.values?.['azure-subscription-id'] && <>
                <Text id="destination-header">Microsoft Azure</Text>
                <Gallery data-testid='review-image-upload-azure'>
                    <GalleryItem>
                        <Text component={ TextVariants.h4 }>Subscription ID</Text>
                    </GalleryItem>
                    <GalleryItem>
                        <Text>{getState()?.values?.['azure-subscription-id']}</Text>
                    </GalleryItem>
                </Gallery>
                <Gallery>
                    <GalleryItem>
                        <Text component={ TextVariants.h4 }>Tenant ID</Text>
                    </GalleryItem>
                    <GalleryItem>
                        <Text>{getState()?.values?.['azure-tenant-id']}</Text>
                    </GalleryItem>
                </Gallery>
                <Gallery>
                    <GalleryItem>
                        <Text component={ TextVariants.h4 }>Resource group</Text>
                    </GalleryItem>
                    <GalleryItem>
                        <Text>{getState()?.values?.['azure-resource-group']}</Text>
                    </GalleryItem>
                </Gallery>
            </>}
            {getState()?.values?.['register-system'] === 'subscribe-now-radio' &&
             getState()?.values?.release.includes('rhel') &&
                <>
                    <Text component={ TextVariants.h3 }>Registration</Text>
                    <Gallery data-testid='review-image-registration'>
                        <GalleryItem>
                            <Text component={ TextVariants.h4 }>Subscription</Text>
                        </GalleryItem>
                        <GalleryItem>
                            <Text>
                                {getState()?.values?.['register-system'] === 'subscribe-now-radio' ?
                                    'Register the system on first boot' :
                                    registerValues?.[getState()?.values?.['register-system']?.title]
                                }
                            </Text>
                        </GalleryItem>
                    </Gallery>
                    <Gallery>
                        <GalleryItem>
                            <Text component={ TextVariants.h4 }>Activation key</Text>
                        </GalleryItem>
                        <GalleryItem>
                            <Text type="password">
                                {'*'.repeat(getState()?.values?.['subscription-activation']?.length)}
                            </Text>
                        </GalleryItem>
                    </Gallery>
                </>
            }
        </TextContent>
    );
};

export default ReviewStep;
