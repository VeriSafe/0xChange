import { BigNumber } from '@0x/utils';
import React from 'react';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import { UI_DECIMALS_DISPLAYED_SPREAD_PERCENT, ZERO } from '../../../common/constants';
import {
    getBaseToken,
    getCurrencyPair,
    getOrderBook,
    getQuoteToken,
    getSpread,
    getSpreadInPercentage,
    getUserOrders,
    getWeb3State,
} from '../../../store/selectors';
import { setMakerAmountSelected, setOrderPriceSelected } from '../../../store/ui/actions';
import { Theme, themeBreakPoints } from '../../../themes/commons';
import { formatTokenSymbol, tokenAmountInUnits } from '../../../util/tokens';
import {
    CurrencyPair,
    OrderBook,
    OrderBookItem,
    OrderSide,
    StoreState,
    Token,
    UIOrder,
    Web3State,
} from '../../../util/types';
import { Card } from '../../common/card';
import { EmptyContent } from '../../common/empty_content';
import { BuyBookIcon } from '../../common/icons/buy_book';
import { BuySellBookIcon } from '../../common/icons/buysell_book';
import { SellBookIcon } from '../../common/icons/sell_book';
import { LoadingWrapper } from '../../common/loading';
import { ShowNumberWithColors } from '../../common/show_number_with_colors';
import { CustomTD, CustomTDLast, CustomTDTitle, TH, THLast } from '../../common/table';

import {
    customTDLastStyles,
    customTDStyles,
    customTDTitleStyles,
    GridRowSpread,
    GridRowSpreadContainer,
    StickySpreadState,
} from './grid_row_spread';

interface StateProps {
    orderBook: OrderBook;
    baseToken: Token | null;
    quoteToken: Token | null;
    userOrders: UIOrder[];
    web3State?: Web3State;
    absoluteSpread: BigNumber;
    percentageSpread: BigNumber;
    currencyPair: CurrencyPair;
}

interface OwnProps {
    theme: Theme;
}

type Props = OwnProps & StateProps;

const OrderbookCard = styled(Card)`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;

    > div:first-child {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
        padding-bottom: 0;
        padding-left: 0;
        padding-right: 0;
    }
`;

const GridRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
`;

interface TotalProps {
    isBottom?: boolean;
    isTop?: boolean;
}

const THBooksOptions = styled(TH)`
    font-size: ${props => props.theme.componentsTheme.orderbookTHFontSize};
    display: flex;
    text-transform: none;
    padding-left: 5px;
`;
const BookOption = styled.span<{ isSelected: boolean }>`
    padding-right: 3px;
    cursor: pointer;
    border: ${props => (props.isSelected ? `1px solid ${props.theme.componentsTheme.textColorCommon}` : 'none')};
`;

const THTotal = styled(TH)`
    font-size: ${props => props.theme.componentsTheme.orderbookTHFontSize};
    text-transform: none;
    padding-left: 5px;
`;

const CustomTH = styled(TH)`
    font-size: ${props => props.theme.componentsTheme.orderbookTHFontSize};
    text-transform: none;
`;

const CustomTHLast = styled(THLast)`
    font-size: ${props => props.theme.componentsTheme.orderbookTHFontSize};
`;

const CustomTDBook = styled(CustomTD)`
    font-size: ${props => props.theme.componentsTheme.orderbookTDFontSize};
`;

const CustomTDSpread = styled(CustomTD)`
    font-size: ${props => props.theme.componentsTheme.orderbookTDFontSize};
`;

const CustomTDLastBook = styled(CustomTDLast)`
    font-size: ${props => props.theme.componentsTheme.orderbookTDFontSize};
`;

const TotalRow = styled.div<TotalProps>`
    background-color: 'transparent';
    padding-right: 5px;
    display: flex;
    justify-content: space-between;
    border-bottom: ${props =>
        props && props.isBottom ? `1px solid ${props.theme.componentsTheme.tableBorderColor}` : 'none'};
    border-top: ${props => (props.isTop ? `1px solid ${props.theme.componentsTheme.tableBorderColor}` : 'none')};
`;

const GridRowInner = styled(GridRow)`
    background-color: 'transparent';
    cursor: pointer;
    &:hover {
        background-color: ${props => props.theme.componentsTheme.rowOrderActive};
    }
