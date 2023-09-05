// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {IORMerkleTree} from "./interface/IORMerkleTree.sol";
import {HelperLib} from "./library/HelperLib.sol";

import "hardhat/console.sol";

abstract contract MerkleTreeVerification is IORMerkleTree {
    using HelperLib for uint256;
    using HelperLib for bytes32;

    uint8 immutable MERGE_NORMAL = 1;
    uint8 immutable MERGE_ZEROS = 2;
    uint8 immutable MAX_TREE_LEVEL = 255;

    function zeroMergeValue() internal view returns (MergeValue memory value) {
        value = set_VALUE(bytes32(0));
    }

    function set_VALUE(bytes32 Value) internal view returns (MergeValue memory value) {
        console.log("set_VALUE:%s", uint256(Value));
        value = MergeValue({
            mergeType: MergeValueType.VALUE,
            mergeValue: MergeValueSingle({value1: 0, value2: Value, value3: bytes32(0)})
        });
    }

    function set_MERGE_WITH_ZERO(
        uint8 ZeroCount,
        bytes32 BaseNode,
        bytes32 ZeroBits
    ) internal pure returns (MergeValue memory value) {
        value = MergeValue({
            mergeType: MergeValueType.MERGE_WITH_ZERO,
            mergeValue: MergeValueSingle({value1: ZeroCount, value2: BaseNode, value3: ZeroBits})
        });
    }

    function verify(
        bytes32 key,
        bytes32 v,
        uint256 leaves_bitmap,
        bytes32 root,
        MergeValue[] calldata siblings
    ) internal view returns (bool) {
        bytes32 current_path = key;
        uint256 n = 0;
        MergeValue memory current_v = zeroMergeValue();
        MergeValue memory left = zeroMergeValue();
        MergeValue memory right = zeroMergeValue();

        for (uint i = 0; i <= MAX_TREE_LEVEL; ) {
            // console.log("current loop: %s/%s", i, type(uint8).max);
            bytes32 parent_path = current_path.parentPath(i);
            console.log("current_path:%s, parent_path: %s", uint256(current_path), uint256(parent_path));
            if (leaves_bitmap.getBit(MAX_TREE_LEVEL - i)) {
                console.log("true bitmap index: %s/%s, n:%s", i, type(uint8).max, n);
                if (n == 0) {
                    current_v = intoMergeValue(key, v, uint8(i));
                }
                if (current_path.isRight(MAX_TREE_LEVEL - i)) {
                    console.log("right merge: %s", i);
                    left = siblings[n];
                    right = current_v;
                } else {
                    console.log("left merge: %s", i);
                    left = current_v;
                    right = siblings[n];
                }
                unchecked {
                    n += 1;
                }
            } else {
                console.log("false bitmap index: %s/%s, n:%s", i, type(uint8).max, n);
                if (n > 0) {
                    if (current_path.isRight(MAX_TREE_LEVEL - i)) {
                        console.log("right mergeZero: %s", i);
                        left = zeroMergeValue();
                        right = current_v;
                    } else {
                        console.log("left mergeZero: %s", i);
                        left = current_v;
                        right = zeroMergeValue();
                    }
                }
            }
            current_v = merge(uint8(i), parent_path, left, right);
            current_path = parent_path;
            unchecked {
                i += 1;
            }
        }

        console.log("computed oldRoot:%s == newRoot:%s ??", uint256(root), uint256(getHash(current_v)));

        return getHash(current_v) == root;
    }

    function merge(
        uint8 height,
        bytes32 nodeKey,
        MergeValue memory lhs,
        MergeValue memory rhs
    ) internal view returns (MergeValue memory) {
        if (isZero(lhs) && isZero(rhs)) {
            console.log("merge: both zero");
            return zeroMergeValue();
        }
        if (isZero(lhs)) {
            console.log("merge: left zero");
            return mergeWithZero(height, nodeKey, rhs, true);
        }
        if (isZero(rhs)) {
            console.log("merge: right zero");
            return mergeWithZero(height, nodeKey, lhs, false);
        }
        console.log("merge: left & right");
        console.log("hash: MERGE_NORMAL:[%s], heiht:[%s], nodeKey:[%s]", MERGE_NORMAL, height, uint256(nodeKey));

        return set_VALUE(keccak256(abi.encode(MERGE_NORMAL, height, nodeKey, getHash(lhs), getHash(rhs))));
    }

    function mergeWithZero(
        uint8 height,
        bytes32 nodeKey,
        MergeValue memory value,
        bool setBit
    ) public pure returns (MergeValue memory) {
        if (value.mergeType == MergeValueType.VALUE) {
            bytes32 zeroBits = setBit ? bytes32(uint256(1) << height) : bytes32(0);
            bytes32 baseNode = hashBaseNode(height, nodeKey, value.mergeValue.value2);
            return set_MERGE_WITH_ZERO(1, baseNode, zeroBits);
        } else if (value.mergeType == MergeValueType.MERGE_WITH_ZERO) {
            // bytes32 zeroBits = value.mergeValue.value3;
            // if (setBit) {
            //     zeroBits |= bytes32(uint256(1) << height);
            // }
            bytes32 zeroBits = setBit
                ? value.mergeValue.value3.setBit(MAX_TREE_LEVEL - height)
                : value.mergeValue.value3;
            return set_MERGE_WITH_ZERO(value.mergeValue.value1 + 1, value.mergeValue.value2, zeroBits);
        }
        // else if (value.mergeType == 3) {
        //     if (value.mergeValue.value1 == 255) {
        //         bytes32 base_key = value.mergeValue.value2.parentPath(0);
        //         bytes32 base_node = hashBaseNode(0, base_key, value.mergeValue.value3);
        //         return
        //             MergeValue({
        //                 mergeType: 2,
        //                 mergeValue: MergeValueSingle({value1: 0, value2: base_node, value3: value.mergeValue.value2})
        //             });
        //     } else {
        //         return
        //             MergeValue({
        //                 mergeType: 3,
        //                 mergeValue: MergeValueSingle({
        //                     value1: value.mergeValue.value1 + 1,
        //                     value2: value.mergeValue.value2,
        //                     value3: value.mergeValue.value3
        //                 })
        //             });
        //     }
        // }
        else {
            revert("Invalid MergeValue type");
        }
    }

    function hashBaseNode(uint8 height, bytes32 key, bytes32 value) public pure returns (bytes32) {
        return keccak256(abi.encode(height, key, value));
    }

    function intoMergeValue(bytes32 key, bytes32 value, uint8 height) internal pure returns (MergeValue memory) {
        if (value == bytes32(0) || height == 0) {
            return
                MergeValue({
                    mergeType: MergeValueType.VALUE,
                    mergeValue: MergeValueSingle({value1: height, value2: value, value3: bytes32(0)})
                });
        } else {
            bytes32 baseKey = key.parentPath(0);
            bytes32 baseNode = hashBaseNode(0, baseKey, value);
            bytes32 zeroBits = key;
            for (uint i = height; i <= MAX_TREE_LEVEL; ) {
                if (key.getBit(MAX_TREE_LEVEL - i)) {
                    zeroBits = zeroBits.clearBit(MAX_TREE_LEVEL - i);
                }
                unchecked {
                    i += 1;
                }
            }
            return set_MERGE_WITH_ZERO(height, baseNode, zeroBits);
        }
    }

    function isZero(MergeValue memory mergeValue) internal pure returns (bool) {
        return ((mergeValue.mergeType == MergeValueType.VALUE) && (mergeValue.mergeValue.value2 == bytes32(0)));
    }

    function getHash(MergeValue memory mergeValue) internal view returns (bytes32) {
        if (mergeValue.mergeType == MergeValueType.VALUE) {
            console.log("getHash: direct get VALUE:%s", uint256(mergeValue.mergeValue.value2));
            return mergeValue.mergeValue.value2;
        } else if (mergeValue.mergeType == MergeValueType.MERGE_WITH_ZERO) {
            console.log(
                "getHash: MERGE_ZEROS:%s, baseNode:%s, zeroBits:%s",
                MERGE_ZEROS,
                uint256(mergeValue.mergeValue.value2),
                uint256(mergeValue.mergeValue.value3)
            );

            console.log(
                "zeroCount:%s, hashEncode:[%s], hashEncodePack:%s",
                uint256(mergeValue.mergeValue.value1),
                uint256(
                    keccak256(
                        abi.encode(
                            MERGE_ZEROS,
                            mergeValue.mergeValue.value2,
                            mergeValue.mergeValue.value3,
                            mergeValue.mergeValue.value1
                        )
                    )
                ),
                uint256(
                    keccak256(
                        abi.encodePacked(
                            MERGE_ZEROS,
                            mergeValue.mergeValue.value2, // baseNode
                            mergeValue.mergeValue.value3, // zeroBits
                            mergeValue.mergeValue.value1 // zeroCount
                        )
                    )
                )
            );

            return
                keccak256(
                    abi.encode(
                        MERGE_ZEROS,
                        mergeValue.mergeValue.value2, // baseNode
                        mergeValue.mergeValue.value3, // zeroBits
                        mergeValue.mergeValue.value1 // zeroCount
                    )
                );
        }
        // else if (mergeValue.mergeType == MergeValueType.SHORT_CUT) {
        //     MergeValue memory mergeValueTmp = intoMergeValue(
        //         mergeValue.mergeValue.value2,
        //         mergeValue.mergeValue.value3,
        //         mergeValue.mergeValue.value1
        //     );
        //     return getHash(mergeValueTmp);
        // }
        else {
            revert("Invalid MergeValue type");
        }
    }
}
