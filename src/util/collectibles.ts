import { BigNumber } from '@0x/utils';

import { Collectible, CollectibleCollection } from './types';

export const getCollectiblePrice = (collectible: Collectible): BigNumber | null => {
    const { order } = collectible;
    if (order === null) {
        return null;
    }
    return order.takerAssetAmount;

    // try {
    //     const dutchAcutionData = getDutchAuctionData(order.makerAssetData);
    //     const { beginAmount, beginTimeSeconds } = dutchAcutionData;
    //     const endAmount = order.takerAssetAmount;
    //     const startTimeSeconds = order.expirationTimeSeconds;
    //     // Use y = mx + b (linear function)
    //     const m = endAmount.minus(beginAmount).dividedBy(startTimeSeconds.minus(beginTimeSeconds));
    //     const b = beginAmount.minus(beginTimeSeconds.multipliedBy(m));
    //     return m.multipliedBy(todayInSeconds()).plus(b);
    // } catch (err) {
    //     return order.takerAssetAmount;
    // }
};

export const filterCollectibleCollectionsByName = (
    collectibleCollections: CollectibleCollection[],
    name: string,
): CollectibleCollection[] => {
    return collectibleCollections.filter(collection => collection.name === name);
};

export const filterCollectibleCollectionsByString = (
    collectibleCollections: CollectibleCollection[],
    str: string,
): CollectibleCollection[] => {
    return collectibleCollections.filter(collection => {
        const nameLowerCase = collection.name.toLowerCase();
        return `${nameLowerCase}`.indexOf(str.toLowerCase()) > -1;
    });
};

export const getPathNameCollection = (collectibleCollection: CollectibleCollection) => {
    return collectibleCollection.name.toLowerCase();
};
