import { SignedOrder } from '@0x/types';
import { BigNumber } from '@0x/utils';

export interface GetSwapQuoteResponse {
    price: BigNumber;
    to: string;
    data: string;
    gasPrice: BigNumber;
    protocolFee: BigNumber;
    orders: SignedOrder[];
    buyAmount: BigNumber;
    sellAmount: BigNumber;
    value: BigNumber;
    gas?: BigNumber;
    from?: string;
}

export interface GetSwapQuoteRequestParams {
    sellToken: string;
    buyToken: string;
    takerAddress?: string;
    sellAmount?: BigNumber;
    buyAmount?: BigNumber;
    slippagePercentage?: number;
    gasPrice?: BigNumber;
}

export interface CalculateSwapQuoteParams {
    buyTokenAddress: string;
    sellTokenAddress: string;
    buyAmount: BigNumber | undefined;
    sellAmount: BigNumber | undefined;
    from: string | undefined;
    isETHSell: boolean;
    slippagePercentage?: number;
    gasPrice?: BigNumber;
}

export enum ChainId {
    Mainnet = 1,
    Kovan = 42,
    Ganache = 1337,
}
