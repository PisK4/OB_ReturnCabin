// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {IORMerkleTree} from "./interface/IORMerkleTree.sol";
import {HelperLib} from "./library/HelperLib.sol";

abstract contract MerkleTreeVerification is IORMerkleTree {
    using HelperLib for uint256;
    using HelperLib for bytes32;

    uint8 immutable MERGE_NORMAL = 1;
    uint8 immutable MERGE_ZEROS = 2;

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
    ) public pure returns (bool) {
        bytes32 current_path = key;
        uint256 n = 0;
        MergeValue memory current_v = zeroMergeValue();
        MergeValue memory left = zeroMergeValue();
        MergeValue memory right = zeroMergeValue();
        for (uint index = 0; index <= type(uint8).max; index++) {
            uint8 i = uint8(index);
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
                if (n > 0) {
                    if (current_path.isRight(i)) {
                        left = zeroMergeValue();
                        right = current_v;
                    } else {
                        left = current_v;
                        right = zeroMergeValue();
                    }
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
        return set_VALUE(keccak256(abi.encodePacked(MERGE_NORMAL, height, nodeKey, getHash(lhs), getHash(rhs))));
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
            bytes32 zeroBits = setBit ? value.mergeValue.value3.setBit(height) : value.mergeValue.value3;
            return set_MERGE_WITH_ZERO(value.mergeValue.value1 + 1, value.mergeValue.value2, zeroBits);
        } else {
            revert("Invalid MergeValue type");
        }
    }

    function hashBaseNode(uint8 height, bytes32 key, bytes32 value) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(height, key, value));
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
            for (uint i = height; i <= type(uint8).max; i++) {
                if (key.getBit(uint8(i))) {
                    zeroBits = zeroBits.clearBit(uint8(i));
                }
            }
            return set_MERGE_WITH_ZERO(height, baseNode, zeroBits);
        }
    }

    function isZero(MergeValue memory mergeValue) internal pure returns (bool) {
        return ((mergeValue.mergeType == MergeValueType.VALUE) && (mergeValue.mergeValue.value2 == bytes32(0)));
    }

    function getHash(MergeValue memory mergeValue) internal pure returns (bytes32) {
        if (mergeValue.mergeType == MergeValueType.VALUE) {
            return mergeValue.mergeValue.value2;
        } else if (mergeValue.mergeType == MergeValueType.MERGE_WITH_ZERO) {
            return
                keccak256(
                    abi.encodePacked(
                        MERGE_ZEROS,
                        mergeValue.mergeValue.value2,
                        mergeValue.mergeValue.value3,
                        mergeValue.mergeValue.value1
                    )
                );
        } else {
            revert("Invalid MergeValue type");
        }
    }
}