`;

const GridRowTop = styled(GridRow)`
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
`;

const CenteredLoading = styled(LoadingWrapper)`
    height: 100%;
`;

const ItemsScroll = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-height: 500px;
    overflow: auto;

    @media (min-width: ${themeBreakPoints.xl}) {
        max-height: auto;
    }
`;

const ItemsMainContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    min-height: fit-content;
    position: relative;
    z-index: 1;
`;

const ItemsInnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
`;

const TopItems = styled(ItemsInnerContainer)`
    justify-content: flex-end;
`;

const BottomItems = styled(ItemsInnerContainer)`
    justify-content: flex-start;
`;

const DepthSelect = styled.select`
    background-color: ${props => props.theme.componentsTheme.cardBackgroundColor};
    color: ${props => props.theme.componentsTheme.textColorCommon};
    padding-left: 1px;
`;

interface OrderToRowPropsOwn {
    order: OrderBookItem;
    index: number;
    count: number;
    baseToken: Token;
    priceColor: string;
    orders: OrderBookItem[];
    mySizeOrders: OrderBookItem[];
    web3State?: Web3State;
    currencyPair: CurrencyPair;
}

interface OrderToRowDispatchProps {
    onSetOrderPriceSelected: (orderPriceSelected: BigNumber) => Promise<any>;
    onSetMakerAmountSelected: (makerAmountSelected: BigNumber) => Promise<any>;
}

type OrderToRowProps = OrderToRowPropsOwn & OrderToRowDispatchProps;

interface State {
    isHover: boolean;
}

class OrderToRow extends React.Component<OrderToRowProps> {
    public state: State = {
        isHover: false,
    };

    public hoverOn = () => {
        this.setState({ isHover: true });
    };

    public hoverOff = () => {
        this.setState({ isHover: false });
    };

    public render = () => {
        const { order, index, baseToken, priceColor, mySizeOrders = [], web3State, currencyPair } = this.props;
        const basePrecision = currencyPair.config.basePrecision;
        const pricePrecision = currencyPair.config.pricePrecision;

        const size = tokenAmountInUnits(order.size, baseToken.decimals, basePrecision);
        const price = order.price.toString();

        const mySize = mySizeOrders.reduce((sumSize, mySizeItem) => {
            if (mySizeItem.price.eq(order.price)) {
                return sumSize.plus(mySizeItem.size);
            }
            return sumSize;
        }, ZERO);

        const mySizeConverted = tokenAmountInUnits(mySize, baseToken.decimals, basePrecision);
        const isMySizeEmpty = mySize.eq(new BigNumber(0));
        const displayColor = isMySizeEmpty ? '#dedede' : undefined;
        const mySizeRow =
            web3State !== Web3State.Locked && web3State !== Web3State.NotInstalled ? (
                <CustomTDLastBook
                    as="div"
                    styles={{ tabular: true, textAlign: 'right', color: displayColor }}
                    id="mySize"
                >
                    {isMySizeEmpty ? '-' : mySizeConverted}
                </CustomTDLastBook>
            ) : null;

        return (
            <GridRowInner
                key={index}
                onMouseEnter={this.hoverOn}
                onMouseLeave={this.hoverOff}
                // tslint:disable-next-line jsx-no-lambda
                onClick={() => this._setOrderPriceSelected(order.price)}
            >
                <CustomTDBook as="div" styles={{ tabular: true, textAlign: 'right' }}>
                    <ShowNumberWithColors
                        isHover={this.state.isHover}
                        num={new BigNumber(size)}
                        precision={basePrecision}
                    />
                </CustomTDBook>
                <CustomTDBook as="div" styles={{ tabular: true, textAlign: 'right', color: priceColor }}>
                    {parseFloat(price).toFixed(pricePrecision)}
                </CustomTDBook>
                {mySizeRow}
            </GridRowInner>
        );
    };

