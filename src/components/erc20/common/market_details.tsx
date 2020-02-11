import { BigNumber } from '@0x/utils';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { USE_RELAYER_MARKET_UPDATES } from '../../../common/constants';
import { changeMarket, goToHome } from '../../../store/actions';
import {
    getBaseToken,
    getCurrencyPair,
    getCurrentMarketLastPrice,
    getCurrentMarketTodayClosedOrders,
    getCurrentMarketTodayHighPrice,
    getCurrentMarketTodayLowerPrice,
    getCurrentMarketTodayQuoteVolume,
    getERC20Theme,
    getQuoteToken,
    getWeb3State,
} from '../../../store/selectors';
import { Theme, themeBreakPoints } from '../../../themes/commons';
import { marketToString } from '../../../util/markets';
import { isMobile } from '../../../util/screen';
import { formatTokenName, formatTokenSymbol, getEtherscanLinkForToken, tokenAmountInUnits } from '../../../util/tokens';
import { CurrencyPair, StoreState, Token, Web3State } from '../../../util/types';
import { Card } from '../../common/card';
import { EmptyContent } from '../../common/empty_content';
import { withWindowWidth } from '../../common/hoc/withWindowWidth';
import { TokenIcon } from '../../common/icons/token_icon';
import { LoadingWrapper } from '../../common/loading';
import { CustomTD, Table, TH, THead, TR } from '../../common/table';

const TVChartContainer = React.lazy(() => import('../marketplace/tv_chart'));

const MarketDetailCard = styled(Card)`
    height: 100%;
    overflow: auto;
    margin-top: 0px;
    padding: 0px;
`;

const TokenIconStyled = styled(TokenIcon)`
    margin-right: 2px;
`;

const TokenEtherscanLink = styled.a`
    align-items: center;
    color: ${props => props.theme.componentsTheme.myWalletLinkColor};
    display: flex;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
    @media (max-width: ${themeBreakPoints.sm}) {
        display: inline;
    }
`;

const StyledHr = styled.hr`
    border-color: ${props => props.theme.componentsTheme.dropdownBorderColor};
`;

const TD = styled(CustomTD)`
    font-size: ${props => props.theme.componentsTheme.marketDetailsTDFontSize};
`;
const TDToken = styled(TD)`
    display: flex;
    flex-direction: row;
`;

const THStyled = styled(TH)`
    font-size: ${props => props.theme.componentsTheme.marketDetailsTHFontSize};
`;

interface StateProps {
    baseToken: Token | null;
    quoteToken: Token | null;
    web3State?: Web3State;
    currencyPair: CurrencyPair;
    highPrice: BigNumber | number | null;
    lowerPrice: BigNumber | number | null;
    volume: BigNumber | null;
    closedOrders: number | null;
    lastPrice: string | null;
    theme: Theme;
}

interface DispatchProps {
    changeMarket: (currencyPair: CurrencyPair) => any;
    goToHome: () => any;
}

interface OwnProps {
    windowWidth: number;
    isTradingGraphic: boolean;
}

type Props = StateProps & DispatchProps & OwnProps;

interface MarketStats {
    highPrice: BigNumber | null | number;
    lowerPrice: BigNumber | null | number;
    volume: BigNumber | null;
    closedOrders: number | null;
    lastPrice: string | null;
}

