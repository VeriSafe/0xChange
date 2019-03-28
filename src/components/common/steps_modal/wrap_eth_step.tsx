import { BigNumber } from '0x.js';
import React from 'react';
import { connect } from 'react-redux';

import { getWeb3WrapperOrThrow } from '../../../services/web3_wrapper';
import { stepsModalAdvanceStep, updateWethBalance } from '../../../store/actions';
import { getStepsModalCurrentStep } from '../../../store/selectors';
import { getKnownTokens } from '../../../util/known_tokens';
import { getStepTitle } from '../../../util/steps';
import { tokenAmountInUnitsToBigNumber } from '../../../util/tokens';
import { StepWrapEth, StoreState } from '../../../util/types';

import {
    DONE_STATUS_VISIBILITY_TIME,
    ModalText,
    ModalTextClickable,
    sleep,
    StepStatus,
    StepStatusConfirmOnMetamask,
    StepStatusDone,
    StepStatusError,
    StepStatusLoading,
    Title,
} from './steps_common';
import { StepItem, StepsProgress } from './steps_progress';

interface OwnProps {
    buildStepsProgress: (currentStepItem: StepItem) => StepItem[];
}
interface StateProps {
    step: StepWrapEth;
}

interface DispatchProps {
    updateWeth: (newWethBalance: BigNumber) => Promise<any>;
    advanceStep: () => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
    status: StepStatus;
}

class WrapEthStep extends React.Component<Props, State> {
    public state = {
        status: StepStatus.ConfirmOnMetamask,
    };

    public componentDidMount = async () => {
        await this._convertWeth();
    };

    public render = () => {
        const { context, currentWethBalance, newWethBalance } = this.props.step;
        const amount = newWethBalance.sub(currentWethBalance);
        const wethToken = getKnownTokens().getWethToken();
        const ethAmount = tokenAmountInUnitsToBigNumber(amount.abs(), wethToken.decimals).toString();
        const { status } = this.state;
        const retry = () => this._retry();
        let content;

        const ethToWeth = amount.greaterThan(0);
        const convertingFrom = ethToWeth ? 'ETH' : 'wETH';
        const convertingTo = ethToWeth ? 'wETH' : 'ETH';

        const isOrder = context === 'order';

        const buildMessage = (prefix: string) => {
            return [
                prefix,
                ethAmount,
                convertingFrom,
                isOrder ? 'for trading' : null, // only show "for trading" when creating an order
                `(${convertingFrom} to ${convertingTo}).`,
            ]
                .filter(x => x !== null)
                .join(' ');
        };

        switch (status) {
            case StepStatus.Loading:
                content = (
                    <StepStatusLoading>
                        <ModalText>{buildMessage('Converting')}</ModalText>
                    </StepStatusLoading>
                );
                break;
            case StepStatus.Done:
                content = (
                    <StepStatusDone>
                        <ModalText>{buildMessage('Converted')}</ModalText>
                    </StepStatusDone>
                );
                break;
            case StepStatus.Error:
                content = (
                    <StepStatusError>
                        <ModalText>
                            ${buildMessage('Error converting')}
                            <ModalTextClickable onClick={retry}>Click here to try again</ModalTextClickable>
                        </ModalText>
                    </StepStatusError>
                );
                break;
            default:
                content = (
                    <StepStatusConfirmOnMetamask>
                        <ModalText>
                            Confirm on Metamask to convert {ethAmount} {convertingFrom} into {convertingTo}.
                        </ModalText>
                    </StepStatusConfirmOnMetamask>
                );
                break;
        }

        const stepsProgress = this.props.buildStepsProgress({
            title: getStepTitle(this.props.step),
            active: true,
            progress: status === StepStatus.Done ? '100' : '0',
        });

        const title = context === 'order' ? 'Order setup' : 'Converting wETH';

        return (
            <>
                <Title>{title}</Title>
                {content}
                <StepsProgress steps={stepsProgress} />
            </>
        );
    };

    private readonly _convertWeth = async () => {
        const { step, advanceStep } = this.props;
        const { newWethBalance } = step;
        try {
            const web3Wrapper = await getWeb3WrapperOrThrow();
            const convertTxHash = await this.props.updateWeth(newWethBalance);
            this.setState({ status: StepStatus.Loading });

            await web3Wrapper.awaitTransactionSuccessAsync(convertTxHash);
            this.setState({ status: StepStatus.Done });
            await sleep(DONE_STATUS_VISIBILITY_TIME);
            advanceStep();
        } catch (err) {
            this.setState({ status: StepStatus.Error });
        }
    };

    private readonly _retry = async () => {
        this.setState({ status: StepStatus.Error });
        await this._convertWeth();
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        step: getStepsModalCurrentStep(state) as StepWrapEth,
    };
};

const WrapEthStepContainer = connect(
    mapStateToProps,
    (dispatch: any) => {
        return {
            updateWeth: (newWethBalance: BigNumber) => dispatch(updateWethBalance(newWethBalance)),
            advanceStep: () => dispatch(stepsModalAdvanceStep()),
        };
    },
)(WrapEthStep);

export { WrapEthStep, WrapEthStepContainer };