// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IORFeeManager} from "./interface/IORFeeManager.sol";
import {IORManager} from "./interface/IORManager.sol";
import {HelperLib} from "./library/HelperLib.sol";
import {IVerifier} from "./interface/IVerifier.sol";

contract ORFeeManager is IORFeeManager, Ownable, ReentrancyGuard {
    using HelperLib for bytes;

    // Ownable._owner use a slot

    IORManager private _manager;
    IVerifier private immutable verifier;
    bytes32 public lastSubmissionHash;

    mapping(address => DealerInfo) private _dealers;
    mapping(address => uint) private _submiter;
    mapping(bytes32 => Submission) public submissions;

    modifier onlySubmiter() {
        require(_submiter[msg.sender] > 0, "NS");
        _;
    }

    constructor(address owner_, address manager_, IVerifier _verifier) {
        require(owner_ != address(0), "OZ");
        require(manager_ != address(0), "MZ");

        _transferOwnership(owner_);
        _manager = IORManager(manager_);
        verifier = _verifier;
    }

    function verifyStateTransTreeRoot(bytes calldata zkp) internal view {
        verifier.verify(zkp);
    }

    function submit(
        uint stratBlock,
        uint endBlock,
        bytes calldata profitRoot,
        bytes calldata stateTransTreeRoot
    ) external override onlySubmiter nonReentrant {
        bytes32 submissionHash = keccak256(abi.encodePacked(stratBlock, endBlock, profitRoot, stateTransTreeRoot));
        Submission memory lastSubmission = submissions[lastSubmissionHash];
        if (lastSubmissionHash != 0) {
            require(stratBlock == lastSubmission.endBlock + 1, "DS");
        }

        verifyStateTransTreeRoot(profitRoot);

        submissions[submissionHash] = Submission(stratBlock, endBlock, profitRoot, stateTransTreeRoot);
        lastSubmissionHash = submissionHash;

        emit SubmissionUpdated(submissionHash, stratBlock, endBlock, profitRoot, stateTransTreeRoot);
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

    function registerSubmiter(uint marginAmount, address submiter) external override onlyOwner {
        require(submiter != address(0), "SZ");
        _submiter[submiter] = marginAmount;
        emit SubmiterRegistered(submiter, marginAmount);
    }

    function offlineSubmitter(uint marginAmount, address submiter) external override onlyOwner {
        require(submiter != address(0), "SZ");
        (marginAmount);
        _submiter[submiter] = 0;
    }

    function getCurrentBlockInfo() external view override returns (Submission memory) {
        return submissions[lastSubmissionHash];
    }
}
