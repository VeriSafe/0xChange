import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { themeColors, themeDimensions } from '../../util/theme';
import { WalletConnectionStatusContainer } from '../account';

import { Logo } from './logo';
import { MarketsDropdown } from './markets_dropdown';

const separatorTopbar = `
    &:after {
        background-color: ${themeColors.borderColor};
        content: "";
        height: 26px;
        margin-left: 17px;
        margin-right: 17px;
        width: 1px;
    }

    &:last-child:after {
        display: none;
    }
`;

const ToolbarWrapper = styled.div`
    align-items: center;
    background: #ffffff;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    height: 64px;
    justify-content: space-between;
    padding: 0 ${themeDimensions.horizontalPadding};
    position: sticky;
    z-index: 123;
`;

const MyWalletLink = styled(Link)`
    color: #333333;
    font-size: 16px;
    font-weight: 500;
    margin: 0 35px 0 0;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const ToolbarStart = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-start;
`;

const ToolbarEnd = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-end;
`;

const LogoHeader = styled(Logo)`
    ${separatorTopbar}
`;

const MarketsDropdownHeader = styled<any>(MarketsDropdown)`
    align-items: center;
    display: flex;

    ${separatorTopbar}
`;

export const Toolbar = () => (
    <ToolbarWrapper>
        <ToolbarStart>
            <LogoHeader />
            <MarketsDropdownHeader shouldCloseDropdownBodyOnClick={false} />
        </ToolbarStart>
        <ToolbarEnd>
            <MyWalletLink to="/my-wallet">My Wallet</MyWalletLink>
            <WalletConnectionStatusContainer />
        </ToolbarEnd>
    </ToolbarWrapper>
);
