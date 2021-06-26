pragma solidity 0.7.6;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./L1_PushManServer.sol";

contract Extractor_l1 is Ownable {
    struct L1LoanInfo {
        address LoanFromAddress;
        address LoanToAddress;
        address LoanTokenAddress;
        uint256 LoanAmount;
        uint256 LoanTimestamp;
        uint256 LoanChainID;
        bytes32 proofID;
    }

    event setLoanInfoInL1Event(
        address from,
        address to,
        uint256 chainID,
        uint256 timestamp
    );
    mapping(bytes32 => L1LoanInfo) public LoanInfos;
    address PushManServerAddress;

    constructor(address _pushManServerAddress) public {
        PushManServerAddress = _pushManServerAddress;
    }

    /**
     * @dev Obtain the loanProof on the L1 chain
     * @param fromAddress fromAddress
     * @param timestamp timestamp
     * @param chainID chainID
     */
    function getTransactionLoanProof(
        address fromAddress,
        uint256 timestamp,
        uint256 chainID
    )
        public
        view
        returns (
            address TransferFromAddress,
            address TransferToAddress,
            address TransferTokenAddress,
            uint256 TransferAmount,
            uint256 TransferTimestamp,
            uint256 TransferChainID,
            bytes32 proofID
        )
    {
        console.log(
            "come in Extractor_l1___getTransactionLoanProof___Function"
        );
        require(chainID == 1, "l1_chainID must be 1");
        require(msg.sender == fromAddress, "msg.sender must be the loaner");
        bytes32 proofID = generateProofID(fromAddress, timestamp, chainID);
        console.logBytes32(proofID);
        L1LoanInfo memory loinInfo = LoanInfos[proofID];
        return (
            loinInfo.LoanFromAddress,
            loinInfo.LoanToAddress,
            loinInfo.LoanTokenAddress,
            loinInfo.LoanAmount,
            loinInfo.LoanTimestamp,
            loinInfo.LoanChainID,
            loinInfo.proofID
        );
    }

    function setTransactionInfoInL1(
        address fromAddress,
        address toAddress,
        address tokenAddress,
        uint256 amount,
        uint256 timestamp,
        uint256 chainID
    ) external {
        bytes32 proofID = generateProofID(fromAddress, timestamp, chainID);
        L1LoanInfo memory loaninfo = L1LoanInfo(
            fromAddress,
            toAddress,
            tokenAddress,
            amount,
            timestamp,
            chainID,
            proofID
        );
        console.log("-----------------------testlog----------------------");
        console.log("loaninfo.fromAddress =", loaninfo.LoanFromAddress);
        console.log("loaninfo.toAddress =", loaninfo.LoanToAddress);
        console.log("loaninfo.tokenAddress =", loaninfo.LoanTokenAddress);
        console.log("loaninfo,amout =", loaninfo.LoanAmount);
        console.log("loaninfo.timestamp =", loaninfo.LoanTimestamp);
        console.log("loaninfo.chainID =", loaninfo.LoanChainID);
        console.logBytes32(loaninfo.proofID);
        console.log("-----------------------testlog----------------------");

        LoanInfos[proofID] = loaninfo;
        emit setLoanInfoInL1Event(fromAddress, toAddress, chainID, timestamp);
    }

    function appeal(
        address fromAddress,
        // address toAddress,
        // address tokenAddress,
        uint256 timestamp,
        // uint256 amount,
        uint256 chainID
    ) external {
        console.log("come in Extractor_l1___appeal___Function");
        require(chainID == 1, "l1_chainID must be 1011");
        require(fromAddress != address(0), "fromAddress can not be address(0)");
        require(
            fromAddress == msg.sender,
            "fromAddress must equal to msg.sender"
        );
        // require(toAddress != address(0), "toAddress can not be address(0)");
        // require(
        //     tokenAddress != address(0),
        //     "tokenAddress can not be address(0)"
        // );
        require(timestamp != 0, "timestamp can not 0");
        L1LoanInfo memory loanInfo;
        (
            loanInfo.LoanFromAddress,
            loanInfo.LoanToAddress,
            loanInfo.LoanTokenAddress,
            loanInfo.LoanAmount,
            loanInfo.LoanTimestamp,
            loanInfo.LoanChainID,
            loanInfo.proofID
        ) = getTransactionLoanProof(
            fromAddress,
            // toAddress,
            // tokenAddress,
            timestamp,
            // amount,
            chainID
        );
        L1_PushManServer(PushManServerAddress).sendMessageToL2Orbiter(
            loanInfo.LoanFromAddress,
            loanInfo.LoanToAddress,
            loanInfo.LoanTokenAddress,
            loanInfo.LoanAmount,
            loanInfo.LoanTimestamp,
            loanInfo.LoanChainID,
            loanInfo.proofID
        );
    }

    function generateProofID(
        address fromAddress,
        uint256 param1,
        uint256 param2
    ) public view returns (bytes32) {
        // Need to adjust the number of bits according to the realization
        return
            (bytes32(uint256(fromAddress)) << 96) |
            (bytes32(param1) << 32) |
            bytes32(param2);
    }
}