    private readonly _setOrderPriceSelected = async (size: BigNumber) => {
        const { order, orders } = this.props;
        let totalSize = ZERO;
        if (order.side === OrderSide.Buy) {
            totalSize = orders.reduce((sumSize, sizeItem) => {
                if (order.price.lte(sizeItem.price)) {
                    return sumSize.plus(sizeItem.size);
                }
                return sumSize;
            }, ZERO);
        } else {
            totalSize = orders.reduce((sumSize, sizeItem) => {
                if (order.price.gte(sizeItem.price)) {
                    return sumSize.plus(sizeItem.size);
                }
                return sumSize;
            }, ZERO);
        }

        await this.props.onSetOrderPriceSelected(size);
        await this.props.onSetMakerAmountSelected(totalSize);
    };
}

const mapOrderToRowDispatchToProps = (dispatch: any): OrderToRowDispatchProps => {
    return {
        onSetOrderPriceSelected: (orderPriceSelected: BigNumber) => dispatch(setOrderPriceSelected(orderPriceSelected)),
        onSetMakerAmountSelected: (makerAmountSelected: BigNumber) =>
            dispatch(setMakerAmountSelected(makerAmountSelected)),
    };
};

const OrderToRowContainer = connect(null, mapOrderToRowDispatchToProps)(OrderToRow);

enum BookOptionType {
    BuySellBook,
    SellBook,
    BuyBook,
}

interface StateOrderBook {
    depth: { value: number };
    bookOption: BookOptionType;
}
class OrderBookTable extends React.Component<Props, StateOrderBook> {
    public state = {
        depth: { value: 5 },
        bookOption: BookOptionType.BuySellBook,
    };

    private readonly _spreadRowScrollable: React.RefObject<HTMLDivElement>;
    private readonly _spreadRowFixed: React.RefObject<GridRowSpread>;
    private readonly _itemsScroll: React.RefObject<HTMLDivElement>;
    private _hasScrolled = false;

    constructor(props: Props) {
        super(props);

        this._spreadRowScrollable = React.createRef();
        this._spreadRowFixed = React.createRef();
        this._itemsScroll = React.createRef();
    }

