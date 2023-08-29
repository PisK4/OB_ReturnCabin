// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IORFeeManager {
    struct DealerInfo {
        uint feeRatio; // 10,000 percent
        bytes32 extraInfoHash;
    }

    // feeMPTInfo
    struct Submission {
        uint stratBlock;
        uint endBlock;
        uint submitTimestamp;
        bytes32 profitRoot;
        bytes32 stateTransTreeRoot;
    }

    enum ChallengeStatus {
        none,
        challengeDuration,
        challengeAccepted,
        challengeSuccess,
        challengeFail
    }

    enum FeeMangerDuration {
        lock,
        challenge,
        withdraw
    }

    event DealerUpdated(address indexed dealer, uint feeRatio, bytes extraInfo);
    event SubmitterRegistered(address indexed submiter, uint marginAmount);
    event SubmissionUpdated(uint stratBlock, uint endBlock, bytes32 profitRoot, bytes32 stateTransTreeRoot);
    event Withdraw(address indexed dealer, uint64 chainId, address indexed maker, address indexed token, uint amount);
    event ETHDeposit(address indexed sender, uint amount);

    function registerSubmitter(uint marginAmount, address submiter) external;

    function submit(uint stratBlock, uint endBlock, bytes32 profitRoot, bytes32 stateTransTreeRoot) external;

    function startChallenge(uint marginAmount, address challenger) external;

    // function verifyStateTransTreeRoot(
    //     bytes calldata oldStateRoot,
    //     bytes calldata newStateRoot,
    //     bytes calldata zkproof
    // ) external;

    // function positioningTx(bytes calldata midBlockId, bytes calldata minBlockState, bytes calldata MPTProof) external;

    function responsePositioning(bytes calldata response) external;

    // function proofLostTx(uint blockId, bytes calldata zkProof, bytes calldata lostTx) external;

    function offlineSubmitter(uint marginAmount, address submiter) external;

    function getCurrentBlockInfo() external view returns (Submission memory);

    // function proofBlockTxs(uint blockId, bytes calldata zkProof, bytes calldata txList) external;
}
