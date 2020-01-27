import React from 'react';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import { NETWORK_ID, RELAYER_URL } from '../../common/constants';
import {
    openFiatOnRampModal,
    startToggleTokenLockSteps,
    startTranferTokenSteps,
    startDepositTokenSteps,
} from '../../store/actions';
import {
    getEthAccount,
    getEthBalance,
    getEthInUsd,
    getTokenBalances,
    getTokensPrice,
    getWallet,
    getWeb3State,
    getWethTokenBalance,
} from '../../store/selectors';
import { Theme, themeBreakPoints } from '../../themes/commons';
import { getEtherscanLinkForToken, getEtherscanLinkForTokenAndAddress, tokenAmountInUnits } from '../../util/tokens';
import { ButtonVariant, StoreState, Token, TokenBalance, TokenPrice, Wallet, Web3State } from '../../util/types';
import { Button } from '../common/button';
import { Card } from '../common/card';
import { TokenIcon } from '../common/icons/token_icon';
import { LoadingWrapper } from '../common/loading';
import { CustomTD, Table, TH, THead, THLast, TR } from '../common/table';

import { DepositTokenModal } from './wallet_deposit_token_modal';
import { BigNumber } from '@0x/utils';

interface StateProps {
    ethBalance: BigNumber;
    tokenBalances: TokenBalance[];
    web3State: Web3State;
    wethTokenBalance: TokenBalance | null;
    ethAccount: string;
    ethUsd: BigNumber | null;
    tokensPrice: TokenPrice[] | null;
    wallet: Wallet | null;
}
interface OwnProps {
    theme: Theme;
}

interface DispatchProps {
    onStartToggleTokenLockSteps: (token: Token, isUnlocked: boolean) => void;
    onSubmitTransferToken: (amount: BigNumber, token: Token, address: string, isEth: boolean) => Promise<any>;
    onClickOpenFiatOnRampModal: (isOpen: boolean) => void;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
    modalIsOpen: boolean;
    isSubmitting: boolean;
    tokenBalanceSelected: TokenBalance | null;
    isEth: boolean;
}

const THStyled = styled(TH)`
    &:first-child {
        padding-right: 0;
    }
`;

const TokenTD = styled(CustomTD)`
    padding-bottom: 10px;
    padding-right: 0;
    padding-top: 10px;
    width: 40px;
`;

const BuyETHButton = styled(Button)`
    margin-left: 5px;
`;

const TokenIconStyled = styled(TokenIcon)`
    margin: 0 auto 0 0;
`;

const CustomTDTokenName = styled(CustomTD)`
    white-space: nowrap;
`;

const TokenEtherscanLink = styled.a`
    align-items: center;
    color: ${props => props.theme.componentsTheme.myWalletLinkColor};
    display: flex;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
    @media (max-width: ${themeBreakPoints.sm}) {
        display: inline;
    }
`;

const QuantityEtherscanLink = styled.a`
    align-items: center;
    color: ${props => props.theme.componentsTheme.myWalletLinkColor};
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const CustomTDLockIcon = styled(CustomTD)`
    .lockedIcon {
        path {
            fill: ${props => props.theme.componentsTheme.iconLockedColor};
        }
    }

    .unlockedIcon {
        path {
            fill: ${props => props.theme.componentsTheme.iconUnlockedColor};
        }
    }
`;

const CustomTDPriceChange = styled(CustomTD)`
    .lockedIcon {
        path {
            fill: ${props => props.theme.componentsTheme.iconLockedColor};
        }
    }

    .unlockedIcon {
        path {
            fill: ${props => props.theme.componentsTheme.iconUnlockedColor};
        }
    }
`;

const TokenName = styled.span`
    font-weight: 700;
    @media (max-width: ${themeBreakPoints.sm}) {
        display: block;
    }
`;
const TokenNameSeparator = styled.span`
    @media (max-width: ${themeBreakPoints.sm}) {
        display: none;
    }
`;

const TBody = styled.tbody`
    > tr:last-child > td {
        border-bottom: none;
    }
`;

const ButtonsContainer = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    @media (max-width: ${themeBreakPoints.xs}) {
        flex-wrap: wrap;
        display: -webkit-inline-box;
    }
`;

class DepositTokenBalances extends React.PureComponent<Props, State> {
    public readonly state: State = {
        modalIsOpen: false,
        isSubmitting: false,
        tokenBalanceSelected: null,
        isEth: false,
    };

