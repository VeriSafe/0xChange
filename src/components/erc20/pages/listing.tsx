import React from 'react';
import styled from 'styled-components';

import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';
import { TokensListing } from '../marketplace/token_listing';

const ColumnWideMyWallet = styled(ColumnWide)`
    margin-left: 0;

    &:last-child {
        margin-left: 0;
    }
`;

const TokenListingPage = () => (
    <Content>
        <ColumnWideMyWallet>
            <TokensListing />
        </ColumnWideMyWallet>
    </Content>
);

export { TokenListingPage as default };