    public render = () => {
        const {
            orderBook,
            baseToken,
            quoteToken,
            web3State,
            theme,
            absoluteSpread,
            percentageSpread,
            currencyPair,
        } = this.props;
        const { sellOrders, buyOrders, mySizeOrders } = orderBook;
        const mySizeSellArray = mySizeOrders.filter((order: { side: OrderSide }) => {
            return order.side === OrderSide.Sell;
        });
        const mySizeBuyArray = mySizeOrders.filter((order: { side: OrderSide }) => {
            return order.side === OrderSide.Buy;
        });
        const getColor = (order: OrderBookItem): string => {
            return order.side === OrderSide.Buy ? theme.componentsTheme.green : theme.componentsTheme.red;
        };

        let content: React.ReactNode;

        if (web3State !== Web3State.Error && (!baseToken || !quoteToken)) {
            content = <CenteredLoading />;
        } else if (web3State === Web3State.Loading) {
            content = <CenteredLoading />;
        } else if ((!buyOrders.length && !sellOrders.length) || !baseToken || !quoteToken) {
            content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
        } else {
            const mySizeHeader =
                web3State !== Web3State.Locked && web3State !== Web3State.NotInstalled ? (
                    <CustomTHLast as="div" styles={{ textAlign: 'right', borderBottom: true }}>
                        My Size
                    </CustomTHLast>
                ) : null;

            const spreadAbsFixed = absoluteSpread.toFixed(currencyPair.config.pricePrecision);
            const spreadPercentFixed = percentageSpread.toFixed(UI_DECIMALS_DISPLAYED_SPREAD_PERCENT);
            const basePrecision = currencyPair.config.basePrecision;

            const totalBase = tokenAmountInUnits(
                sellOrders.length > 1 ? sellOrders.map(o => o.size).reduce((p, c) => p.plus(c)) : new BigNumber(0),
                baseToken.decimals,
                basePrecision,
            );

            const totalQuote =
                buyOrders.length > 1
                    ? buyOrders
                          .map(o =>
                              new BigNumber(tokenAmountInUnits(o.size, baseToken.decimals, basePrecision)).multipliedBy(
                                  o.price,
                              ),
                          )
                          .reduce((p, c) => p.plus(c))
                          .toFixed(2)
                    : new BigNumber(0).toFixed(2);

            const baseSymbol = formatTokenSymbol(baseToken.symbol);
            const quoteSymbol = formatTokenSymbol(quoteToken.symbol);

            const handleDepth = (event: any) => {
                this.setState({ depth: { value: Number(event.target.value) } });
            };
            const bookOptionState = this.state.bookOption;
            const handleBookOption = (option: BookOptionType) => {
                this.setState({ bookOption: option });
            };

            content = (
                <>
                    {
                        <TotalRow isBottom={true}>
                            <THBooksOptions as="div" styles={{ textAlign: 'left' }}>
                                <BookOption
                                    isSelected={bookOptionState === BookOptionType.BuySellBook}
                                    onClick={() => handleBookOption(BookOptionType.BuySellBook)}
                                >
                                    {' '}
                                    <BuySellBookIcon />
                                </BookOption>
                                <BookOption
                                    isSelected={bookOptionState === BookOptionType.BuyBook}
                                    onClick={() => handleBookOption(BookOptionType.BuyBook)}
                                >
                                    {' '}
                                    <BuyBookIcon />{' '}
                                </BookOption>
                                <BookOption
                                    isSelected={bookOptionState === BookOptionType.SellBook}
                                    onClick={() => handleBookOption(BookOptionType.SellBook)}
                                >
                                    {' '}
                                    <SellBookIcon />{' '}
                                </BookOption>
                            </THBooksOptions>
                            <CustomTH as="div" styles={{ textAlign: 'right' }}>
                                Depth
                                <DepthSelect value={this.state.depth.value} onChange={handleDepth}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </DepthSelect>
                            </CustomTH>
                        </TotalRow>
                    }
                    <TotalRow isBottom={true}>
                        <THTotal as="div" styles={{ textAlign: 'left' }}>{`Asks`}</THTotal>
                        <CustomTH as="div" styles={{ textAlign: 'right' }}>
                            {`Total: ${totalBase} ${baseSymbol}`}
                        </CustomTH>
                    </TotalRow>
                    <GridRowTop as="div">
                        <CustomTH as="div" styles={{ textAlign: 'right', borderBottom: true }}>
                            Trade size
                        </CustomTH>
                        <CustomTH as="div" styles={{ textAlign: 'right', borderBottom: true }}>
                            Price ({formatTokenSymbol(quoteToken.symbol)})
                        </CustomTH>
                        {mySizeHeader}
                    </GridRowTop>
                    <ItemsScroll ref={this._itemsScroll} onScroll={this._updateStickySpreadState}>
                        {bookOptionState !== BookOptionType.BuyBook && (
                            <GridRowSpread
                                ref={this._spreadRowFixed}
                                spreadAbsValue={spreadAbsFixed}
                                spreadPercentValue={spreadPercentFixed}
                            />
                        )}
                        <ItemsMainContainer>
                            {(bookOptionState === BookOptionType.BuySellBook ||
                                bookOptionState === BookOptionType.SellBook) && (
                                <TopItems>
                                    {sellOrders
                                        .slice(sellOrders.length - this.state.depth.value, sellOrders.length)
                                        .map((order, index) => (
                                            <OrderToRowContainer
                                                key={index}
                                                order={order}
                                                index={index}
                                                count={sellOrders.length}
                                                orders={sellOrders}
                                                baseToken={baseToken}
                                                priceColor={getColor(order)}
                                                mySizeOrders={mySizeSellArray}
                                                web3State={web3State}
                                                currencyPair={currencyPair}
                                            />
                                        ))}
                                </TopItems>
                            )}
                            <GridRowSpreadContainer ref={this._spreadRowScrollable}>
                                <CustomTDTitle as="div" styles={customTDTitleStyles}>
                                    Spread
                                </CustomTDTitle>
                                <CustomTDSpread as="div" styles={customTDStyles}>
                                    {spreadAbsFixed}
                                </CustomTDSpread>
                                <CustomTDLast as="div" styles={customTDLastStyles}>
                                    {spreadPercentFixed}%
                                </CustomTDLast>
                            </GridRowSpreadContainer>
                            {(bookOptionState === BookOptionType.BuyBook ||
                                bookOptionState === BookOptionType.BuySellBook) && (
                                <BottomItems>
                                    {buyOrders.slice(0, this.state.depth.value).map((order, index) => (
                                        <OrderToRowContainer
                                            key={index}
                                            order={order}
                                            index={index}
                                            count={buyOrders.length}
                                            orders={buyOrders}
                                            baseToken={baseToken}
                                            priceColor={getColor(order)}
                                            mySizeOrders={mySizeBuyArray}
                                            web3State={web3State}
                                            currencyPair={currencyPair}
                                        />
                                    ))}
                                </BottomItems>
                            )}
                        </ItemsMainContainer>
                    </ItemsScroll>
                    <TotalRow isTop={true}>
                        <THTotal as="div" styles={{ textAlign: 'left' }}>{`Bids`}</THTotal>
                        <CustomTH as="div" styles={{ textAlign: 'right' }}>
                            {`Total: ${totalQuote} ${quoteSymbol}`}
                        </CustomTH>{' '}
                    </TotalRow>
                </>
            );
        }

        return <OrderbookCard>{content}</OrderbookCard>;
    };

