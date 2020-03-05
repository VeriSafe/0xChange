import { ExchangeFillEventArgs, LogWithDecodedArgs } from '@0x/contract-wrappers';
import { assetDataUtils, ERC20AssetData } from '@0x/order-utils';
import { AssetProxyId } from '@0x/types';

import { ConfigIEO } from '../common/config';
import { KNOWN_TOKENS_META_DATA } from '../common/tokens_meta_data';
import { KNOWN_TOKENS_IEO_META_DATA, TokenIEOMetaData } from '../common/tokens_meta_data_ieo';

import { getKnownTokens, getTokenMetadaDataFromContract, getTokenMetadaDataFromServer } from './known_tokens';
import { getLogger } from './logger';
import { mapTokensBotToTokenIEO, mapTokensIEOMetaDataToTokenByNetworkId } from './token_ieo_meta_data';
import { TokenIEO } from './types';

const logger = getLogger('Tokens::known_tokens .ts');

export class KnownTokensIEO {
    private readonly _tokens: TokenIEO[] = [];
    private readonly _tokensBot: TokenIEO[] = [];

    constructor(knownTokensMetadata: TokenIEOMetaData[]) {
        this._tokens = mapTokensIEOMetaDataToTokenByNetworkId(knownTokensMetadata);
        this._tokensBot = mapTokensBotToTokenIEO(ConfigIEO.getConfigBot().tokens);
    }

    public getTokenBySymbol = (symbol: string): TokenIEO => {
        const symbolInLowerCaseScore = symbol.toLowerCase();
        const token = this._tokens.find(t => t.symbol === symbolInLowerCaseScore);
        if (!token) {
            const errorMessage = `Token with symbol ${symbol} not found in known tokens`;
            logger.log(errorMessage);
            throw new Error(errorMessage);
        }
        return token;
    };
    public getTokenByName = (name: string): TokenIEO => {
        const nameInLowerCaseScore = name.toLowerCase();
        const token = this._tokens.find(t => t.name.toLowerCase() === nameInLowerCaseScore);
        if (!token) {
            const errorMessage = `Token with symbol ${name} not found in known tokens`;
            logger.log(errorMessage);
            throw new Error(errorMessage);
        }
        return token;
    };

    public getTokenByAddress = (address: string): TokenIEO => {
        const addressInLowerCase = address.toLowerCase();
        const token = this._tokens.find(t => t.address.toLowerCase() === addressInLowerCase);
        if (!token) {
            throw new Error(`Token with address ${address} not found in known tokens`);
        }
        return token;
    };
    public getTokenBotByAddress = (address: string): TokenIEO => {
        const addressInLowerCase = address.toLowerCase();
        const token = this._tokensBot.find(t => t.address.toLowerCase() === addressInLowerCase);
        if (!token) {
            throw new Error(`Token with address ${address} not found in known tokens`);
        }
        return token;
    };
    public getAllTokensByAddress = (address: string): TokenIEO => {
        const addressInLowerCase = address.toLowerCase();
        let token = this._tokensBot.find(t => t.address.toLowerCase() === addressInLowerCase);
        if (!token) {
            token = this._tokens.find(t => t.address.toLowerCase() === addressInLowerCase);
        }
        if (!token) {
            throw new Error(`Token with address ${address} not found in known tokens`);
        }
        return token;
    };

    public getTokenBotByName = (name: string): TokenIEO => {
        const nameInLowerCase = name.toLowerCase();
        const token = this._tokensBot.find(t => t.name.toLowerCase() === nameInLowerCase);
        if (!token) {
            throw new Error(`Token with address ${name} not found in known tokens`);
        }
        return token;
    };
    public getTokenBotBySymbol = (symbol: string): TokenIEO => {
        const symbolInLowerCase = symbol.toLowerCase();
        const token = this._tokensBot.find(t => t.symbol.toLowerCase() === symbolInLowerCase);
        if (!token) {
            throw new Error(`Token with address ${symbol} not found in known tokens`);
        }
        return token;
    };

