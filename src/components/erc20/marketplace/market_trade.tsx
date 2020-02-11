import { MarketBuySwapQuote, MarketSellSwapQuote } from '@0x/asset-swapper';
import { BigNumber } from '@0x/utils';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import styled from 'styled-components';

import { ZERO } from '../../../common/constants';
import { calculateSwapQuote, setSwapBaseToken, startSwapMarketSteps } from '../../../store/actions';
import {
    getCurrencyPair,
    getOrderPriceSelected,
    getSwapBaseToken,
    getSwapBaseTokenBalance,
    getSwapQuote,
    getSwapQuoteState,
    getSwapQuoteToken,
    getSwapQuoteTokenBalance,
    getTotalEthBalance,
    getWeb3State,
} from '../../../store/selectors';
import { themeDimensions } from '../../../themes/commons';
import { getKnownTokens, isWeth } from '../../../util/known_tokens';
import { formatTokenSymbol, tokenAmountInUnits, unitsInTokenAmount } from '../../../util/tokens';
import {
    ButtonIcons,
    ButtonVariant,
    CurrencyPair,
    OrderSide,
    StoreState,
    SwapQuoteState,
    TokenBalance,
    Web3State,
} from '../../../util/types';
import { CalculateSwapQuoteParams } from '../../../util/types/swap';
import { BigNumberInput } from '../../common/big_number_input';
import { Button } from '../../common/button';
import { CardBase } from '../../common/card_base';
import { ErrorCard, FontSize } from '../../common/error_card';
import { useDebounce } from '../../common/hooks/debounce_hook';
import { Web3StateButton } from '../../common/web3StateButton';

import { MarketTradeDetailsContainer } from './market_trade_details';

interface StateProps {
    web3State: Web3State;
    currencyPair: CurrencyPair;
    orderPriceSelected: BigNumber | null;
    baseTokenBalance: TokenBalance | null;
    quoteTokenBalance: TokenBalance | null;
    totalEthBalance: BigNumber;
}

interface DispatchProps {
    onSubmitSwapMarketOrder: (
        amount: BigNumber,
        side: OrderSide,
        quote: MarketBuySwapQuote | MarketSellSwapQuote,
    ) => Promise<any>;
}

type Props = StateProps & DispatchProps;

const BuySellWrapper = styled(CardBase)`
    margin-bottom: ${themeDimensions.verticalSeparationSm};
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
`;

const TabsContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
`;

const TabButton = styled.div<{ isSelected: boolean; side: OrderSide }>`
    align-items: center;
    background-color: ${props =>
        props.isSelected ? 'transparent' : props.theme.componentsTheme.inactiveTabBackgroundColor};
    border-bottom-color: ${props => (props.isSelected ? 'transparent' : props.theme.componentsTheme.cardBorderColor)};
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-right-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
    border-right-style: solid;
    border-right-width: 1px;
    color: ${props =>
        props.isSelected
            ? props.side === OrderSide.Buy
                ? props.theme.componentsTheme.green
                : props.theme.componentsTheme.red
            : props.theme.componentsTheme.textLight};
    cursor: ${props => (props.isSelected ? 'default' : 'pointer')};
    display: flex;
    font-weight: 600;
    height: 47px;
    justify-content: center;
    width: 50%;

    &:first-child {
        border-top-left-radius: ${themeDimensions.borderRadius};
    }

    &:last-child {
        border-left-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
        border-left-style: solid;
        border-left-width: 1px;
        border-right: none;
        border-top-right-radius: ${themeDimensions.borderRadius};
    }
`;

const LabelContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const LabelAvailableContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
`;

const Label = styled.label<{ color?: string }>`
    color: ${props => props.color || props.theme.componentsTheme.textColorCommon};
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
    margin: 0;
`;

const LabelAvaible = styled.label<{ color?: string }>`
    color: ${props => props.color || props.theme.componentsTheme.textColorCommon};
    font-size: 12px;
    font-weight: normal;
    line-height: normal;
    margin: 0;
`;

const FieldAmountContainer = styled.div`
    height: ${themeDimensions.fieldHeight};
    margin-bottom: 5px;
    position: relative;
`;

const BigInputNumberStyled = styled<any>(BigNumberInput)`
    background-color: ${props => props.theme.componentsTheme.textInputBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${props => props.theme.componentsTheme.textInputBorderColor};
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
    height: 100%;
    padding-left: 14px;
    padding-right: 60px;
    position: absolute;
    width: 100%;
    z-index: 1;
`;

const TokenContainer = styled.div`
    display: flex;
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 12;
`;

const TokenText = styled.span`
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-size: 14px;
    font-weight: normal;
    line-height: 21px;
    text-align: right;
`;

const BigInputNumberTokenLabel = (props: { tokenSymbol: string }) => (
    <TokenContainer>
        <TokenText>{formatTokenSymbol(props.tokenSymbol)}</TokenText>
    </TokenContainer>
);

const TIMEOUT_BTN_ERROR = 2000;
const TIMEOUT_CARD_ERROR = 4000;