    public componentDidMount = () => {
        this._scrollToSpread();
    };

    public componentDidUpdate = () => {
        this._refreshStickySpreadOnItemsListUpdate();
        this._scrollToSpread();
    };

    private readonly _refreshStickySpreadOnItemsListUpdate = () => {
        if (this._spreadRowFixed.current && this._hasScrolled) {
            this._spreadRowFixed.current.updateStickSpreadState(this._getStickySpreadState(), this._getSpreadWidth());
        }
    };

    private readonly _getSpreadWidth = (): string => {
        return this._itemsScroll.current ? `${this._itemsScroll.current.clientWidth}px` : '';
    };

    private readonly _getSpreadOffsetTop = (): number => {
        return this._spreadRowScrollable.current ? this._spreadRowScrollable.current.offsetTop : 0;
    };

    private readonly _getSpreadHeight = (): number => {
        return this._spreadRowScrollable.current ? this._spreadRowScrollable.current.clientHeight : 0;
    };

    private readonly _getItemsListScroll = (): number => {
        return this._itemsScroll.current ? this._itemsScroll.current.scrollTop : 0;
    };

    private readonly _getItemsListHeight = (): number => {
        return this._itemsScroll.current ? this._itemsScroll.current.clientHeight : 0;
    };

    private readonly _getStickySpreadState = (): StickySpreadState => {
        const spreadOffsetTop = this._getSpreadOffsetTop();
        const itemsListScroll = this._getItemsListScroll();
        const topLimit = 0;

        if (spreadOffsetTop - itemsListScroll <= topLimit) {
            return 'top';
        } else if (itemsListScroll + this._getItemsListHeight() - this._getSpreadHeight() <= spreadOffsetTop) {
            return 'bottom';
        } else {
            return 'hidden';
        }
    };

    private readonly _updateStickySpreadState = () => {
        if (this._spreadRowFixed.current) {
            this._spreadRowFixed.current.updateStickSpreadState(this._getStickySpreadState(), this._getSpreadWidth());
        }
    };

    private readonly _scrollToSpread = () => {
        const { current } = this._spreadRowScrollable;

        // avoid scrolling for tablet sized screens and below
        if (window.outerWidth < parseInt(themeBreakPoints.xl, 10)) {
            return;
        }

        if (current && !this._hasScrolled) {
            // tslint:disable-next-line:no-unused-expression
            current.scrollIntoView && current.scrollIntoView({ block: 'center', behavior: 'smooth' });
            this._hasScrolled = true;
        }
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        orderBook: getOrderBook(state),
        baseToken: getBaseToken(state),
        userOrders: getUserOrders(state),
        quoteToken: getQuoteToken(state),
        web3State: getWeb3State(state),
        absoluteSpread: getSpread(state),
        percentageSpread: getSpreadInPercentage(state),
        currencyPair: getCurrencyPair(state),
    };
};

const OrderBookTableContainer = withTheme(connect(mapStateToProps)(OrderBookTable));
const OrderBookTableWithTheme = withTheme(OrderBookTable);

export { OrderBookTable, OrderBookTableWithTheme, OrderBookTableContainer };
