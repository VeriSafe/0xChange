import React, { HTMLAttributes } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { marketFilters } from '../../../common/markets';
import { changeSwapBaseToken, goToHome } from '../../../store/actions';
import { getSwapBaseToken, getSwapQuoteToken } from '../../../store/selectors';
import { themeBreakPoints, themeDimensions } from '../../../themes/commons';
import { getKnownTokens } from '../../../util/known_tokens';
import { isMobile } from '../../../util/screen';
import { filterTokensByString } from '../../../util/swap';
import { formatTokenSymbol } from '../../../util/tokens';
import { Filter, StoreState, Token } from '../../../util/types';
import { CardBase } from '../../common/card_base';
import { Dropdown } from '../../common/dropdown';
import { withWindowWidth } from '../../common/hoc/withWindowWidth';
import { ChevronDownIcon } from '../../common/icons/chevron_down_icon';
import { MagnifierIcon } from '../../common/icons/magnifier_icon';
import { TokenIcon } from '../../common/icons/token_icon';
import { CustomTDFirst, Table, TBody, THead, THFirst, TR } from '../../common/table';

interface PropsDivElement extends HTMLAttributes<HTMLDivElement> {}

interface DispatchProps {
    changeSwapBaseToken: (token: Token) => any;
    goToHome: () => any;
}

interface PropsToken {
    baseToken: Token | null;
    quoteToken: Token | null;
}
interface OwnProps {
    windowWidth: number;
}

type Props = PropsDivElement & PropsToken & DispatchProps & OwnProps;

interface State {
    selectedFilter: Filter;
    search: string;
    isUserOnDropdown: boolean;
}

interface MarketRowProps {
    active: boolean;
}

const rowHeight = '48px';

const MarketsDropdownWrapper = styled(Dropdown)``;

const MarketsDropdownHeader = styled.div`
    align-items: center;
    display: flex;
`;

const MarketsDropdownHeaderText = styled.span`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
    margin-right: 10px;
`;

const MarketsDropdownBody = styled(CardBase)`
    box-shadow: ${props => props.theme.componentsTheme.boxShadow};
    max-height: 100%;
    max-width: 100%;
    width: 401px;
    @media (max-width: ${themeBreakPoints.sm}) {
        position: relative;
        max-width: 340px;
        left: -70px;
    }
`;

const MarketsFilters = styled.div`
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.componentsTheme.dropdownBorderColor};
    display: flex;
    justify-content: space-between;
    min-height: ${rowHeight};
    padding: 8px 8px 8px ${themeDimensions.horizontalPadding};
    @media (max-width: ${themeBreakPoints.sm}) {
        display: inline;
    }
`;

const MarketsFiltersLabel = styled.h2`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 16px;
    font-weight: 600;
    line-height: normal;
    margin: 0 auto 0 0;
    @media (max-width: ${themeBreakPoints.sm}) {
        padding: 8px 8px 8px ${themeDimensions.horizontalPadding};
    }
`;

const searchFieldHeight = '32px';
const searchFieldWidth = '142px';

const SearchWrapper = styled.div`
    height: ${searchFieldHeight};
    position: relative;
    width: ${searchFieldWidth};
`;

const SearchField = styled.input`
    background: ${props => props.theme.componentsTheme.marketsSearchFieldBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${props => props.theme.componentsTheme.marketsSearchFieldBorderColor};
    color: ${props => props.theme.componentsTheme.marketsSearchFieldTextColor};
    font-size: 13px;
    height: ${searchFieldHeight};
    left: 0;
    outline: none;
    padding: 0 15px 0 30px;
    position: absolute;
    top: 0;
    width: ${searchFieldWidth};
    z-index: 1;

    &:focus {
        border-color: ${props => props.theme.componentsTheme.marketsSearchFieldBorderColor};
    }
`;

const MagnifierIconWrapper = styled.div`
    line-height: 30px;
    height: 100%;
    left: 11px;
    position: absolute;
    top: 0;
    width: 14px;
    z-index: 12;
`;

const TableWrapper = styled.div`
    max-height: 420px;
    overflow: auto;
    position: relative;
`;

const verticalCellPadding = `
    padding-bottom: 10px;
    padding-top: 10px;
`;

const tableHeaderFontWeight = `
    font-weight: 700;
`;

const TRStyled = styled(TR)<MarketRowProps>`
    background-color: ${props => (props.active ? props.theme.componentsTheme.rowActive : 'transparent')};
    cursor: ${props => (props.active ? 'default' : 'pointer')};

    &:hover {
        background-color: ${props => props.theme.componentsTheme.rowActive};
    }

    &:last-child > td {
        border-bottom-left-radius: ${themeDimensions.borderRadius};
        border-bottom-right-radius: ${themeDimensions.borderRadius};
        border-bottom: none;
    }
`;

// Has a special left-padding: needs a specific selector to override the theme
const THFirstStyled = styled(THFirst)`
    ${verticalCellPadding}
    ${tableHeaderFontWeight}

    &, &:last-child {
        padding-left: 21.6px;
    }
`;

const CustomTDFirstStyled = styled(CustomTDFirst)`
    ${verticalCellPadding};
`;

