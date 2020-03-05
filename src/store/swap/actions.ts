import { MarketBuySwapQuote, MarketSellSwapQuote } from '@0x/asset-swapper';
import { push } from 'connected-react-router';
import queryString from 'query-string';
import { createAction } from 'typesafe-actions';

import { MARKET_APP_BASE_PATH } from '../../common/constants';
import { getAssetSwapper } from '../../services/swap';
import { getLogger } from '../../util/logger';
import { OrderSide, SwapQuoteState, ThunkCreator, Token } from '../../util/types';
import { CalculateSwapQuoteParams } from '../../util/types/swap';

const logger = getLogger('Store::Swap::Actions');

export const setSwapQuote = createAction('swap/QUOTE_set', resolve => {
    return (quote: MarketSellSwapQuote | MarketBuySwapQuote) => resolve(quote);
});

export const setSwapQuoteToken = createAction('swap/QUOTE_TOKEN_set', resolve => {
    return (token: Token) => resolve(token);
});

export const setSwapBaseToken = createAction('swap/BASE_TOKEN_set', resolve => {
    return (token: Token) => resolve(token);
});

export const setSwapQuoteState = createAction('swap/QUOTE_STATE_set', resolve => {
    return (quoteState: SwapQuoteState) => resolve(quoteState);
});

export const calculateSwapQuote: ThunkCreator = (params: CalculateSwapQuoteParams) => {
    return async (dispatch, getState) => {
        dispatch(setSwapQuoteState(SwapQuoteState.Loading));
        try {
            const assetSwapper = await getAssetSwapper();
            const quote = await assetSwapper.getSwapQuoteAsync(params);
            dispatch(setSwapQuote(quote));
            dispatch(setSwapQuoteState(SwapQuoteState.Done));
        } catch (err) {
            logger.error(`error fetching quote.`, err);
            dispatch(setSwapQuoteState(SwapQuoteState.Error));
            return err;
        }
    };
};

export const submitSwapQuote: ThunkCreator = (side: OrderSide, quote: MarketBuySwapQuote | MarketSellSwapQuote) => {
    return async () => {
        const assetSwapper = await getAssetSwapper();
        const isEthSell = side === OrderSide.Buy;
        return assetSwapper.executeSwapQuote(isEthSell, quote);
    };
};

export const changeSwapBaseToken: ThunkCreator = (token: Token) => {
    return async (dispatch, getState) => {
        const state = getState();
        dispatch(setSwapBaseToken(token));

        const newSearch = queryString.stringify({
            ...queryString.parse(state.router.location.search),
            token: token.symbol,
        });

        dispatch(
            push({
                ...state.router.location,
                pathname: `${MARKET_APP_BASE_PATH}/`,
                search: newSearch,
            }),
        );
    };
};
