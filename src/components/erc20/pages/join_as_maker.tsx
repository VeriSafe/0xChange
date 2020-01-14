import React from 'react';
import styled from 'styled-components';

import { FiatOnRampModalContainer } from '../../account/fiat_modal';
import { FiatChooseModalContainer } from '../../account/fiat_onchoose_modal';
import { JoinAsMaker } from '../../account/join_maker';
import { CheckWalletStateModalContainer } from '../../common/check_wallet_state_modal_container';
import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';

const ColumnWideMyWallet = styled(ColumnWide)`
    margin-left: 0;

    &:last-child {
        margin-left: 0;
    }
`;

const JoinAsMakerPage = () => (
    <Content>
        <CheckWalletStateModalContainer>
            <ColumnWideMyWallet>
                <JoinAsMaker />
            </ColumnWideMyWallet>
        </CheckWalletStateModalContainer>
        <FiatOnRampModalContainer />
        <FiatChooseModalContainer />
    </Content>
);

export { JoinAsMakerPage as default };
