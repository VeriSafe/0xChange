import { push, replace } from 'connected-react-router';
import queryString from 'query-string';

import {
    ERC20_APP_BASE_PATH,
    ERC721_APP_BASE_PATH,
    LAUNCHPAD_APP_BASE_PATH,
    MARGIN_APP_BASE_PATH,
    MARKET_APP_BASE_PATH,
} from '../../common/constants';
import { CollectibleFilterType } from '../../util/filterable_collectibles';
import { CollectibleSortType } from '../../util/sortable_collectibles';
import { ThunkCreator } from '../../util/types';
import { getCollectibleCollectionSelected, getCurrentRoutePath } from '../selectors';

export const goToHome: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();
        const currentRoute = getCurrentRoutePath(state);
        const isRoutes =
            currentRoute.includes(ERC20_APP_BASE_PATH) ||
            currentRoute.includes(MARGIN_APP_BASE_PATH) ||
            currentRoute.includes(MARKET_APP_BASE_PATH);
        isRoutes ? dispatch(goToHomeErc20()) : dispatch(goToHomeErc721());
    };
};

const goToHomeErc20: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();
        dispatch(
            push({
                ...state.router.location,
                pathname: `${ERC20_APP_BASE_PATH}/`,
            }),
        );
    };
};

export const goToHomeLaunchpad: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(
            push({
                ...state.router.location,
                pathname: `${LAUNCHPAD_APP_BASE_PATH}/tokens`,
            }),
        );
    };
};

export const goToHomeMarginLend: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(
            push({
                ...state.router.location,
                pathname: `${MARGIN_APP_BASE_PATH}/lend`,
            }),
        );
    };
};

export const goToHomeMarketTrade: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(
            push({
                ...state.router.location,
                pathname: `${MARKET_APP_BASE_PATH}`,
            }),
        );
    };
};

export const goToDexWizard: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(
            push({
                ...state.router.location,
                pathname: `${ERC20_APP_BASE_PATH}/dex-wizard`,
            }),
        );
    };
};

export const goToListedTokens: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(
            push({
                ...state.router.location,
                pathname: `${ERC20_APP_BASE_PATH}/listed-tokens`,
            }),
        );
    };
};

export const goToListings: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(
            push({
                ...state.router.location,
                pathname: `${ERC20_APP_BASE_PATH}/listings`,
            }),
        );
    };
};

export const goToWallet: ThunkCreator = () => {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch(
            push({
                ...state.router.location,
                pathname: `${ERC20_APP_BASE_PATH}/my-wallet`,
            }),
        );
    };
};

const goToHomeErc721 = () => {
    return async (dispatch: any, getState: any) => {
        const state = getState();
        const collection = getCollectibleCollectionSelected(state);
        dispatch(
            push({
                ...state.router.location,
                pathname: `${ERC721_APP_BASE_PATH}/${collection.slug}`,
            }),
        );
    };
};

export const goToMyCollectibles = () => {
    return async (dispatch: any, getState: any) => {
        const state = getState();
        const collection = getCollectibleCollectionSelected(state);
        dispatch(
            push({
                ...state.router.location,
                pathname: `${ERC721_APP_BASE_PATH}/${collection.name.toLowerCase()}/my-collectibles`,
            }),
        );
    };
};

export const goToIndividualCollectible = (collectibleId: string) => {
    return async (dispatch: any, getState: any) => {
        const state = getState();
        const currentRoutePath = getCurrentRoutePath(state);
        const collection = getCollectibleCollectionSelected(state);
        if (!currentRoutePath.includes(`collectible/${collectibleId}`)) {
            dispatch(
                push({
                    ...state.router.location,
                    pathname: `${ERC721_APP_BASE_PATH}/${collection.name.toLowerCase()}/collectible/${collectibleId}`,
                }),
            );
        }
    };
};

export const setCollectiblesListSortType = (sortType: CollectibleSortType | null) => {
    return async (dispatch: any, getState: any) => {
        const state = getState();
        const searchObject = {
            ...queryString.parse(state.router.location.search),
            sort: sortType,
        };

        if (sortType === null) {
            delete searchObject.sort;
        }

        dispatch(
            replace({
                ...state.router.location,
                search: queryString.stringify(searchObject),
            }),
        );
    };
};

export const setCollectiblesListFilterType = (filterType: CollectibleFilterType | null) => {
    return async (dispatch: any, getState: any) => {
        const state = getState();
        const searchObject = {
            ...queryString.parse(state.router.location.search),
            filter: filterType,
        };

        if (filterType === null) {
            delete searchObject.filter;
        }

        dispatch(
            replace({
                ...state.router.location,
                search: queryString.stringify(searchObject),
            }),
        );
    };
};

export const setDexName = (name: string) => {
    return async (dispatch: any, getState: any) => {
        const state = getState();
        const searchObject = {
            ...queryString.parse(state.router.location.search),
            dex: name,
        };

        dispatch(
            replace({
                ...state.router.location,
                search: queryString.stringify(searchObject),
            }),
        );
        dispatch(goToHomeErc20());
    };
};
