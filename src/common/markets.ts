import { Filter } from '../util/types';

import { Config } from './config';
import { UI_DECIMALS_DISPLAYED_ORDER_SIZE, UI_DECIMALS_DISPLAYED_PRICE_ETH } from './constants';

export const availableMarkets = Config.getConfig().pairs.map(market => {
    if (market.config) {
        return {
            base: market.base,
            quote: market.quote,
            config: {
                basePrecision:
                    market.config.basePrecision !== undefined
                        ? market.config.basePrecision
                        : UI_DECIMALS_DISPLAYED_ORDER_SIZE,
                pricePrecision:
                    market.config.pricePrecision !== undefined
                        ? market.config.pricePrecision
                        : UI_DECIMALS_DISPLAYED_PRICE_ETH,
            },
        };
    } else {
        return {
            base: market.base,
            quote: market.quote,
            config: {
                basePrecision: UI_DECIMALS_DISPLAYED_ORDER_SIZE,
                pricePrecision: UI_DECIMALS_DISPLAYED_PRICE_ETH,
            },
        };
    }
});

const allFilter = {
    text: 'ALL',
    value: null,
};
const suppliedMarketFilters = Config.getConfig().marketFilters;
export const marketFilters: Filter[] = suppliedMarketFilters ? [...suppliedMarketFilters, allFilter] : [];
