import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import { COINDIRECT_MERCHANT_ID, MOONPAY_API_KEY, WYRE_ID } from '../../common/constants';
import { postMoonpaySignature } from '../../services/relayer';
import { openFiatOnRampModal } from '../../store/actions';
import { getEthAccount, getFiatType, getOpenFiatOnRampModalState } from '../../store/selectors';
import { Theme, themeBreakPoints } from '../../themes/commons';
import { isMobile } from '../../util/screen';
import { useWindowSize } from '../common/hooks/window_size_hook';
import { CloseModalButton } from '../common/icons/close_modal_button';
import { LoadingWrapper } from '../common/loading';
import { IconType, Tooltip } from '../common/tooltip';

interface Props {
    theme: Theme;
}

const ModalContent = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 0;
    min-height: 300px;
    overflow: auto;
    width: 500px;
    height: 810px;
    @media (max-width: ${themeBreakPoints.sm}) {
        width: inherit;
        width: 100%;
        height: 100%;
    }
`;

const Title = styled.h1`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    display: flex;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0 0 0 0px;
    text-align: center;
`;

const TooltipStyled = styled(Tooltip)`
    margin-left: 5px;
`;

const ApplePayLink = styled.a`
    align-items: center;
    color: ${props => props.theme.componentsTheme.myWalletLinkColor};
    display: flex;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

export const FiatOnRampModal: React.FC<Props> = props => {
    const { theme } = props;
    const dispatch = useDispatch();
    const size = useWindowSize();
    const ethAccount = useSelector(getEthAccount);
    const fiatType = useSelector(getFiatType);
    const isOpen = useSelector(getOpenFiatOnRampModalState);
    const [isLoading, setIsLoading] = useState(true);
    const [fiatLink, setFiatLink] = useState('link');
    const [isMoonPayLoaded, setIsMoonPayLoaded] = useState(false);
    const reset = () => {
        dispatch(openFiatOnRampModal(false));
    };
    let fiat_link: string = 'link';
    let description;
    const frame_width = isMobile(size.width) ? `${size.width - 10}px` : '500px';
    const frame_height = size.height < 710 ? `${size.height - 100}px` : `${size.height - 150}px`;
    switch (fiatType) {
        case 'APPLE_PAY':
            fiat_link = `https://pay.sendwyre.com?destCurrency=ETH&dest=${ethAccount}&paymentMethod=apple-pay&accountId=${WYRE_ID}`;
            if (fiatLink !== fiat_link && isOpen) {
                setFiatLink(fiat_link);
            }
            description = `Disclaimer  <br />
            Veridex now enables easy purchase of Ether using ApplePay, through Wyre!`;
            // window.open(fiat_link);
            break;
        case 'DEBIT_CARD':
            fiat_link = `https://pay.sendwyre.com?destCurrency=ETH&dest=${ethAccount}&paymentMethod=debit-card&accountId=${WYRE_ID}`;
            if (fiatLink !== fiat_link && isOpen) {
                setFiatLink(fiat_link);
            }
            description = `Disclaimer  <br />
            Veridex now enables easy purchase of Ether using Mastercad and Visa cards, through Wyre!`;
            break;
        case 'CREDIT_CARD':
            fiat_link = `https://business.coindirect.com/buy?merchantId=${COINDIRECT_MERCHANT_ID}&to=eth&address=${ethAccount}`;
            if (fiatLink !== fiat_link && isOpen) {
                setFiatLink(fiat_link);
            }
            description = `Disclaimer  <br />
    Veridex now enables easy purchase of Ether using credit & debit cards, through Coindirect! <br />
    Once payment is completed, you can check your payment status on Coindirect and deposit history in your ethereum wallet.<br />
    If you have any questions, please contact: support@coindirect.com`;
            break;
        case 'CARDS':
            const baseMoonPay = 'https://buy.moonpay.io/';
            if (ethAccount) {
                if (!isMoonPayLoaded) {
                    const link = `${baseMoonPay}?apiKey=${MOONPAY_API_KEY}&enabledPaymentMethods=${encodeURIComponent(
                        'credit_debit_card,sepa_bank_transfer,gbp_bank_transfer',
                    )}&currencyCode=eth&walletAddress=${ethAccount}`;
                    // tslint:disable-next-line:no-floating-promises
                    postMoonpaySignature({ url: link }).then(response => {
                        if (response) {
                            setFiatLink(response.urlWithSignature);
                            setIsMoonPayLoaded(true);
                        }
                    });
                }
            } else {
                fiat_link = `${baseMoonPay}?apiKey=${MOONPAY_API_KEY}&enabledPaymentMethods=credit_debit_card,sepa_bank_transfer,gbp_bank_transfer&currencyCode=eth`;
                if (fiatLink !== fiat_link) {
                    setFiatLink(fiat_link);
                }
            }
            description = `Disclaimer  <br />
        Veridex now enables easy purchase of Ether using credit & debit cards, through Moonpay! <br />
        Once payment is completed, you can check your payment status on Moonpay and deposit history in your ethereum wallet.<br />`;
            break;

        default:
            break;
    }
    const toolTip = <TooltipStyled description={description} iconType={IconType.Fill} />;
    const onload = () => {
        setIsLoading(false);
    };
    const handleApplePay: React.EventHandler<React.MouseEvent> = e => {
        e.preventDefault();
        window.open(fiat_link);
    };
    return (
        <Modal isOpen={isOpen} style={theme.modalTheme}>
            <CloseModalButton onClick={reset} />
            <ModalContent style={{ height: `${size.height}px` }}>
                <Title>BUY ETH {toolTip}</Title>
                {isLoading && fiatType !== 'APPLE_PAY' && <LoadingWrapper minHeight="120px" />}
                {fiatType === 'APPLE_PAY' ? (
                    <ApplePayLink href="/apple-pay" onClick={handleApplePay} className={'apple-pay'}>
                        Use our Provider Wyre
                    </ApplePayLink>
                ) : (
                    fiatLink !== 'link' &&
                    isOpen && (
                        <iframe
                            title="fiat_on_ramp"
                            src={fiatLink}
                            width={frame_width}
                            height={frame_height}
                            frameBorder="0"
                            allowFullScreen={true}
                            onLoad={onload}
                        />
                    )
                )}
            </ModalContent>
        </Modal>
    );
};

export const FiatOnRampModalContainer = withTheme(FiatOnRampModal);
