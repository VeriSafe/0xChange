import { getType } from 'typesafe-actions';

import { getKnownTokens } from '../../util/known_tokens';
import { SwapQuoteState, SwapState } from '../../util/types';
import * as actions from '../actions';
import { RootAction } from '../reducers';

const know_tokens = getKnownTokens();

/*const parsedUrl = new URL(window.location.href.replace('#/', ''));
const baseToken = parsedUrl.searchParams.get('token') || know_tokens.getTokens()[0];*/

const initialSwapState: SwapState = {
    baseToken: know_tokens.getTokens()[0],
    quoteToken: know_tokens.getWethToken(),
    quote: undefined,
    quoteState: SwapQuoteState.NotLoaded,
};

export function swap(state: SwapState = initialSwapState, action: RootAction): SwapState {
    switch (action.type) {
        case getType(actions.setSwapQuote):
            return { ...state, quote: action.payload };
        case getType(actions.setSwapQuoteState):
            return { ...state, quoteState: action.payload };
        case getType(actions.setSwapQuoteToken):
            return { ...state, quoteToken: action.payload };
        case getType(actions.setSwapBaseToken):
            return { ...state, baseToken: action.payload };
        default:
            return state;
    }
}