    public render = () => {
        const {
            ethBalance,
            tokenBalances,
            onStartToggleTokenLockSteps,
            web3State,
            wethTokenBalance,
            ethAccount,
            theme,
            tokensPrice,
            ethUsd,
            wallet,
            onClickOpenFiatOnRampModal,
        } = this.props;

        if (!wethTokenBalance) {
            return null;
        }

        const wethToken = wethTokenBalance.token;
        const totalEth = wethTokenBalance.balance.plus(ethBalance);
        const formattedTotalEthBalance = tokenAmountInUnits(totalEth, wethToken.decimals, wethToken.displayDecimals);

        const openTransferEthModal = () => {
            this.setState({
                modalIsOpen: true,
                isEth: true,
            });
        };

        const totalEthRow = (
            <TR>
                <TokenTD>
                    <TokenIconStyled
                        symbol={wethToken.symbol}
                        primaryColor={wethToken.primaryColor}
                        icon={wethToken.icon}
                    />
                </TokenTD>
                <CustomTDTokenName styles={{ borderBottom: true }}>
                    <TokenName>ETH Total</TokenName> {` (ETH + wETH)`}
                </CustomTDTokenName>
                <CustomTD styles={{ borderBottom: true, textAlign: 'right', tabular: true }}>
                    {formattedTotalEthBalance}
                </CustomTD>
                <CustomTD styles={{ borderBottom: true, textAlign: 'left' }}>
                    <ButtonsContainer>
                        <Button onClick={openTransferEthModal} variant={ButtonVariant.Primary}>
                            Deposit
                        </Button>
                    </ButtonsContainer>
                </CustomTD>
            </TR>
        );

        const tokensRows = tokenBalances.map((tokenBalance, _index) => {
            const { token, balance } = tokenBalance;
            const { symbol } = token;
            const formattedBalance = tokenAmountInUnits(balance, token.decimals, token.displayDecimals);
            const openTransferModal = () => {
                this.setState({
                    modalIsOpen: true,
                    tokenBalanceSelected: tokenBalance,
                    isEth: false,
                });
            };

            return (
                <TR key={symbol}>
                    <TokenTD>
                        <TokenIconStyled symbol={token.symbol} primaryColor={token.primaryColor} icon={token.icon} />
                    </TokenTD>
                    <CustomTDTokenName styles={{ borderBottom: true }}>
                        <TokenEtherscanLink href={getEtherscanLinkForToken(token)} target={'_blank'}>
                            <TokenName>{token.symbol.toUpperCase()}</TokenName>{' '}
                            <TokenNameSeparator>{` - `}</TokenNameSeparator>
                            {`${token.name}`}
                        </TokenEtherscanLink>
                    </CustomTDTokenName>
                    <CustomTD styles={{ borderBottom: true, textAlign: 'right' }}>
                        <QuantityEtherscanLink
                            href={getEtherscanLinkForTokenAndAddress(token, ethAccount)}
                            target={'_blank'}
                        >
                            {formattedBalance}
                        </QuantityEtherscanLink>
                    </CustomTD>
                    <CustomTD styles={{ borderBottom: true, textAlign: 'left' }}>
                        <ButtonsContainer>
                            <Button onClick={openTransferModal} variant={ButtonVariant.Primary}>
                                Deposit
                            </Button>
                        </ButtonsContainer>
                    </CustomTD>
                </TR>
            );
        });

        let content: React.ReactNode;
        if (web3State === Web3State.Loading) {
            content = <LoadingWrapper />;
        } else {
            content = (
                <>
                    <Table isResponsive={true}>
                        <THead>
                            <TR>
                                <THStyled>Token</THStyled>
                                <THStyled>{}</THStyled>
                                <THStyled styles={{ textAlign: 'right' }}>Available Qty.</THStyled>
                                <THLast styles={{ textAlign: 'center' }}>Actions</THLast>
                            </TR>
                        </THead>
                        <TBody>
                            {totalEthRow}
                            {tokensRows}
                        </TBody>
                    </Table>
                    <DepositTokenModal
                        isOpen={this.state.modalIsOpen}
                        tokenBalance={this.state.tokenBalanceSelected as TokenBalance}
                        isSubmitting={this.state.isSubmitting}
                        onSubmit={this.handleSubmit}
                        style={theme.modalTheme}
                        closeModal={this.closeModal}
                        ethBalance={ethBalance}
                        isEth={this.state.isEth}
                        wethToken={wethToken}
                    />
                </>
            );
        }

        return <Card title="Token Balances">{content}</Card>;
    };
    public closeModal = () => {
        this.setState({
            modalIsOpen: false,
        });
    };

    public openModal = () => {
        this.setState({
            modalIsOpen: true,
        });
    };

    public handleSubmit = async (amount: BigNumber, token: Token, address: string, isEth: boolean) => {
        this.setState({
            isSubmitting: true,
        });
        try {
            await this.props.onSubmitTransferToken(amount, token, address, isEth);
        } finally {
            this.setState({
                isSubmitting: false,
            });
            this.closeModal();
        }
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        ethBalance: getEthBalance(state),
        tokenBalances: getTokenBalances(state),
        web3State: getWeb3State(state),
        wethTokenBalance: getWethTokenBalance(state),
        ethAccount: getEthAccount(state),
        ethUsd: getEthInUsd(state),
        tokensPrice: getTokensPrice(state),
        wallet: getWallet(state),
    };
};
const mapDispatchToProps = {
    onStartToggleTokenLockSteps: startToggleTokenLockSteps,
    onSubmitTransferToken: startDepositTokenSteps,
    onClickOpenFiatOnRampModal: openFiatOnRampModal,
};

const DepositTokenBalancesContainer = withTheme(connect(mapStateToProps, mapDispatchToProps)(DepositTokenBalances));

// tslint:disable-next-line: max-file-line-count
export { DepositTokenBalances, DepositTokenBalancesContainer };
