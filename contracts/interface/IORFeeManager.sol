// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IORFeeManager {
    struct DealerInfo {
        uint feeRatio; // 10,000 percent
        bytes32 extraInfoHash;
    }

    struct Submission {
        uint stratBlock;
        uint endBlock;
        bytes profitRoot;
        bytes stateTransTreeRoot;
    }

    event DealerUpdated(address indexed dealer, uint feeRatio, bytes extraInfo);
    event SubmiterRegistered(address indexed submiter, uint marginAmount);
    event SubmissionUpdated(
        bytes32 indexed submissionHash,
        uint stratBlock,
        uint endBlock,
        bytes profitRoot,
        bytes stateTransTreeRoot
    );

    function registerSubmiter(uint marginAmount, address submiter) external;

    function submit(
        uint stratBlock,
        uint endBlock,
        bytes calldata profitRoot,
        bytes calldata stateTransTreeRoot
    ) external;

    // function startChallenge(uint marginAmount, address challenger) external;

    // function verifyStateTransTreeRoot(
    //     bytes memory oldStateTransTreeRoot,
    //     bytes calldata newStateTransTreeRoot,
    //     bytes calldata zkp
    // ) external view;

    // function positioningTx(bytes calldata midBlockId, bytes calldata minBlockState, bytes calldata MPTProof) external;

    // function responsePositioning(bytes calldata response) external;

    // function proofLostTx(uint blockId, bytes calldata zkProof, bytes calldata lostTx) external;

    function offlineSubmitter(uint marginAmount, address submiter) external;

    function getCurrentBlockInfo() external view returns (Submission memory);

    // function proofBlockTxs(uint blockId, bytes calldata zkProof, bytes calldata txList) external;
}
