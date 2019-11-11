import React from 'react';
// import styled from 'styled-components';

import { themeBreakPoints, themeDimensions } from '../../../themes/commons';
import { FiatOnRampModalContainer } from '../../account/fiat_modal';
import { CheckWalletStateModalContainer } from '../../common/check_wallet_state_modal_container';
import { ColumnNarrow } from '../../common/column_narrow';
import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';
import { MarketDetailsContainer } from '../common/market_details';
// import { MarketsListContainer } from '../common/markets_list';
import { BuySellContainer } from '../marketplace/buy_sell';
import { MarketFillsContainer } from '../marketplace/market_fills';
// import GoogleADS from '../../common/google';
import { OrderBookTableContainer } from '../marketplace/order_book';
import { OrderFillsContainer } from '../marketplace/order_fills';
import { OrderHistoryContainer } from '../marketplace/order_history';
import { WalletBalanceContainer } from '../marketplace/wallet_balance';

/*const ColumnWideDouble = styled.div`
    @media (min-width: ${themeBreakPoints.md}) {
        flex-grow: 3;
    }
`;*/

class Marketplace extends React.PureComponent {
    public render = () => {
        return (
            <>
                <Content>
                    <ColumnNarrow>
                        <WalletBalanceContainer />
                        <BuySellContainer />
                    </ColumnNarrow>
                    <ColumnNarrow>
                        <OrderBookTableContainer />
                    </ColumnNarrow>
                    <ColumnWide>
                        <MarketDetailsContainer />
                        <OrderHistoryContainer />
                        <MarketFillsContainer />
                        <OrderFillsContainer />
                    </ColumnWide>
                    <CheckWalletStateModalContainer />
                    <FiatOnRampModalContainer />
                </Content>
            </>
        );
    };
}

export { Marketplace };
