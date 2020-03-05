import React from 'react';

import { COLLECTIBLE_NAME } from '../../../common/constants';
import { AllCollectiblesListContainer } from '../collectibles/collectibles_list';
import { Content } from '../common/content_wrapper';

interface OwnProps {
    collection: string;
}

type Props = OwnProps;

export const ListCollectibles = (props: Props) => (
    <Content>
        <AllCollectiblesListContainer title={COLLECTIBLE_NAME} />
    </Content>
);
