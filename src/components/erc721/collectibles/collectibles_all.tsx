import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { ERC721_APP_BASE_PATH } from '../../../common/constants';
import {
    getAllCollectiblesFetchStatus,
    getCollectibleCollectionSelected,
    getUsersCollectiblesAvailableToList,
} from '../../../store/selectors';
import { themeBreakPoints } from '../../../themes/commons';
import { CollectibleFilterType } from '../../../util/filterable_collectibles';
import { CollectibleSortType } from '../../../util/sortable_collectibles';
import { AllCollectiblesFetchStatus, Collectible, CollectibleCollection, StoreState } from '../../../util/types';
import { CenteredWrapper } from '../../common/centered_wrapper';
import { ViewAll } from '../../common/view_all';
import { SellCollectiblesButton } from '../marketplace/sell_collectibles_button';

import { CollectiblesCardList } from './collectibles_card_list';

const MAX_ITEMS_TO_DISPLAY = 5;

interface OwnProps {
    title: string;
    description: string;
}

interface StateProps {
    collectibles: { [key: string]: Collectible };
    fetchStatus: AllCollectiblesFetchStatus;
    collectibleCollection: CollectibleCollection;
}

type Props = StateProps & OwnProps;

const HeaderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    margin: 0 0 22px;
    position: relative;
    z-index: 1;

    @media (min-width: ${themeBreakPoints.md}) {
        align-items: start;
        flex-direction: row;
        padding-top: 24px;
    }
`;

const Title = styled.h1`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
    margin: 20px 0 25px;

    @media (min-width: ${themeBreakPoints.md}) {
        margin-bottom: 0;
        margin-right: 30px;
    }
`;

const Description = styled.p`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 16px;
    font-weight: normal;
    line-height: 1.7;
    max-width: 635px;
    margin: 16px 0 50px;

    @media (min-width: ${themeBreakPoints.md}) {
        padding-right: 16px;
    }
`;

const Summary = styled.div``;

const SubSectionTitleWrapper = styled.div`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 0 0 15px;

    @media (min-width: ${themeBreakPoints.md}) {
        flex-direction: row;
    }
`;

const SubSectionTitle = styled.h3`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 18px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0 0 15px;

    @media (min-width: ${themeBreakPoints.md}) {
        margin-bottom: 0;
    }
`;

const CollectiblesCardListStyled = styled(CollectiblesCardList)`
    flex-grow: unset;
    margin-bottom: 65px;
    overflow: unset;

    &:last-child {
        margin-bottom: 10px;
    }
`;

export class CollectiblesAll extends React.Component<Props> {
    public render = () => {
        const { fetchStatus, collectibleCollection } = this.props;
        const collectibles = Object.keys(this.props.collectibles).map(key => this.props.collectibles[key]);
        const isLoading = fetchStatus !== AllCollectiblesFetchStatus.Success;
        const title = collectibleCollection.name;
        const description = collectibleCollection.description;
        const collectionPath = collectibleCollection.name.toLowerCase();
        return (
            <CenteredWrapper>
                <HeaderWrapper>
                    <Summary>
                        <Title>{title}</Title>
                        <Description>{description}</Description>
                    </Summary>
                    <SellCollectiblesButton />
                </HeaderWrapper>
                <SubSectionTitleWrapper>
                    <SubSectionTitle>Recently listed</SubSectionTitle>
                    <ViewAll
                        text="View all"
                        to={`${ERC721_APP_BASE_PATH}/${collectionPath}/list-collectibles?filter=${CollectibleFilterType.ShowAll}&sort=${CollectibleSortType.NewestAdded}`}
                    />
                </SubSectionTitleWrapper>
                <CollectiblesCardListStyled
                    collectibles={collectibles}
                    filterType={CollectibleFilterType.ShowAll}
                    limit={MAX_ITEMS_TO_DISPLAY}
                    sortType={CollectibleSortType.NewestAdded}
                    isLoading={isLoading}
                />
                <SubSectionTitleWrapper>
                    <SubSectionTitle>Most valued</SubSectionTitle>
                    <ViewAll
                        text="View all"
                        to={`${ERC721_APP_BASE_PATH}/${collectionPath}/list-collectibles?filter=${CollectibleFilterType.ShowAll}&sort=${CollectibleSortType.PriceHighToLow}`}
                    />
                </SubSectionTitleWrapper>
                <CollectiblesCardListStyled
                    collectibles={collectibles}
                    filterType={CollectibleFilterType.ShowAll}
                    limit={MAX_ITEMS_TO_DISPLAY}
                    sortType={CollectibleSortType.PriceHighToLow}
                    isLoading={isLoading}
                />
            </CenteredWrapper>
        );
    };
}

const allMapStateToProps = (state: StoreState): StateProps => {
    return {
        collectibles: getUsersCollectiblesAvailableToList(state),
        fetchStatus: getAllCollectiblesFetchStatus(state),
        collectibleCollection: getCollectibleCollectionSelected(state),
    };
};
export const AllCollectiblesContainer = connect(allMapStateToProps)(CollectiblesAll);
