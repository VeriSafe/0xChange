import { RateLimit } from 'async-sema';
import slugify from 'slugify';

import { NETWORK_ID, OPENSEA_API_KEY } from '../../common/constants';
import { Collectible, CollectibleCollection, CollectibleMetadataSource } from '../../util/types';

export class Opensea implements CollectibleMetadataSource {
    private readonly _rateLimit: () => Promise<void>;

    private readonly _endpointsUrls: { [key: number]: string } = {
        1: 'https://api.opensea.io/api/v1',
        // 1: 'https://vsf-cors-proxy.herokuapp.com',
        4: 'https://rinkeby-api.opensea.io/api/v1',
    };

    public static getAssetsAsCollectible(assets: any[]): Collectible[] {
        return assets.map((asset: any) => {
            return Opensea.getAssetAsCollectible(asset);
        });
    }

    public static getAssetAsCollectible(asset: any): Collectible {
        return {
            tokenId: asset.token_id,
            name: asset.name || `${asset.asset_contract.name} - #${asset.token_id}`,
            color: asset.background_color ? `#${asset.background_color}` : '',
            image: asset.image_url,
            currentOwner: asset.owner.address,
            assetUrl: asset.external_link,
            description: asset.name,
            order: null,
        };
    }

    public static getCollectionCollection(response: any): CollectibleCollection {
        return {
            slug: slugify(response.name, {
                lower: true,
            }),
            name: response.name,
            address: response.address,
            description: response.description,
            icon: response.image_url,
            symbol: response.symbol,
        };
    }

    constructor(options: { rps: number }) {
        this._rateLimit = RateLimit(options.rps); // requests per second
    }

    public async fetchAllUserCollectiblesAsync(
        userAddress: string,
        collectibleAddress: string,
    ): Promise<Collectible[]> {
        const metadataSourceUrl = this._endpointsUrls[NETWORK_ID];
        const contractAddress = collectibleAddress;
        const url = `${metadataSourceUrl}/assets?asset_contract_address=${contractAddress}&owner=${userAddress}`;
        const assetsResponse = await this._fetch(url);
        const assetsResponseJson = await assetsResponse.json();
        return Opensea.getAssetsAsCollectible(assetsResponseJson.assets);
    }

    public async fetchCollectiblesAsync(tokenIds: string[], collectibleAddress: string): Promise<Collectible[]> {
        const metadataSourceUrl = this._endpointsUrls[NETWORK_ID];
        const contractAddress = collectibleAddress;
        const tokenIdsQueryParam = tokenIds.map((id: string) => `token_ids=${id}`).join('&');
        const url = `${metadataSourceUrl}/assets?asset_contract_address=${contractAddress}&${tokenIdsQueryParam}`;
        const assetsResponse = await this._fetch(url);
        const assetsResponseJson = await assetsResponse.json();
        return Opensea.getAssetsAsCollectible(assetsResponseJson.assets);
    }

    public async fetchCollectionAsync(collectibleCollectionAddress: string): Promise<CollectibleCollection | null> {
        const metadataSourceUrl = this._endpointsUrls[NETWORK_ID];
        const url = `${metadataSourceUrl}/asset_contract/${collectibleCollectionAddress}`;
        const collectionResponse = await this._fetch(url);
        if (collectionResponse.ok) {
            const collectionResponseJson = await collectionResponse.json();
            return Opensea.getCollectionCollection(collectionResponseJson);
        } else {
            return null;
        }
    }

    private readonly _fetch = async (url: string) => {
        await this._rateLimit();
        return fetch(url, {
            // headers: { 'X-API-KEY': OPENSEA_API_KEY || '', 'Target-URL': 'https://api.opensea.io/api/v1' } as any,
            headers: { 'X-API-KEY': OPENSEA_API_KEY || '' } as any,
        });
    };
}