const statsToRow = (
    marketStats: MarketStats,
    baseToken: Token,
    quoteToken: Token,
    currencyPair: CurrencyPair,
    theme: Theme,
) => {
    const lastPrice = marketStats.lastPrice
        ? new BigNumber(marketStats.lastPrice).toFixed(currencyPair.config.pricePrecision)
        : '-';
    let volume;
    if (USE_RELAYER_MARKET_UPDATES) {
        volume =
            (marketStats.volume &&
                `${marketStats.volume.toFixed(quoteToken.displayDecimals)} ${formatTokenSymbol(quoteToken.symbol)}`) ||
            '- ';
    } else {
        volume =
            (marketStats.volume &&
                `${tokenAmountInUnits(
                    marketStats.volume,
                    quoteToken.decimals,
                    quoteToken.displayDecimals,
                ).toString()} ${formatTokenSymbol(quoteToken.symbol)}`) ||
            '- ';
    }
    const tdFontSize = theme.componentsTheme.marketStatsTDFontSize;

    return (
        <TR>
            <TDToken>
                {' '}
                <TokenIconStyled
                    symbol={baseToken.symbol}
                    primaryColor={baseToken.primaryColor}
                    icon={baseToken.icon}
                />
                <TokenEtherscanLink href={getEtherscanLinkForToken(baseToken)} target={'_blank'}>
                    {formatTokenName(baseToken.name)}
                </TokenEtherscanLink>
            </TDToken>
            <TD styles={{ textAlign: 'right', tabular: true, fontSize: tdFontSize }}>{lastPrice}</TD>
            <TD styles={{ textAlign: 'right', tabular: true, fontSize: tdFontSize }}>
                {(marketStats.highPrice && marketStats.highPrice.toFixed(currencyPair.config.pricePrecision)) || '-'}
            </TD>
            <TD styles={{ textAlign: 'right', tabular: true, fontSize: tdFontSize }}>
                {(marketStats.lowerPrice && marketStats.lowerPrice.toFixed(currencyPair.config.pricePrecision)) || '-'}
            </TD>
            <TD styles={{ textAlign: 'right', tabular: true, fontSize: tdFontSize }}>{volume}</TD>
            <TD styles={{ textAlign: 'right', tabular: true, fontSize: tdFontSize }}>
                {marketStats.closedOrders || '-'}
            </TD>
        </TR>
    );
};

const DesktopTable = (
    marketStats: MarketStats,
    baseToken: Token,
    quoteToken: Token,
    currencyPair: CurrencyPair,
    theme: Theme,
) => {
    const thFontSize = theme.componentsTheme.marketStatsTHFontSize;
    return (
        <Table isResponsive={true}>
            <THead>
                <TR>
                    <THStyled styles={{ fontSize: thFontSize }}>Project</THStyled>
                    <THStyled styles={{ textAlign: 'right', fontSize: thFontSize }}>Last Price</THStyled>
                    <THStyled styles={{ textAlign: 'right', fontSize: thFontSize }}>Max Price 24H</THStyled>
                    <THStyled styles={{ textAlign: 'right', fontSize: thFontSize }}>Min Price 24H</THStyled>
                    <THStyled styles={{ textAlign: 'right', fontSize: thFontSize }}>Volume 24H</THStyled>
                    <THStyled styles={{ textAlign: 'right', fontSize: thFontSize }}>Orders Closed</THStyled>
                </TR>
            </THead>
            <tbody>{statsToRow(marketStats, baseToken, quoteToken, currencyPair, theme)}</tbody>
        </Table>
    );
};

