import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';

import {
    goToHome,
    goToHomeLaunchpad,
    goToHomeMarginLend,
    goToHomeMarketTrade,
    goToWallet,
    logoutWallet,
    openFiatOnRampChooseModal,
    openSideBar,
    setERC20Theme,
    setThemeName,
} from '../../../store/actions';
import { getEthAccount, getThemeName, getFeeRecipient } from '../../../store/selectors';
import { getThemeFromConfigDex } from '../../../themes/theme_meta_data_utils';
import { connectToExplorer, viewOnFabrx } from '../../../util/external_services';
import { truncateAddress } from '../../../util/number_utils';
import { viewAddressOnEtherscan } from '../../../util/transaction_link';
import { WalletConnectionStatusDotStyled, WalletConnectionStatusText } from '../../account/wallet_connection_status';
import { INSTANT_FEE_PERCENTAGE, RELAYER_URL, CHAIN_ID } from '../../../common/constants';
import { getKnownTokens } from '../../../util/known_tokens';
import { Token } from '../../../util/types';
import { load0xInstantScript } from '../common/0xinstant';


const ListContainer = styled.ul`
    list-style-type: none;
    height: 100%;
    padding-left: 10px;
`;

const ListItem = styled.li`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    padding: 16px;
    cursor: pointer;
`;

const ListItemFlex = styled(ListItem)`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    padding: 16px;
    cursor: pointer;
    display: flex;
`;

const MenuContainer = styled.div`
    height: 100%;
    z-index: 1000;
    background-color: ${props => props.theme.componentsTheme.cardBackgroundColor};
    width: 250px;
`;

declare var zeroExInstant: any;

export const MobileWalletConnectionContent = () => {
    const ethAccount = useSelector(getEthAccount);
    const themeName = useSelector(getThemeName);
    const dispatch = useDispatch();
    
    const feePercentage = INSTANT_FEE_PERCENTAGE;
    const feeRecipient = useSelector(getFeeRecipient);
    const [isScriptReady, setScripReady] = useState(false);
    const [isInstant, setIsInstant] = useState(false);
    /*const openFabrx = () => {
        viewOnFabrx(ethAccount);
    };*/

    const handleThemeClick = () => {
        const themeN = themeName === 'DARK_THEME' ? 'LIGHT_THEME' : 'DARK_THEME';
        dispatch(setThemeName(themeN));
        const theme = getThemeFromConfigDex(themeN);
        dispatch(setERC20Theme(theme));
    };

    const onGoToHome = () => {
        dispatch(goToHome());
        dispatch(openSideBar(false));
    };

    const onGoToLaunchpad = () => {
        dispatch(goToHomeLaunchpad());
        dispatch(openSideBar(false));
    };

    const onGoToMarketTrade = () => {
        dispatch(goToHomeMarketTrade());
        dispatch(openSideBar(false));
    };

    const onGoToMarginLend = () => {
        dispatch(goToHomeMarginLend());
        dispatch(openSideBar(false));
    };

    const onGoToWallet = () => {
        dispatch(goToWallet());
        dispatch(openSideBar(false));
    };

    const viewAccountExplorer = () => {
        viewAddressOnEtherscan(ethAccount);
    };

    const onClickFiatOnRampModal = () => {
        dispatch(openFiatOnRampChooseModal(true));
        dispatch(openSideBar(false));
    };

    const onLogoutWallet = () => {
        dispatch(logoutWallet());
    };
    const status: string = ethAccount ? 'active' : '';

    const ethAccountText = ethAccount ? `${truncateAddress(ethAccount)}` : 'Not connected';
    let tooltipTextRef: any;
    const afterShowTooltip = (evt: any) => {
        setTimeout(() => {
            ReactTooltip.hide(tooltipTextRef);
        }, 300);
    };
    if (isScriptReady && isInstant) {
        const knownToken = getKnownTokens();
        const token = knownToken.findToken('0xbtc') as Token;
        const erc20TokenAssetData = zeroExInstant.assetDataForERC20TokenAddress(token.address) as string;
        const additionalAssetMetaDataMap = {
            [erc20TokenAssetData]: {
                assetProxyId: zeroExInstant.ERC20_PROXY_ID,
                decimals: token.decimals,
                symbol: token.symbol,
                name: token.name,
                primaryColor: token.primaryColor,
                iconUrl: token.icon,
            },
        };
        const renderInstant = async () => {
            const onClose = () => {
                setIsInstant(false);  
            };
         zeroExInstant.render(
                {
                    //provider: isWeb3Wrapper ? (await getWeb3Wrapper()).getProvider() : undefined,
                    orderSource: RELAYER_URL,
                    chainId: CHAIN_ID,
                    affiliateInfo: {
                        feeRecipient,
                        feePercentage,
                    },
                    additionalAssetMetaDataMap,
                    defaultSelectedAssetData: erc20TokenAssetData,
                    onClose,
                },
                'body',
            );
        }
        renderInstant();
    }
    if(!isScriptReady){
        load0xInstantScript(() => {
            setScripReady(true);
        });
    }
    const handleBuy0xBTC: React.EventHandler<React.MouseEvent> = async e => {
        e.preventDefault();
        setIsInstant(true);
    };

    return (
        <MenuContainer>
            <ListContainer>
                <ListItem onClick={onGoToHome}>Home</ListItem>
                <ListItem onClick={onGoToWallet}>Wallet</ListItem>
                <ListItem onClick={onGoToMarketTrade}>Market Trade</ListItem>
                <ListItem onClick={onGoToLaunchpad}>Launchpad</ListItem>
                {/*<ListItem onClick={onGoToMarginLend}>Lend</ListItem>*/}
                <hr />
                <CopyToClipboard text={ethAccount ? ethAccount : ''}>
                    <ListItemFlex>
                        <WalletConnectionStatusDotStyled status={status} />
                        <WalletConnectionStatusText
                            ref={ref => (tooltipTextRef = ref)}
                            data-tip={'Copied To Clipboard'}
                        >
                            {ethAccountText}
                        </WalletConnectionStatusText>
                        <ReactTooltip afterShow={afterShowTooltip} />
                    </ListItemFlex>
                </CopyToClipboard>
                <ListItem onClick={onClickFiatOnRampModal}>Buy ETH</ListItem>
                <ListItem onClick={handleBuy0xBTC}>Buy 0xBTC</ListItem>
                <ListItem onClick={handleThemeClick}>{themeName === 'DARK_THEME' ? '☼' : '🌑'}</ListItem>
                <ListItem onClick={viewAccountExplorer}>View Address on Etherscan</ListItem>
                <ListItem onClick={connectToExplorer}>Track DEX volume</ListItem>
                {/* <ListItem onClick={openFabrx}>Set Alerts</ListItem>*/}
                <ListItem onClick={onLogoutWallet}>Logout Wallet</ListItem>
            </ListContainer>
        </MenuContainer>
    );
};
