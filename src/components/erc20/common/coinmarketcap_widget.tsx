import React from 'react';
import styled from 'styled-components';

const Widget = styled.div`
    color: white;
    padding-bottom: 20px;
`;
/**
 * @see https://cleverbeagle.com/blog/articles/tutorial-how-to-load-third-party-scripts-dynamically-in-javascript
 */
const loadCoinMarketCapWidget = (callback: any) => {
    const existingScript = document.getElementById('googleMaps');

    if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://files.coinmarketcap.com/static/widget/currency.js';
        script.id = 'coinmarketcap';
        document.body.appendChild(script);

        script.onload = () => {
            if (callback) {
                callback();
            }
        };
    }

    if (existingScript && callback) {
        callback();
    }
};

interface State {
    scriptReady: boolean;
}

export class CoinMarketCapWidget extends React.Component<{}, State> {
    public readonly state: State = {
        scriptReady: false,
    };

    public componentDidMount = () => {
        loadCoinMarketCapWidget(() => {
            this.setState({ scriptReady: true });
        });
    };

    public render = () => {
        return (
            <>
                {this.state.scriptReady ? (
                    <Widget
                        className="coinmarketcap-currency-widget"
                        data-currencyid="2837"
                        data-base="ETH"
                        data-secondary="USD"
                        data-ticker="true"
                        data-rank="false"
                        data-marketcap="false"
                        data-volume="false"
                        data-stats="USD"
                        data-statsticker="false"
                    />
                ) : (
                    ''
                )}
            </>
        );
    };
}
