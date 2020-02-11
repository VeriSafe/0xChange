import { mapCurrencyPairMetaToCurrencyPair } from '../util/currency_pair_meta_data';
import { getKnownTokens } from '../util/known_tokens';
import { CurrencyPair, CurrencyPairMetaData, Filter, Token } from '../util/types';

import { Config } from './config';
import { MAX_AMOUNT_TOKENS_IN_UNITS, UI_DECIMALS_DISPLAYED_PRICE_ETH } from './constants';

let availableMarkets: CurrencyPair[] = [];

const allFilter = {
    text: 'ALL',
    value: null,
};
const suppliedMarketFilters = Config.getConfig().marketFilters;
export const marketFilters: Filter[] = suppliedMarketFilters ? [...suppliedMarketFilters, allFilter] : [];

export const updateAvailableMarkets = (pairs: CurrencyPairMetaData[]) => {
    availableMarkets = pairs.map(mapCurrencyPairMetaToCurrencyPair);
    return availableMarkets;
};

export const getAvailableMarkets = (): CurrencyPair[] => {
    if (!availableMarkets.length) {
        availableMarkets = Config.getConfig().pairs.map(mapCurrencyPairMetaToCurrencyPair);
    }
    return availableMarkets;
};

export const addAvailableMarket = (token: Token): CurrencyPair | null => {
    const availableMarketsData = getAvailableMarkets();
    const known_tokens = getKnownTokens();
    const wethToken = known_tokens.getWethToken();
    if (!availableMarketsData.find(c => c.base === token.symbol.toLowerCase())) {
        const marketToAdd = {
            base: token.symbol.toLowerCase(),
            quote: wethToken.symbol,
            config: {
                basePrecision: 0,
                pricePrecision: 8,
                minAmount: 0,
                maxAmount: MAX_AMOUNT_TOKENS_IN_UNITS,
                quotePrecision: UI_DECIMALS_DISPLAYED_PRICE_ETH,
            },
        };
        availableMarketsData.push(marketToAdd);
        return marketToAdd;
    } else {
        return null;
    }
};
