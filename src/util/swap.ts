import { Token } from './types';

export const filterTokensByString = (tokens: Token[], str: string): Token[] => {
    return tokens.filter(token => {
        return token.symbol.toLowerCase().indexOf(str.toLowerCase()) !== -1;
    });
};
