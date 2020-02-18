import React from 'react';
import { connect, useDispatch } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import { openFiatOnRampModal, setFiatType } from '../../../store/actions';
import { goToHome, goToMyCollectibles } from '../../../store/router/actions';
import { Theme, themeBreakPoints } from '../../../themes/commons';
import { LogoIcon } from '../../common/icons/logo_icon';
import { Logo } from '../../common/logo';
import { separatorTopbar, ToolbarContainer } from '../../common/toolbar';
import { NotificationsDropdownContainer } from '../../notifications/notifications_dropdown';
import { WalletConnectionContentContainer } from '../account/wallet_connection_content';
import { CollectiblesSearch } from '../collectibles/collectibles_search';

import { CollectiblesCollectionDropdownContainer } from './collectibles_collection_dropdown';

interface DispatchProps {
    onGoToHome: () => any;
    goToMyCollectibles: () => any;
}

interface OwnProps {
    theme: Theme;
}

type Props = DispatchProps & OwnProps;

const MyWalletLink = styled.a`
    align-items: center;
    color: #333;
    display: flex;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }

    ${separatorTopbar}
`;

const BuyEthLink = styled.a`
    align-items: center;
    color: #333;
    display: flex;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }

    ${separatorTopbar}
`;

const LogoHeader = styled(Logo)`
    ${separatorTopbar}
`;

const LogoSVGStyled = styled(LogoIcon)``;

const WalletDropdown = styled(WalletConnectionContentContainer)`
    display: none;
    @media (min-width: ${themeBreakPoints.sm}) {
        align-items: center;
        display: flex;
        ${separatorTopbar}
    }
`;

const CollectiblesCollectionDropdownHeader = styled<any>(CollectiblesCollectionDropdownContainer)`
    align-items: center;
    display: flex;

    ${separatorTopbar}
`;

const ToolbarContent = (props: Props) => {
    const logo = <LogoSVGStyled icon={'assets/icons/vsf_light.svg'} />;
    const dispatch = useDispatch();
    const handleFiatModal: React.EventHandler<React.MouseEvent> = e => {
        e.preventDefault();
        dispatch(setFiatType('CARDS'));
        dispatch(openFiatOnRampModal(true));
    };

    const handleLogoClick: React.EventHandler<React.MouseEvent> = e => {
        e.preventDefault();
        props.onGoToHome();
    };
    const startContent = (
        <>
            <LogoHeader
                image={logo}
                onClick={handleLogoClick}
                text="VeriCollectibles"
                textColor={props.theme.componentsTheme.logoERC721TextColor}
            />
            <CollectiblesCollectionDropdownHeader shouldCloseDropdownBodyOnClick={false} />
        </>
    );

    const handleMyWalletClick: React.EventHandler<React.MouseEvent> = e => {
        e.preventDefault();
        props.goToMyCollectibles();
    };
    const endContent = (
        <>
            <BuyEthLink onClick={handleFiatModal} href="/#" className={'buy-eth'}>
                Buy ETH
            </BuyEthLink>
            <MyWalletLink href="/my-collectibles" onClick={handleMyWalletClick}>
                My Collectibles
            </MyWalletLink>
            <WalletDropdown />
            <NotificationsDropdownContainer />
        </>
    );
    const centerContent = <CollectiblesSearch theme={props.theme} />;

    return <ToolbarContainer startContent={startContent} centerContent={centerContent} endContent={endContent} />;
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onGoToHome: () => dispatch(goToHome()),
        goToMyCollectibles: () => dispatch(goToMyCollectibles()),
    };
};

const ToolbarContentContainer = withTheme(connect(null, mapDispatchToProps)(ToolbarContent));

export { ToolbarContent, ToolbarContentContainer };
