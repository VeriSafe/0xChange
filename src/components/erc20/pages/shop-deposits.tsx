import React from 'react';
import styled from 'styled-components';

import { WalletWethBalanceContainer } from '../../account';
import { DepositTokenBalancesContainer } from '../../account/deposit_token_balances';
import { FiatOnRampModalContainer } from '../../account/fiat_modal';
import { CheckWalletStateModalContainer } from '../../common/check_wallet_state_modal_container';
import { ColumnNarrow } from '../../common/column_narrow';
import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';

const ColumnWideMyWallet = styled(ColumnWide)`
    margin-left: 0;

    &:last-child {
        margin-left: 0;
    }
`;
const ShopDeposits = () => (
    <Content>
        <CheckWalletStateModalContainer>
            <ColumnWideMyWallet>
                <DepositTokenBalancesContainer />
            </ColumnWideMyWallet>
            <ColumnNarrow>
                <WalletWethBalanceContainer />
            </ColumnNarrow>
        </CheckWalletStateModalContainer>
        <FiatOnRampModalContainer />
    </Content>
);

export { ShopDeposits as default };
