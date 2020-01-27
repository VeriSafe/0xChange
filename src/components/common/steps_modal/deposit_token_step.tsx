import React from 'react';
import { connect } from 'react-redux';

import { getWeb3Wrapper } from '../../../services/web3_wrapper';
import { transferToken, depositToken } from '../../../store/actions';
import { getEstimatedTxTimeMs, getStepsModalCurrentStep, getWallet } from '../../../store/selectors';
import { addDepositTokenNotification } from '../../../store/ui/actions';
import { tokenAmountInUnits, tokenSymbolToDisplayString } from '../../../util/tokens';
import { StepTransferToken, StoreState, Token, Wallet } from '../../../util/types';

import { BaseStepModal } from './base_step_modal';
import { StepItem } from './steps_progress';
import { BigNumber } from '@0x/utils';

interface OwnProps {
    buildStepsProgress: (currentStepItem: StepItem) => StepItem[];
}
interface StateProps {
    estimatedTxTimeMs: number;
    step: StepTransferToken;
    wallet: Wallet;
}

interface DispatchProps {
    onSubmitTransferToken: (token: Token, amount: BigNumber, address: string, isEth: boolean) => Promise<any>;
    notifyTransferToken: (id: string, amount: BigNumber, token: Token, address: string, tx: Promise<any>) => any;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
    amountInReturn: BigNumber | null;
}

class DepositTokenStep extends React.Component<Props, State> {
    public state = {
        amountInReturn: null,
    };

    public render = () => {
        const { buildStepsProgress, estimatedTxTimeMs, step, wallet } = this.props;
        const { token, isEth } = step;
        const coinSymbol = isEth ? tokenSymbolToDisplayString('ETH') : tokenSymbolToDisplayString(token.symbol);
        const decimals = isEth ? 18 : step.token.decimals;
        const amountOfTokenString = `${tokenAmountInUnits(
            step.amount,
            decimals,
            step.token.displayDecimals,
        ).toString()} ${coinSymbol}`;

        const title = 'Funding your BlockTime Account';

        const confirmCaption = `Confirm on ${wallet} to Deposit ${amountOfTokenString} to your BlockTime Account.`;
        const loadingCaption = `Processing Deposit of ${amountOfTokenString} to your BlockTime Account.`;
        const doneCaption = `Deposit Complete!`;
        const errorCaption = `Deposit ${amountOfTokenString} to BlockTime Account.`;
        const loadingFooterCaption = `Waiting for confirmation....`;
        const doneFooterCaption = `Deposit of ${amountOfTokenString} to your BlockTime Account sent.`;

        return (
            <BaseStepModal
                step={step}
                title={title}
                confirmCaption={confirmCaption}
                loadingCaption={loadingCaption}
                doneCaption={doneCaption}
                errorCaption={errorCaption}
                loadingFooterCaption={loadingFooterCaption}
                doneFooterCaption={doneFooterCaption}
                buildStepsProgress={buildStepsProgress}
                estimatedTxTimeMs={estimatedTxTimeMs}
                runAction={this._confirmOnWalletTranfer}
                showPartialProgress={true}
                wallet={wallet}
            />
        );
    };

    private readonly _confirmOnWalletTranfer = async ({ onLoading, onDone, onError }: any) => {
        const { step, onSubmitTransferToken } = this.props;
        const { amount, token, address, isEth } = step;
        try {
            const web3Wrapper = await getWeb3Wrapper();
            const txHash = await onSubmitTransferToken(token, amount, address, isEth);
            onLoading();
            await web3Wrapper.awaitTransactionSuccessAsync(txHash);
            onDone();
            this.props.notifyTransferToken(txHash, amount, token, address, Promise.resolve());
        } catch (err) {
            onError(err);
        }
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        estimatedTxTimeMs: getEstimatedTxTimeMs(state),
        step: getStepsModalCurrentStep(state) as StepTransferToken,
        wallet: getWallet(state) as Wallet,
    };
};

const DepositTokenStepContainer = connect(mapStateToProps, (dispatch: any) => {
    return {
        onSubmitTransferToken: (token: Token, amount: BigNumber, address: string, isEth: boolean) =>
            dispatch(depositToken(token, amount, address, isEth)),
        notifyTransferToken: (id: string, amount: BigNumber, token: Token, address: string, tx: Promise<any>) =>
            dispatch(addDepositTokenNotification(id, amount, token, address, tx)),
    };
})(DepositTokenStep);

export { DepositTokenStep, DepositTokenStepContainer };
