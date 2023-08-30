// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IORFeeManager} from "./interface/IORFeeManager.sol";
import {IORManager} from "./interface/IORManager.sol";
import {HelperLib} from "./library/HelperLib.sol";
import {ConstantsLib} from "./library/ConstantsLib.sol";
import {IVerifier} from "./interface/IVerifier.sol";
import {MerkleTreeVerification} from "./ORMerkleTree.sol";

import "hardhat/console.sol";

contract ORFeeManager is IORFeeManager, MerkleTreeVerification, Ownable, ReentrancyGuard {
    using HelperLib for bytes;
    using SafeERC20 for IERC20;

    // Ownable._owner use a slot
    IORManager private immutable _manager;
    IVerifier private immutable verifier;
    ChallengeStatus public challengeStatus;
    Submission public submissions;

    mapping(address => DealerInfo) private _dealers;
    mapping(address => uint) public submitter;
    mapping(bytes32 => mapping(uint => bool)) public withdrawLock;

    modifier isChanllengerQualified() {
        require(address(msg.sender).balance >= address(IORManager(_manager).submitter()).balance, "NF");
        _;
    }

    function durationCheck() public view returns (FeeMangerDuration duration) {
        uint challengeEnd = submissions.submitTimestamp + ConstantsLib.DEALER_WITHDRAW_DELAY;
        uint withdrawEnd = challengeEnd + ConstantsLib.WITHDRAW_DURATION;
        uint lockEnd = withdrawEnd + ConstantsLib.LOCK_DURATION;

        if (block.timestamp <= challengeEnd) {
            duration = FeeMangerDuration.challenge;
        } else if (block.timestamp <= withdrawEnd) {
            duration = FeeMangerDuration.withdraw;
        } else if (block.timestamp <= lockEnd) {
            duration = FeeMangerDuration.lock;
        } else {
            uint _timeStamp = block.timestamp % lockEnd;
            if (_timeStamp <= ConstantsLib.WITHDRAW_DURATION) {
                duration = FeeMangerDuration.withdraw;
            } else {
                duration = FeeMangerDuration.lock;
            }
        }
    }

    receive() external payable {
        emit ETHDeposit(msg.sender, msg.value);
    }

    constructor(address owner_, address manager_, IVerifier _verifier) {
        require(owner_ != address(0), "OZ");
        require(manager_ != address(0), "MZ");

        _transferOwnership(owner_);
        _manager = IORManager(manager_);
        verifier = _verifier;
        submissions.submitTimestamp = block.timestamp;
    }

    function withdrawVerification(
        SMTLeaf[] calldata smtLeaves,
        MergeValue[][] calldata siblings,
        bytes32 bitmap
    ) public nonReentrant {
        require(durationCheck() == FeeMangerDuration.withdraw, "WE");
        require(challengeStatus == ChallengeStatus.none, "WDC");
        bytes32 profitRoot = submissions.profitRoot;
        for (uint i = 0; i < smtLeaves.length; i++) {
            // console.log("current loop:", i);
            console.log("length of smtLeaves:", smtLeaves.length);
            console.log("length of siblings:", siblings.length);

            require(withdrawLock[keccak256(abi.encode(smtLeaves[i]))][submissions.submitTimestamp] == false, "WL");
            require(
                MerkleTreeVerification.verify(
                    keccak256(abi.encode(smtLeaves[i].key)),
                    keccak256(abi.encode(smtLeaves[i].value)),
                    bitmap,
                    profitRoot,
                    siblings[i]
                ),
                "merkle root verify failed"
            );
        }

        for (uint i = 0; i < smtLeaves.length; i++) {
            withdrawLock[keccak256(abi.encode(smtLeaves))][submissions.submitTimestamp] = true;
            uint balance = IERC20(smtLeaves[i].value.token).balanceOf(address(this));
            require(balance >= smtLeaves[i].value.amount, "WD: IF");

            IERC20(smtLeaves[i].value.token).safeTransfer(msg.sender, smtLeaves[i].value.amount);
            emit Withdraw(
                msg.sender,
                smtLeaves[i].value.chainId,
                smtLeaves[i].value.token,
                smtLeaves[i].value.debt,
                smtLeaves[i].value.amount
            );
        }
    }

    function submit(
        uint stratBlock,
        uint endBlock,
        bytes32 profitRoot,
        bytes32 stateTransTreeRoot
    ) external override nonReentrant {
        require(msg.sender == IORManager(_manager).submitter(), "NS");
        require(challengeStatus == ChallengeStatus.none, "SDC");
        require(durationCheck() == FeeMangerDuration.lock, "NL2");
        require(endBlock > stratBlock, "EB");
        Submission memory submission = submissions;
        require(stratBlock == submission.endBlock, "BE");

        submissions = Submission(stratBlock, endBlock, block.timestamp, profitRoot, stateTransTreeRoot);

        // challengeStatus = ChallengeStatus.challengeDuration;
        emit SubmissionUpdated(stratBlock, endBlock, profitRoot, stateTransTreeRoot);
    }

    function updateDealer(uint feeRatio, bytes calldata extraInfo) external {
        bytes32 extraInfoHash = extraInfo.hash();
        _dealers[msg.sender] = DealerInfo(feeRatio, extraInfoHash);
        emit DealerUpdated(msg.sender, feeRatio, extraInfo);
    }

    function getDealerInfo(address dealer) external view returns (DealerInfo memory) {
        return _dealers[dealer];
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "OZ");
        _transferOwnership(newOwner);
    }

    function registerSubmitter(uint marginAmount, address _submitter) external override onlyOwner {
        require(_submitter == IORManager(_manager).submitter(), "NS");
        submitter[_submitter] = marginAmount;
        emit SubmitterRegistered(_submitter, marginAmount);
    }

    function offlineSubmitter(uint marginAmount, address _submitter) external override onlyOwner {
        require(_submitter == IORManager(_manager).submitter(), "NS");
        (marginAmount);
        submitter[_submitter] = 0;
    }

    function getCurrentBlockInfo() external view override returns (Submission memory) {}

    function startChallenge(uint marginAmount, address _submitter) public override isChanllengerQualified nonReentrant {
        challengeStatus = ChallengeStatus.challengeAccepted;
        (marginAmount, _submitter);
    }

    function responsePositioning(bytes calldata response) public override {
        (response);
        endChallenge();
    }

    // function proofLostTx(uint blockId, bytes calldata zkProof, bytes calldata lostTx) public override {
    //     (blockId, zkProof, lostTx);
    // }

    // function positioningTx(
    //     bytes calldata midBlockId,
    //     bytes calldata minBlockState,
    //     bytes calldata MPTProof
    // ) public override {
    //     (midBlockId, minBlockState, MPTProof);
    // }

    // function proofBlockTxs(uint blockId, bytes calldata zkProof, bytes calldata txList) public override {
    //     (blockId, zkProof, txList);
    // }

    function endChallenge() internal nonReentrant {
        challengeStatus = ChallengeStatus.none;
    }
}