// A custom hook that builds on useLocation to parse
// the query string for you.
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const MarketTrade = (props: Props) => {
    const [tabState, setTabState] = useState(OrderSide.Buy);
    const [errorState, setErrorState] = useState<{ btnMsg: null | string; cardMsg: null | string }>({
        btnMsg: null,
        cardMsg: null,
    });
    const [priceState, setPriceState] = useState(new BigNumber(0));
    const [makerAmountState, setMakerAmountState] = useState(new BigNumber(0));
    const { web3State, quoteTokenBalance, baseTokenBalance, totalEthBalance } = props;
    const swapQuote = useSelector(getSwapQuote);
    const quoteToken = useSelector(getSwapQuoteToken);
    const baseToken = useSelector(getSwapBaseToken);
    const swapQuoteState = useSelector(getSwapQuoteState);
    const dispatch = useDispatch();
    const query = useQuery();
    const queryToken = query.get('token');
    const decimals = baseToken.decimals;
    const known_tokens = getKnownTokens();
    useEffect(() => {
        const fetchToken = async () => {
            if (!queryToken) {
                return;
            }
            if (
                queryToken.toLowerCase() === baseToken.symbol.toLowerCase() ||
                queryToken.toLowerCase() === baseToken.address.toLowerCase()
            ) {
                return;
            }
            const t = await known_tokens.findTokenOrFetchIt(queryToken);
            if (t) {
                if (t === baseToken) {
                    return;
                } else {
                    dispatch(setSwapBaseToken(t));
                }
            }
        };
        fetchToken();
    }, [queryToken, baseToken]);

    const stepAmount = new BigNumber(1).div(new BigNumber(10).pow(8));
    const stepAmountUnits = unitsInTokenAmount(String(stepAmount), decimals);
    const amount = makerAmountState;
    const isMakerAmountEmpty = amount === null || amount.isZero();
    let isMaxAmount = false;

    const isSell = tabState === OrderSide.Sell;
    if (swapQuote && quoteTokenBalance && baseTokenBalance) {
        isMaxAmount = isSell
            ? makerAmountState.isGreaterThan(baseTokenBalance.balance)
            : swapQuote.bestCaseQuoteInfo.takerAssetAmount.isGreaterThan(
                  isWeth(quoteToken.symbol) ? totalEthBalance : quoteTokenBalance.balance,
              );
    }

    const isOrderTypeMarketIsEmpty = isMakerAmountEmpty || isMaxAmount;
    const baseSymbol = formatTokenSymbol(baseToken.symbol);
    const btnPrefix = tabState === OrderSide.Buy ? 'Buy ' : 'Sell ';
    const btnText = errorState && errorState.btnMsg ? errorState.btnMsg : btnPrefix + baseSymbol;
    const _reset = () => {
        setMakerAmountState(new BigNumber(0));
        setPriceState(new BigNumber(0));
    };
    const onCalculateSwapQuote = (value: BigNumber, side: OrderSide) => {
        const isSelling = side === OrderSide.Sell;
        const isETHSell = isSelling && isWeth(quoteToken.symbol);
        const params: CalculateSwapQuoteParams = {
            buyTokenAddress: isSelling ? quoteToken.address : baseToken.address,
            sellTokenAddress: isSelling ? baseToken.address : quoteToken.address,
            buyAmount: isSelling ? undefined : value,
            sellAmount: isSelling ? value : undefined,
            from: undefined,
            isETHSell,
        };
        if (web3State !== Web3State.Done) {
            return;
        }
        dispatch(calculateSwapQuote(params));
    };

    const debouncedAmount = useDebounce(makerAmountState, 500);
    useEffect(() => {
        if (swapQuoteState === SwapQuoteState.Error) {
            setErrorState({
                cardMsg: 'Error fetching quote',
                btnMsg: 'Try again',
            });
            setTimeout(() => {
                setErrorState({
                    ...errorState,
                    btnMsg: null,
                });
            }, TIMEOUT_BTN_ERROR);

            setTimeout(() => {
                setErrorState({
                    ...errorState,
                    cardMsg: null,
                });
            }, TIMEOUT_CARD_ERROR);
        } else {
            if (errorState.cardMsg !== null) {
                setErrorState({
                    cardMsg: null,
                    btnMsg: null,
                });
            }
        }
    }, [swapQuoteState]);

    useEffect(() => {
        if (debouncedAmount) {
            onCalculateSwapQuote(debouncedAmount, tabState);
        }
    }, [debouncedAmount]);

    useEffect(() => {
        if (makerAmountState.isGreaterThan(0)) {
            onCalculateSwapQuote(makerAmountState, tabState);
        }
    }, [baseToken]);

    const changeTab = (tab: OrderSide) => () => {
        setTabState(tab);
        if (makerAmountState.isGreaterThan(0)) {
            onCalculateSwapQuote(makerAmountState, tab);
        }
    };

    const onSubmit = async () => {
        const orderSide = tabState;
        const makerAmount = makerAmountState;

        if (!swapQuote) {
            return;
        }

        try {
            await props.onSubmitSwapMarketOrder(makerAmount, orderSide, swapQuote);
        } catch (error) {
            setErrorState({
                btnMsg: 'Error',
                cardMsg: error.message,
            });
            setTimeout(() => {
                setErrorState({
                    ...errorState,
                    btnMsg: null,
                });
            }, TIMEOUT_BTN_ERROR);

            setTimeout(() => {
                setErrorState({
                    ...errorState,
                    cardMsg: null,
                });
            }, TIMEOUT_CARD_ERROR);
        }

        _reset();
    };
    const onUpdateMakerAmount = (newValue: BigNumber) => {
        setMakerAmountState(newValue);
    };

    const getAmountAvailableLabel = () => {
        if (tabState === OrderSide.Sell) {
            if (baseTokenBalance) {
                const tokenBalanceAmount = isWeth(baseTokenBalance.token.symbol)
                    ? totalEthBalance
                    : baseTokenBalance.balance;
                const baseBalanceString = tokenAmountInUnits(
                    tokenBalanceAmount,
                    baseTokenBalance.token.decimals,
                    baseTokenBalance.token.displayDecimals,
                );
                const symbol = formatTokenSymbol(baseTokenBalance.token.symbol);
                return `Balance: ${baseBalanceString}  ${symbol}`;
            } else {
                return null;
            }
        } else {
            if (quoteTokenBalance) {
                const tokenBalanceAmount = isWeth(quoteTokenBalance.token.symbol)
                    ? totalEthBalance
                    : quoteTokenBalance.balance;
                const quoteBalanceString = tokenAmountInUnits(
                    tokenBalanceAmount,
                    quoteTokenBalance.token.decimals,
                    quoteTokenBalance.token.displayDecimals,
                );
                const symbol = formatTokenSymbol(quoteTokenBalance.token.symbol);
                return `Balance: ${quoteBalanceString}  ${symbol}`;
            } else {
                return null;
            }
        }
    };
    const btnVariant = errorState.btnMsg
        ? ButtonVariant.Error
        : tabState === OrderSide.Buy
        ? ButtonVariant.Buy
        : ButtonVariant.Sell;
    const isListed = baseToken ? baseToken.listed : true;
    const msg = 'Token inserted by User. Please proceed with caution and do your own research!';
    return (
        <>
            {!isListed && <ErrorCard fontSize={FontSize.Large} text={msg} />}
            <BuySellWrapper>
                <TabsContainer>
                    <TabButton
                        isSelected={tabState === OrderSide.Buy}
                        onClick={changeTab(OrderSide.Buy)}
                        side={OrderSide.Buy}
                    >
                        Buy
                    </TabButton>
                    <TabButton
                        isSelected={tabState === OrderSide.Sell}
                        onClick={changeTab(OrderSide.Sell)}
                        side={OrderSide.Sell}
                    >
                        Sell
                    </TabButton>
                </TabsContainer>
                <Content>
                    <LabelContainer>
                        <Label>Amount</Label>
                    </LabelContainer>
                    <FieldAmountContainer>
                        <BigInputNumberStyled
                            decimals={decimals}
                            min={ZERO}
                            onChange={onUpdateMakerAmount}
                            value={amount}
                            step={stepAmountUnits}
                            placeholder={new BigNumber(0).toString()}
                            valueFixedDecimals={8}
                        />
                        <BigInputNumberTokenLabel tokenSymbol={baseToken.symbol} />
                    </FieldAmountContainer>
                    <Web3StateButton />

                    <LabelAvailableContainer>
                        <LabelAvaible>{getAmountAvailableLabel()}</LabelAvaible>
                    </LabelAvailableContainer>
                    <MarketTradeDetailsContainer
                        orderSide={tabState}
                        tokenAmount={amount}
                        tokenPrice={priceState}
                        baseToken={baseToken}
                        quoteToken={quoteToken}
                        quote={swapQuote}
                    />
                    <Button
                        disabled={web3State !== Web3State.Done || isOrderTypeMarketIsEmpty}
                        icon={errorState.btnMsg ? ButtonIcons.Warning : undefined}
                        onClick={onSubmit}
                        variant={btnVariant}
                    >
                        {btnText}
                    </Button>
                </Content>
            </BuySellWrapper>
            {errorState.cardMsg ? <ErrorCard fontSize={FontSize.Large} text={errorState.cardMsg} /> : null}
        </>
    );
};

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        web3State: getWeb3State(state),
        currencyPair: getCurrencyPair(state),
        orderPriceSelected: getOrderPriceSelected(state),
        quoteTokenBalance: getSwapQuoteTokenBalance(state),
        baseTokenBalance: getSwapBaseTokenBalance(state),
        totalEthBalance: getTotalEthBalance(state),
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onSubmitSwapMarketOrder: (
            amount: BigNumber,
            side: OrderSide,
            quote: MarketBuySwapQuote | MarketSellSwapQuote,
        ) => dispatch(startSwapMarketSteps(amount, side, quote)),
    };
};

const MarketTradeContainer = connect(mapStateToProps, mapDispatchToProps)(MarketTrade);

export { MarketTrade, MarketTradeContainer };
