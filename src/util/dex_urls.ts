export const generateTrustWalletDeepLink = (url: string) => {
    return `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURI(url)}`;
};

export const generateMetamaskWalletDeepLink = (url: string) => {
    return `https://metamask.app.link/dapp/${url}`;
};

export const generateInstantLink = (address: string) => {
    return `https://dex.verisafe.io/#/instant?token=${address}`;
};

export const generateIEOInstantLink = (address: string, makerAddress: string) => {
    return `https://dex.verisafe.io/#/instant?token=${address}&makerAddress=${makerAddress}&isEIO=true`;
};

export const generateIEODashboardLink = (address: string, makerAddress: string) => {
    return `https://dex.verisafe.io/#/launchpad/orders?token=${address}&makerAddress=${makerAddress}&isEIO=true`;
};

export const generateERC20TradeLink = (address: string) => {
    return `https://dex.verisafe.io/#/?base=${address}&quote=weth`;
};

export const generateERC20MarketTradeLink = (address: string) => {
    return `https://dex.verisafe.io/#/market-trade?token=${address}`;
};
