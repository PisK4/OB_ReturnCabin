// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IORFeeManager} from "./interface/IORFeeManager.sol";
import {IORManager} from "./interface/IORManager.sol";
import {HelperLib} from "./library/HelperLib.sol";
import {ConstantsLib} from "./library/ConstantsLib.sol";
import {IVerifier} from "./interface/IVerifier.sol";

contract ORFeeManager is IORFeeManager, Ownable, ReentrancyGuard {
    using HelperLib for bytes;
    using MerkleProof for bytes32[];

    // Ownable._owner use a slot

    IORManager private _manager;
    IVerifier private immutable verifier;
    ChallengeStatus public challengeStatus;
    bytes32 public lastSubmissionHash;
    uint public withdrawTime;
    uint public constant WITHDRAW_DELAY = 3600;
    address[] public dealerAddr;

    mapping(address => DealerInfo) private _dealers;
    mapping(address => uint) private _submitter;
    mapping(bytes32 => Submission) public submissions;
    mapping(address => bool) public withdrawLock;

    modifier onlySubmitter() {
        require(msg.sender == IORManager(_manager).submitter(), "NS");
        _;
    }

    modifier onlyDealer() {
        require(_dealers[msg.sender].feeRatio > 0, "ND");
        _;
    }

    // TODO: is there any other status allow withdraw?
    modifier isWithdrawReady() {
        require(block.timestamp >= withdrawTime + ConstantsLib.DEALER_WITHDRAW_DELAY, "WE");
        require(challengeStatus == ChallengeStatus.none, "DC");
        require(!withdrawLock[msg.sender], "WL");
        _;
    }

    // TODO: Challenge fee still to be determined
    modifier isChanllengerQualified() {
        require(address(msg.sender).balance >= address(IORManager(_manager).submitter()).balance, "NF");
        _;
    }

    receive() external payable {}

    constructor(address owner_, address manager_, IVerifier _verifier) {
        require(owner_ != address(0), "OZ");
        require(manager_ != address(0), "MZ");

        _transferOwnership(owner_);
        _manager = IORManager(manager_);
        verifier = _verifier;
    }

    // function verifyStateTransTreeRoot(
    //     bytes calldata oldStateRoot,
    //     bytes calldata newStateRoot,
    //     bytes calldata zkproof
    // ) public {
    //     (oldStateRoot, newStateRoot, zkproof);
    // }

    function withdrawVerification(
        bytes32[][] calldata proofs,
        uint64[] calldata chainIds,
        address[] calldata tokens,
        uint[] calldata amounts
    ) public onlyDealer isWithdrawReady nonReentrant {
        bytes32 stateTransTreeRoot = submissions[lastSubmissionHash].stateTransTreeRoot;
        for (uint i = 0; i < chainIds.length; i++) {
            require(
                MerkleProof.verify(
                    proofs[i],
                    stateTransTreeRoot,
                    keccak256(abi.encodePacked(chainIds[i], tokens[i], amounts[i]))
                ),
                "VF"
            );
        }
        withdrawLock[msg.sender] = true;
    }

    function resetWithdrawLock() internal {
        address[] memory addrs = dealerAddr;
        for (uint i = 0; i < addrs.length; i++) {
            if (withdrawLock[addrs[i]]) {
                withdrawLock[addrs[i]] = false;
            }
        }
    }

    function submit(
        uint stratBlock,
        uint endBlock,
        bytes32 profitRoot,
        bytes32 stateTransTreeRoot
    ) external override onlySubmitter nonReentrant {
        bytes32 submissionHash = keccak256(abi.encodePacked(stratBlock, endBlock, profitRoot, stateTransTreeRoot));
        Submission memory lastSubmission = submissions[lastSubmissionHash];
        if (lastSubmissionHash != 0) {
            require(stratBlock == lastSubmission.endBlock + 1, "DS");
        }

        submissions[submissionHash] = Submission(stratBlock, endBlock, profitRoot, stateTransTreeRoot);
        lastSubmissionHash = submissionHash;
        withdrawTime = block.timestamp;
        resetWithdrawLock();
        emit SubmissionUpdated(submissionHash, stratBlock, endBlock, profitRoot, stateTransTreeRoot);
    }

    function updateDealer(uint feeRatio, bytes calldata extraInfo) external {
        bytes32 extraInfoHash = extraInfo.hash();

        _dealers[msg.sender] = DealerInfo(feeRatio, extraInfoHash);
        dealerAddr.push(msg.sender);

        emit DealerUpdated(msg.sender, feeRatio, extraInfo);
    }

    function getDealerInfo(address dealer) external view returns (DealerInfo memory) {
        return _dealers[dealer];
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "OZ");
        _transferOwnership(newOwner);
    }

    function registerSubmitter(uint marginAmount, address submitter) external override onlyOwner {
        require(submitter == IORManager(_manager).submitter(), "NS");
        _submitter[submitter] = marginAmount;
        emit SubmitterRegistered(submitter, marginAmount);
    }

    function offlineSubmitter(uint marginAmount, address submitter) external override onlyOwner {
        require(submitter == IORManager(_manager).submitter(), "NS");
        (marginAmount);
        _submitter[submitter] = 0;
    }

    function getCurrentBlockInfo() external view override returns (Submission memory) {
        return submissions[lastSubmissionHash];
    }

    function startChallenge(uint marginAmount, address submitter) public override nonReentrant {
        challengeStatus = ChallengeStatus.challengeAccepted;
        (marginAmount, submitter);
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
