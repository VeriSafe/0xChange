import React from 'react';
import styled from 'styled-components';

import { themeBreakPoints } from '../../../themes/commons';
import { FiatOnRampModalContainer } from '../../account/fiat_modal';
import { FiatChooseModalContainer } from '../../account/fiat_onchoose_modal';
import { CheckWalletStateModalContainer } from '../../common/check_wallet_state_modal_container';
import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';
import { MarketTradeContainer } from '../marketplace/market_trade';

const ColumnWideMyWallet = styled(ColumnWide)`
    margin-left: 0;
    &:last-child {
        margin-left: 0;
    }
    @media (max-width: ${themeBreakPoints.sm}) {
        width: 100%;
    }
    @media (min-width: ${themeBreakPoints.md}) {
        max-width: 60%;
    }
`;

const CenteredContent = styled(Content)`
    align-items: center;
    justify-content: center;
`;

const MarketTradePage = () => (
    <CenteredContent>
        <ColumnWideMyWallet>
            <MarketTradeContainer />
        </ColumnWideMyWallet>
        <CheckWalletStateModalContainer />
        <FiatOnRampModalContainer />
        <FiatChooseModalContainer />
    </CenteredContent>
);

export { MarketTradePage as default };