const TokenIconAndLabel = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-start;
`;

const FilterSearchContainer = styled.div`
    @media (max-width: ${themeBreakPoints.sm}) {
        display: flex;
        justify-content: space-between;
        padding: 8px 8px 8px ${themeDimensions.horizontalPadding};
    }
`;

const TokenLabel = styled.div`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 0 12px;
`;

const DropdownTokenIcon = styled(TokenIcon)`
    margin-right: 10px;
    vertical-align: top;
`;

class SwapDropdown extends React.Component<Props, State> {
    public readonly state: State = {
        selectedFilter: marketFilters[0],
        search: '',
        isUserOnDropdown: false,
    };

    private readonly _dropdown = React.createRef<Dropdown>();

    public render = () => {
        const { baseToken, windowWidth, ...restProps } = this.props;

        const header = (
            <MarketsDropdownHeader>
                <MarketsDropdownHeaderText>
                    {baseToken ? (
                        <DropdownTokenIcon
                            symbol={baseToken.symbol}
                            primaryColor={baseToken.primaryColor}
                            isInline={true}
                            icon={baseToken.icon}
                        />
                    ) : null}
                    {formatTokenSymbol(baseToken ? baseToken.symbol : '')}
                </MarketsDropdownHeaderText>
                <ChevronDownIcon />
            </MarketsDropdownHeader>
        );
        const FilterSearchContent = isMobile(windowWidth) ? (
            <>
                <MarketsFiltersLabel>Tokens</MarketsFiltersLabel>
                <FilterSearchContainer>
                    {/*this._getTokensFilterTabs()*/}
                    {this._getSearchField()}
                </FilterSearchContainer>
            </>
        ) : (
            <>
                <MarketsFiltersLabel>Tokens</MarketsFiltersLabel>
                {/*this._getTokensFilterTabs()*/}
                {this._getSearchField()}
            </>
        );

        const body = (
            <MarketsDropdownBody>
                <MarketsFilters onMouseOver={this._setUserOnDropdown} onMouseOut={this._removeUserOnDropdown}>
                    {FilterSearchContent}
                </MarketsFilters>
                <TableWrapper>{this._getMarkets()}</TableWrapper>
            </MarketsDropdownBody>
        );
        return (
            <MarketsDropdownWrapper
                body={body}
                header={header}
                ref={this._dropdown}
                shouldCloseDropdownOnClickOutside={!this.state.isUserOnDropdown}
                {...restProps}
            />
        );
    };

    private readonly _setUserOnDropdown = () => {
        this.setState({ isUserOnDropdown: true });
    };

    private readonly _removeUserOnDropdown = () => {
        this.setState({ isUserOnDropdown: false });
    };

    private readonly _getSearchField = () => {
        return (
            <SearchWrapper>
                <MagnifierIconWrapper>{MagnifierIcon()}</MagnifierIconWrapper>
                <SearchField onChange={this._handleChange} value={this.state.search} />
            </SearchWrapper>
        );
    };

    private readonly _handleChange = (e: any) => {
        const search = e.currentTarget.value;

        this.setState({
            search,
        });
    };

    private readonly _getMarkets = () => {
        const { baseToken, quoteToken } = this.props;
        const { search } = this.state;

        if (!baseToken || !quoteToken) {
            return null;
        }
        const known_tokens = getKnownTokens().getTokens();
        const searchedTokens = filterTokensByString(known_tokens, search);
        return (
            <Table>
                <THead>
                    <TR>
                        <THFirstStyled styles={{ textAlign: 'left' }}>Token</THFirstStyled>
                    </TR>
                </THead>
                <TBody>
                    {searchedTokens.map((token, index) => {
                        const isActive = token.symbol === baseToken.symbol;
                        const setSelectedToken = () => this._setSelectedToken(token);
                        try {
                            const baseSymbol = formatTokenSymbol(token.symbol).toUpperCase();
                            return (
                                <TRStyled active={isActive} key={index} onClick={setSelectedToken}>
                                    <CustomTDFirstStyled styles={{ textAlign: 'left', borderBottom: true }}>
                                        <TokenIconAndLabel>
                                            <TokenIcon
                                                symbol={token.symbol}
                                                primaryColor={token.primaryColor}
                                                icon={token.icon}
                                            />
                                            <TokenLabel>{baseSymbol}</TokenLabel>
                                        </TokenIconAndLabel>
                                    </CustomTDFirstStyled>
                                </TRStyled>
                            );
                        } catch {
                            return null;
                        }
                    })}
                </TBody>
            </Table>
        );
    };

    private readonly _setSelectedToken: any = (token: Token) => {
        this.props.changeSwapBaseToken(token);
        // this.props.goToHome();
        if (this._dropdown.current) {
            this._dropdown.current.closeDropdown();
        }
    };
}

const mapStateToProps = (state: StoreState): PropsToken => {
    return {
        baseToken: getSwapBaseToken(state),
        quoteToken: getSwapQuoteToken(state),
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        changeSwapBaseToken: (token: Token) => dispatch(changeSwapBaseToken(token)),
        goToHome: () => dispatch(goToHome()),
    };
};

const SwapDropdownContainer = withWindowWidth(connect(mapStateToProps, mapDispatchToProps)(SwapDropdown));

export { SwapDropdown, SwapDropdownContainer };
