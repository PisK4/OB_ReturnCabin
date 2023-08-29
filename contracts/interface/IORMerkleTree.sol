// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IORMerkleTree {
    struct SMTLeaf {
        SMTKey key;
        SMTValue value;
    }

    struct SMTKey {
        address token;
        address dealer;
        uint64 chainId;
    }

    struct SMTValue {
        address dealer;
        address token;
        uint64 chainId;
        uint amount;
    }

    // MergeValue type 1
    struct Value {
        bytes32 value;
    }

    // MergeValue type 2
    struct MergeWithZero {
        uint8 zeroCount;
        bytes32 baseNode;
        bytes32 zeroBits;
    }

    // MergeValue type 3
    struct ShortCut {
        uint8 height;
        bytes32 key;
        bytes32 value;
    }

    struct MergeValueSingle {
        uint8 value1;
        bytes32 value2;
        bytes32 value3;
    }

    struct MergeValue {
        uint8 mergeType; // determine which type of MergeValue
        MergeValueSingle mergeValue;
    }

    // struct MergeValue {
    //     bytes32 value;
    //     MergeWithZero mergeWithZero;
    //     ShortCut shortCut;
    // }

    enum MergeValueType {
        ZERO,
        VALUE,
        MERGE_WITH_ZERO,
        SHORT_CUT
    }

    function verify(
        bytes32 key,
        bytes32 v,
        bytes32 leaves_bitmap,
        bytes32 root,
        MergeValue[] calldata siblings
    ) external returns (bool);
}
