import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { themeDimensions } from '../../themes/commons';

import { CardBase } from './card_base';

interface Props extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    minHeightBody?: string;
    disableOverflowBody?: boolean;
    disableOverflowYBody?: boolean;
}

const CardWrapper = styled(CardBase)`
    display: flex;
    flex-direction: column;
    margin-bottom: ${themeDimensions.verticalSeparationSm};
    max-height: 100%;

    &:last-child {
        margin-bottom: 0;
    }
`;

const CardHeader = styled.div`
    align-items: center;
    border-bottom: 1px solid ${props => props.theme.componentsTheme.cardBorderColor};
    background-color: ${props => props.theme.componentsTheme.cardHeaderBackgroundColor};
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    justify-content: space-between;
    padding: ${themeDimensions.verticalPadding} ${themeDimensions.horizontalPadding};
`;

const CardTitle = styled.h1`
    color: ${props => props.theme.componentsTheme.cardTitleColor};
    font-size: ${props => props.theme.componentsTheme.cardTitleFontSize};
    font-style: normal;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
    padding: 0 20px 0 0;
`;

const CardBody = styled.div<{ minHeightBody?: string; disableOverflowBody?: boolean }>`
    margin: 0;
    min-height: ${props => props.minHeightBody};
    overflow-x: ${props => (props.disableOverflowBody ? 'hidden' : 'auto')};
    overflow-y: ${props => (props.disableOverflowBody ? 'hidden' : 'auto')};
    padding: ${themeDimensions.verticalPadding} ${themeDimensions.horizontalPadding};
    position: relative;
`;

CardBody.defaultProps = {
    minHeightBody: '140px',
};

export const Card: React.FC<Props> = props => {
    const { title, action, children, minHeightBody, disableOverflowBody, ...restProps } = props;

    return (
        <CardWrapper {...restProps}>
            {title || action ? (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {action ? action : null}
                </CardHeader>
            ) : null}
            <CardBody minHeightBody={minHeightBody} disableOverflowBody={disableOverflowBody}>
                {children}
            </CardBody>
        </CardWrapper>
    );
};
