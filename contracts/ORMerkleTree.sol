// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {IORMerkleTree} from "./interface/IORMerkleTree.sol";
import {HelperLib} from "./library/HelperLib.sol";

import "hardhat/console.sol";

abstract contract MerkleTreeVerification is IORMerkleTree {
    using HelperLib for bytes32;

    function zeroMergeValue() internal pure returns (MergeValue memory value) {
        value = set_VALUE(bytes32(0));
    }

    function set_VALUE(bytes32 Value) internal pure returns (MergeValue memory value) {
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
        bytes32 leaves_bitmap,
        bytes32 root,
        MergeValue[] calldata siblings
    ) public view returns (bool) {
        bytes32 current_path = key;
        uint256 n = 0;
        MergeValue memory current_v = zeroMergeValue();
        MergeValue memory left = zeroMergeValue();
        MergeValue memory right = zeroMergeValue();
        for (uint8 i = 0; i < 256; i++) {
            console.log("current loop: %s", i);
            bytes32 parent_path = current_path.parentPath(i);
            if (leaves_bitmap.getBit(i)) {
                if (n == 0) {
                    current_v = intoMergeValue(key, v, i);
                }
                if (current_path.isRight(i)) {
                    left = siblings[n];
                    right = current_v;
                } else {
                    left = current_v;
                    right = siblings[n];
                }
                n += 1;
            } else {
                if (current_path.isRight(i)) {
                    left = zeroMergeValue();
                    right = current_v;
                } else {
                    left = current_v;
                    right = zeroMergeValue();
                }
            }
            current_v = merge(i, parent_path, left, right);
            current_path = parent_path;
        }
        return getHash(current_v) == root;
    }

    function merge(
        uint8 height,
        bytes32 nodeKey,
        MergeValue memory lhs,
        MergeValue memory rhs
    ) internal pure returns (MergeValue memory) {
        if (isZero(lhs) && isZero(rhs)) {
            return zeroMergeValue();
        }
        if (isZero(lhs)) {
            return mergeWithZero(height, nodeKey, rhs, true);
        }
        if (isZero(rhs)) {
            return mergeWithZero(height, nodeKey, lhs, false);
        }
        bytes32[5] memory values;
        values[0] = hex"01";
        values[1] = bytes1(height);
        values[2] = nodeKey;
        values[3] = getHash(lhs);
        values[4] = getHash(rhs);
        // bytes32 _hash = keccak256(abi.encodePacked(values));
        // MergeValue memory mergeValue = MergeValue({
        //     mergeType: 1,
        //     mergeValue: MergeValueSingle({value1: 0, value2: keccak256(abi.encodePacked(values)), value3: bytes32(0)})
        // });
        return set_VALUE(keccak256(abi.encodePacked(values)));
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
            bytes32 zeroBits = setBit ? value.mergeValue.value3.setBit(height) : value.mergeValue.value3;
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
        bytes32[] memory values = new bytes32[](4);
        values[0] = bytes32(uint256(height));
        values[2] = key;
        values[3] = value;
        return keccak256(abi.encodePacked(values));
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
            for (uint8 i = height; i <= 255; i++) {
                if (key.getBit(i)) {
                    zeroBits = zeroBits.clearBit(i);
                }
            }
            return set_MERGE_WITH_ZERO(height, baseNode, zeroBits);
            // return
            //     MergeValue({
            //         mergeType: 2,
            //         mergeValue: MergeValueSingle({value1: height, value2: baseNode, value3: zeroBits})
            //     });
        }
    }

    function isZero(MergeValue memory mergeValue) internal pure returns (bool) {
        return ((mergeValue.mergeType == MergeValueType.VALUE) && (mergeValue.mergeValue.value2 == bytes32(0)));
    }

    function getHash(MergeValue memory mergeValue) internal pure returns (bytes32) {
        if (mergeValue.mergeType == MergeValueType.VALUE) {
            return mergeValue.mergeValue.value2;
        } else if (mergeValue.mergeType == MergeValueType.MERGE_WITH_ZERO) {
            bytes32[4] memory values;
            values[0] = hex"01";
            values[1] = mergeValue.mergeValue.value2;
            values[2] = mergeValue.mergeValue.value3;
            values[3] = bytes32(uint256(mergeValue.mergeValue.value1));
            return keccak256(abi.encodePacked(values));
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

    // function copyBits(bytes32 hash, uint8 position, uint8 length) internal pure returns (bytes32) {
    //     bytes32 result;
    //     uint8 bytePosition = position / 8;
    //     uint8 bitPosition = position % 8;
    //     uint8 remainingBits = length;

    //     while (remainingBits > 0) {
    //         uint8 bitsToCopy = remainingBits > 8 - bitPosition ? 8 - bitPosition : remainingBits;
    //         uint8 mask = uint8(2 ** bitsToCopy - 1) << (8 - bitPosition - bitsToCopy);
    //         result |= bytes32(
    //             uint256(uint8(hash[bytePosition]) & mask) << ((remainingBits - bitsToCopy) + (length - remainingBits))
    //         );
    //         remainingBits -= bitsToCopy;
    //         bytePosition++;
    //         bitPosition = 0;
    //     }

    //     return result;
    // }
}