const MobileTable = (marketStats: MarketStats, baseToken: Token, quoteToken: Token, currencyPair: CurrencyPair) => {
    const lastPrice = marketStats.lastPrice
        ? new BigNumber(marketStats.lastPrice).toFixed(currencyPair.config.pricePrecision)
        : '-';

    return (
        <Table isResponsive={true}>
            <tbody>
                <TR>
                    <THStyled>Project</THStyled>
                    <TD styles={{ textAlign: 'right', tabular: true }}>{formatTokenName(baseToken.name)}</TD>
                </TR>
                <TR>
                    <THStyled>Last Price</THStyled>
                    <TD styles={{ textAlign: 'right', tabular: true }}>{lastPrice || '-'}</TD>
                </TR>
                <TR>
                    <THStyled>Max Price 24H</THStyled>
                    <TD styles={{ textAlign: 'right', tabular: true }}>
                        {(marketStats.highPrice && marketStats.highPrice.toFixed(currencyPair.config.pricePrecision)) ||
                            '-'}
                    </TD>
                </TR>
                <TR>
                    <THStyled>Min Price 24H</THStyled>
                    <TD styles={{ textAlign: 'right', tabular: true }}>
                        {(marketStats.lowerPrice &&
                            marketStats.lowerPrice.toFixed(currencyPair.config.pricePrecision)) ||
                            '-'}
                    </TD>
                </TR>
                <TR>
                    <THStyled>Volume 24H</THStyled>
                    <TD styles={{ textAlign: 'right', tabular: true }}>
                        {(marketStats.volume &&
                            `${tokenAmountInUnits(
                                marketStats.volume,
                                quoteToken.decimals,
                                quoteToken.displayDecimals,
                            ).toString()} ${formatTokenSymbol(quoteToken.symbol)}`) ||
                            '-'}{' '}
                    </TD>
                </TR>
                <TR>
                    <THStyled>Orders Closed</THStyled>
                    <TD styles={{ textAlign: 'right', tabular: true }}>{marketStats.closedOrders || '-'}</TD>
                </TR>
            </tbody>
        </Table>
    );
};

class MarketDetails extends React.Component<Props> {
    public render = () => {
        const { baseToken, quoteToken, web3State, currencyPair, isTradingGraphic = true, theme } = this.props;
        let content: React.ReactNode;
        const defaultBehaviour = () => {
            if (web3State !== Web3State.Error && (!baseToken || !quoteToken)) {
                content = <LoadingWrapper minHeight="120px" />;
            } else if (!baseToken || !quoteToken) {
                content = <EmptyContent alignAbsoluteCenter={true} text="There are no market details to show" />;
            } else {
                const { highPrice, lowerPrice, volume, closedOrders, lastPrice, windowWidth } = this.props;

                const marketStats = {
                    highPrice,
                    lowerPrice,
                    volume,
                    closedOrders,
                    lastPrice,
                };
                let tableMarketDetails;

                isMobile(windowWidth)
                    ? (tableMarketDetails = MobileTable(marketStats, baseToken, quoteToken, currencyPair))
                    : (tableMarketDetails = DesktopTable(marketStats, baseToken, quoteToken, currencyPair, theme));

                content = (
                    <>
                        {tableMarketDetails}
                        <StyledHr />
                        {isTradingGraphic && <TVChartContainer symbol={marketToString(currencyPair)} />}
                    </>
                );
            }
        };
        if (USE_RELAYER_MARKET_UPDATES) {
            defaultBehaviour();
        } else {
            switch (web3State) {
                case Web3State.Locked:
                case Web3State.NotInstalled: {
                    content = <EmptyContent alignAbsoluteCenter={true} text="There are no market details to show" />;
                    break;
                }
                case Web3State.Loading: {
                    content = <LoadingWrapper minHeight="120px" />;
                    break;
                }
                default: {
                    defaultBehaviour();
                    break;
                }
            }
        }
        // const title = `Market Stats: ${formatMarketToString(currencyPair)}`;

        return <MarketDetailCard minHeightBody={'90px'}>{content}</MarketDetailCard>;
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        baseToken: getBaseToken(state),
        quoteToken: getQuoteToken(state),
        web3State: getWeb3State(state),
        currencyPair: getCurrencyPair(state),
        highPrice: getCurrentMarketTodayHighPrice(state),
        lowerPrice: getCurrentMarketTodayLowerPrice(state),
        volume: getCurrentMarketTodayQuoteVolume(state),
        closedOrders: getCurrentMarketTodayClosedOrders(state),
        lastPrice: getCurrentMarketLastPrice(state),
        theme: getERC20Theme(state),
    };
};
const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        changeMarket: (currencyPair: CurrencyPair) => dispatch(changeMarket(currencyPair)),
        goToHome: () => dispatch(goToHome()),
    };
};

const MarketDetailsContainer = withWindowWidth(connect(mapStateToProps, mapDispatchToProps)(MarketDetails));

export { MarketDetails, MarketDetailsContainer };
