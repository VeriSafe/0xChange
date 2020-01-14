import { getContractWrappers } from '../services/contract_wrappers';

export const joinAsMakerToPool = async (maker: string) => {
    const contractWrappers = await getContractWrappers();
    await contractWrappers.staking
        .joinStakingPoolAsMaker('0x0000000000000000000000000000000000000000000000000000000000000010')
        .awaitTransactionSuccessAsync({ from: maker });
};
