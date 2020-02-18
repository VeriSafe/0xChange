import slugify from 'slugify';

import { collectibleCollectionConfig } from '../config';
import { CollectibleCollection } from '../util/types';

import { CHAIN_ID } from './constants';

let collectibleCollection: CollectibleCollection[] = [];

const getContractFromChainId = (addresses: Addresses) => {
    switch (CHAIN_ID) {
        case 1:
            return addresses.mainnet;
        case 3:
            return addresses.ropsten;
        case 42:
            return addresses.kovan;
        default:
            return null;
    }
};

interface Addresses {
    mainnet?: string;
    ropsten?: string;
    kovan?: string;
}

export const getCollectibleCollections = (): CollectibleCollection[] => {
    if (collectibleCollection.length === 0) {
        collectibleCollection = collectibleCollectionConfig.collections
            .filter(c => getContractFromChainId(c.addresses) !== null)
            .map(c => {
                return {
                    slug: slugify(c.name, {
                        lower: true,
                    }),
                    name: c.name,
                    address: getContractFromChainId(c.addresses) || '0x',
                    description: c.description,
                    icon: c.icon,
                    symbol: c.symbol || c.name.toLowerCase(),
                };
            });
    }

    return collectibleCollection;
};

export const findCollectibleCollectionsBySlug = (id: string) => {
    return getCollectibleCollections().find(c => c.slug === id);
};
interface TokenMetadata {
    address: string;
    name: string;
    symbol: string;
    icon?: string;
    description?: string;
}

export const addCollection = (tokenMetadata: TokenMetadata): CollectibleCollection => {
    const collection = findCollectibleCollectionsBySlug(slugify(tokenMetadata.name));
    const collections = getCollectibleCollections();
    if (collection) {
        return collection;
    } else {
        const newCollection = {
            ...tokenMetadata,
            slug: slugify(tokenMetadata.name),
            icon: tokenMetadata.icon ? tokenMetadata.icon : '',
            description: tokenMetadata.description ? tokenMetadata.description : `Collection ${tokenMetadata.name}`,
        };
        collections.push(newCollection);
        return newCollection;
    }
};
