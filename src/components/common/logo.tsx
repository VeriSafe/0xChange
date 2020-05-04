import React, { MouseEvent } from 'react';
import styled from 'styled-components';

import { themeBreakPoints } from '../../themes/commons';

interface Props {
    image: React.ReactNode;
    text: string;
    textColor?: string;
    onClick: (event: MouseEvent) => void;
}

const LogoLink = styled.a<any>`
    align-items: center;
    cursor: pointer;
    display: flex;
    font-family: 'Renner* Light', sans-serif;
    margin: 0 6px;
`;

const LogoText = styled.span<{ textColor?: string }>`
    color: ${props => props.textColor};
    display: none;
    font-size: 32.231px;
    margin-left: 4px;
    font-weight: bold;
    letter-spacing: 0.07rem;
    @media (min-width: ${themeBreakPoints.xxl}) {
        display: block;
    }
`;

LogoText.defaultProps = {
    textColor: '#000',
};

export const Logo: React.FC<Props> = props => {
    const { image, text, textColor, onClick, ...restProps } = props;
    return (
        <LogoLink onClick={onClick} {...restProps}>
            {image}
            <LogoText textColor={textColor}>{text}</LogoText>
        </LogoLink>
    );
};