    public getAllTokensByName = (name: string): TokenIEO => {
        const nameInLowerCase = name.toLowerCase();
        let token = this._tokensBot.find(t => t.name.toLowerCase() === nameInLowerCase);
        if (!token) {
            token = this._tokens.find(t => t.name.toLowerCase() === nameInLowerCase);
        }
        if (!token) {
            throw new Error(`Token with address ${name} not found in known tokens`);
        }
        return token;
    };

    public getTokenByAssetData = (assetData: string): TokenIEO => {
        const tokenAddress = (assetDataUtils.decodeAssetDataOrThrow(assetData) as ERC20AssetData).tokenAddress;
        return this.getTokenByAddress(tokenAddress);
    };

    public isKnownAddress = (address: string): boolean => {
        try {
            this.getTokenByAddress(address);
            return true;
        } catch (e) {
            return false;
        }
    };
    public addTokenByAddress = async (address: string, makerAddress: string): Promise<TokenIEO | null> => {
        if (this.isKnownAddress(address.toLowerCase())) {
            return null;
        }
        let token;
        try {
            token = await getTokenMetadaDataFromContract(address);
        } catch {
            token = await getTokenMetadaDataFromServer(address);
        }
        if (!token) {
            return null;
        }
        const tokenToAdd = {
            ...token,
            social: {},
            owners: [makerAddress.toLowerCase()],
            feePercentage: '0.05',
        };
        // TODO refactor to remove this
        const tokens = getKnownTokens();
        if (!tokens.isIEOKnownAddress(token.address)) {
            tokens.pushTokenIEO(tokenToAdd);
        }

        this._tokens.push(tokenToAdd);
        return tokenToAdd;
    };

    /**
     * Checks if a Fill event is valid.
     *
     * A Fill event is considered valid if the order involves two ERC20 tokens whose addresses we know.
     *
     */
    public isValidFillEvent = (fillEvent: LogWithDecodedArgs<ExchangeFillEventArgs>): boolean => {
        const { makerAssetData, takerAssetData } = fillEvent.args;

        if (!isERC20AssetData(makerAssetData) || !isERC20AssetData(takerAssetData)) {
            return false;
        }

        const makerAssetAddress = (assetDataUtils.decodeAssetDataOrThrow(makerAssetData) as ERC20AssetData)
            .tokenAddress;
        const takerAssetAddress = (assetDataUtils.decodeAssetDataOrThrow(takerAssetData) as ERC20AssetData)
            .tokenAddress;

        if (!this.isKnownAddress(makerAssetAddress) || !this.isKnownAddress(takerAssetAddress)) {
            return false;
        }

        return true;
    };
    public getTokens = (): TokenIEO[] => {
        return this._tokens;
    };
}

let knownTokensIEO: KnownTokensIEO;
export const getKnownTokensIEO = (
    knownTokensMetadata: TokenIEOMetaData[] = KNOWN_TOKENS_IEO_META_DATA,
): KnownTokensIEO => {
    if (!knownTokensIEO) {
        knownTokensIEO = new KnownTokensIEO(knownTokensMetadata);
    }
    return knownTokensIEO;
};

export const getColorBySymbol = (symbol: string): string => {
    const token = KNOWN_TOKENS_META_DATA.find(t => t.symbol === symbol.toLowerCase());
    if (!token) {
        throw new Error(`Token with symbol ${symbol} not found in known tokens`);
    }

    return token.primaryColor;
};

export const isZrx = (token: string): boolean => {
    return token === 'zrx';
};

export const isWeth = (token: string): boolean => {
    return token === 'weth';
};

export const isERC20AssetData = (assetData: string): boolean => {
    try {
        const asset = assetDataUtils.decodeAssetDataOrThrow(assetData);
        if (asset.assetProxyId === AssetProxyId.ERC20) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
};
