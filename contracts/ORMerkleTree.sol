// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
// import {IORMerkleTree} from "./interface/IORMerkleTree.sol";
// import {HelperLib} from "./library/HelperLib.sol";
import {MerkleTreeLib} from "./library/MerkleTreeLib.sol";

import "hardhat/console.sol";

abstract contract MerkleTreeVerification {
    using MerkleTreeLib for uint256;
    using MerkleTreeLib for bytes32;
    using MerkleTreeLib for MerkleTreeLib.MergeValue;

    uint8 immutable MERGE_NORMAL = 1;
    uint8 immutable MERGE_ZEROS = 2;
    uint8 immutable MAX_TREE_LEVEL = 255;

    error InvalidMergeValue();

    function verify(
        bytes32 key,
        bytes32 v,
        uint256 leaves_bitmap,
        // bytes32[] calldata siblingsHashes,
        bytes32 root,
        bytes32 firstZeroBits,
        uint8 startIndex,
        MerkleTreeLib.MergeValue[] calldata siblings
    ) internal view returns (bool) {
        bytes32 current_path = key;
        bytes32 parent_path;
        uint8 n = 0;
        uint iReverse;
        // uint gasbefore = gasleft();
        // uint startIndex_ = leaves_bitmap.searchIndex();
        // console.log("startIndex_", startIndex_);
        // console.log("1si", gasbefore - gasleft());
        MerkleTreeLib.MergeValue memory current_v;
        MerkleTreeLib.MergeValue memory left;
        MerkleTreeLib.MergeValue memory right;
        // gasbefore = gasleft();
        if (!(v.isZero() || startIndex == 0)) {
            current_v.mergeType = MerkleTreeLib.MergeValueType.MERGE_WITH_ZERO;
            current_v.mergeValue.value1 = startIndex;
            // current_v.mergeValue.value2 = hashBaseNode(0, key.parentPath(0), v);
            current_v.mergeValue.value2 = keccak256(abi.encode(0, key.parentPath(0), v));
            current_v.mergeValue.value3 = firstZeroBits;
            // processNextLevel(current_v, key, MAX_TREE_LEVEL - startIndex);
            // console.log("zb:", uint256(firstZeroBits));
            // console.log("zb:", uint256(current_v.mergeValue.value3));
        }
        // intoMergeValue(current_v, key, v, uint8(startIndex));
        // console.log("2fc %s, i:%s", gasbefore - gasleft(), startIndex);
        // uint beforeGas;
        for (uint i = startIndex; i <= MAX_TREE_LEVEL; ) {
            unchecked {
                iReverse = MAX_TREE_LEVEL - i;
            }

            if (leaves_bitmap.getBit(iReverse)) {
                // if (n == 0) {
                // intoMergeValue(current_v, key, v, uint8(i));
                // }
                parent_path = current_path.parentPath(i);
                if (current_path.isRight(iReverse)) {
                    // left = siblings[n];
                    // right = current_v;

                    left.setSibling(siblings[n]);
                    right.setCurrent(current_v);

                    // beforeGas = gasleft();
                    merge(uint8(i), parent_path, siblings[n], current_v, current_v);
                    // console.log("3Sb", beforeGas - gasleft());
                } else {
                    // left = current_v;
                    // right = siblings[n];
                    left.setCurrent(current_v);
                    right.setSibling(siblings[n]);
                    // beforeGas = gasleft();
                    merge(uint8(i), parent_path, current_v, siblings[n], current_v);
                    // console.log("3Sb", beforeGas - gasleft());
                }
                unchecked {
                    n += 1;
                }
            } else {
                if (n > 0) {
                    if (current_path.isRight(iReverse)) {
                        // left = zeroMergeValue();
                        // set_VALUE(left, bytes32(0));
                        // right = current_v;
                        left.set_VALUE(bytes32(0));
                        merge(uint8(i), parent_path, left, current_v, current_v);
                    } else {
                        // right = zeroMergeValue();
                        // left = current_v;
                        // set_VALUE(right, bytes32(0));
                        right.set_VALUE(bytes32(0));
                        merge(uint8(i), parent_path, current_v, right, current_v);
                    }
                }
            }

            current_path = parent_path;
            unchecked {
                i += 1;
            }
        }

        return current_v.getHash() == root;
    }

    // function verify(
    //     bytes32 key,
    //     bytes32 v,
    //     uint256 leaves_bitmap,
    //     bytes32 root,
    //     MerkleTreeLib.MergeValue[] calldata siblings
    // ) internal view returns (bool) {
    //     bytes32 current_path = key;
    //     uint256 n = 0;
    //     uint iReverse;
    //     uint startIndex = leaves_bitmap.searchIndex();
    //     MerkleTreeLib.MergeValue memory current_v;
    //     if (v.isZero() || startIndex == 0) {
    //         return false;
    //     } else {
    //         current_v.mergeType = MerkleTreeLib.MergeValueType.MERGE_WITH_ZERO;
    //         current_v.mergeValue.value1 = uint8(startIndex);
    //         current_v.mergeValue.value2 = keccak256(abi.encode(0, key.parentPath(0), v));
    //         processNextLevel(current_v, key, MAX_TREE_LEVEL - uint8(startIndex));
    //     }

    //     processNextSibling(current_v, key, MAX_TREE_LEVEL, startIndex, leaves_bitmap, root, siblings);

    //     return current_v.getHash() == root;
    // }

    // function processNextSibling(
    //     MerkleTreeLib.MergeValue memory current_v,
    //     bytes32 current_path,
    //     uint8 currentLevel,
    //     uint startIndex,
    //     uint256 leaves_bitmap,
    //     bytes32 root,
    //     MerkleTreeLib.MergeValue[] calldata siblings
    // ) internal pure {
    //     if (currentLevel == startIndex) {
    //         return;
    //     }
    //     uint iReverse;
    //     unchecked {
    //         iReverse = MAX_TREE_LEVEL - currentLevel;
    //     }

    //     bytes32 parent_path = current_path.parentPath(currentLevel);

    //     if (leaves_bitmap.getBit(iReverse)) {
    //         MerkleTreeLib.MergeValue memory left;
    //         MerkleTreeLib.MergeValue memory right;

    //         if (current_path.isRight(iReverse)) {
    //             left.setSibling(siblings[currentLevel - 1]);
    //             right.setSiblingM(current_v);
    //             merge(currentLevel, parent_path, siblings[currentLevel - 1], current_v, current_v);
    //         } else {
    //             left.setSiblingM(current_v);
    //             right.setSibling(siblings[currentLevel - 1]);
    //             merge(currentLevel, parent_path, current_v, siblings[currentLevel - 1], current_v);
    //         }
    //         // n++;
    //         processNextSibling(current_v, parent_path, currentLevel - 1, startIndex, leaves_bitmap, root, siblings);
    //     } else {
    //         // if (n > 0)
    //         {
    //             MerkleTreeLib.MergeValue memory left;
    //             MerkleTreeLib.MergeValue memory right;

    //             if (current_path.isRight(iReverse)) {
    //                 left.set_VALUE(bytes32(0));
    //                 merge(currentLevel, parent_path, left, current_v, current_v);
    //             } else {
    //                 right.set_VALUE(bytes32(0));
    //                 merge(currentLevel, parent_path, current_v, right, current_v);
    //             }
    //         }

    //         processNextSibling(current_v, parent_path, currentLevel - 1, startIndex, leaves_bitmap, root, siblings);
    //     }
    // }

    // function mergeisRight(
    //     uint8 height,
    //     bytes32 nodeKey,
    //     MerkleTreeLib.MergeValue calldata lhs,
    //     MerkleTreeLib.MergeValue memory rhs
    // ) internal view {
    //     if (lhs.mergeValue.value2.isZero() && rhs.mergeValue.value2.isZero()) {
    //         // zeroMergeValue(v);
    //         // return same value
    //     } else if (lhs.mergeValue.value2.isZero()) {
    //         // console.log("left zero");
    //         mergeWithZero(height, nodeKey, rhs, rhs, true);
    //     } else if (rhs.mergeValue.value2.isZero()) {
    //         // console.log("right zero");
    //         mergeWithZero(height, nodeKey, lhs, rhs, false);
    //     } else {
    //         bytes32 hashValueLeft;
    //         bytes32 hashValueRight;
    //         if (lhs.mergeType == MerkleTreeLib.MergeValueType.VALUE) {
    //             hashValueLeft = lhs.mergeValue.value2;
    //         } else {
    //             hashValueLeft = lhs.mergeWithZeroHash();
    //         }
    //         if (rhs.mergeType == MerkleTreeLib.MergeValueType.VALUE) {
    //             hashValueRight = rhs.mergeValue.value2;
    //         } else {
    //             hashValueRight = rhs.mergeWithZeroHashM();
    //         }
    //         bytes32 hashValue = keccak256(abi.encode(MERGE_NORMAL, height, nodeKey, hashValueLeft, hashValueRight));
    //         rhs.set_VALUE(hashValue);
    //     }
    // }

    // function mergewithSibHash(
    //     uint8 height,
    //     bytes32 nodeKey,
    //     bytes32 siblingsHashes,
    //     MerkleTreeLib.MergeValue memory lhs,
    //     MerkleTreeLib.MergeValue memory rhs,
    //     MerkleTreeLib.MergeValue memory v // bytes32 siblingsHashes
    // ) internal view {
    //     if (lhs.mergeValue.value2.isZero() && rhs.mergeValue.value2.isZero()) {
    //         // zeroMergeValue(v);
    //         // return same value
    //     } else if (lhs.mergeValue.value2.isZero()) {
    //         // console.log("left zero");
    //         mergeWithZero(height, nodeKey, rhs, v, true);
    //     } else if (rhs.mergeValue.value2.isZero()) {
    //         // console.log("right zero");
    //         mergeWithZero(height, nodeKey, lhs, v, false);
    //     } else {
    //         // console.log("left&right");
    //         // uint gasBefore = gasleft();

    //         v.set_VALUE(siblingsHashes);
    //         // console.log("setValue", gasAfter - gasleft());
    //     }
    // }

    function merge(
        uint8 height,
        bytes32 nodeKey,
        MerkleTreeLib.MergeValue memory lhs,
        MerkleTreeLib.MergeValue memory rhs,
        MerkleTreeLib.MergeValue memory v // bytes32 siblingsHashes
    ) internal view {
        if (lhs.mergeValue.value2.isZero() && rhs.mergeValue.value2.isZero()) {
            // zeroMergeValue(v);
            // return same value
        } else if (lhs.mergeValue.value2.isZero()) {
            mergeWithZero(height, nodeKey, rhs, v, true);
        } else if (rhs.mergeValue.value2.isZero()) {
            mergeWithZero(height, nodeKey, lhs, v, false);
        } else {
            // console.log("left&right");
            // uint gasBefore = gasleft();
            bytes32 hashValueLeft;
            bytes32 hashValueRight;
            if (lhs.mergeType == MerkleTreeLib.MergeValueType.VALUE) {
                hashValueLeft = lhs.mergeValue.value2;
            } else {
                hashValueLeft = keccak256(
                    abi.encode(
                        MERGE_ZEROS,
                        lhs.mergeValue.value2, // baseNode
                        lhs.mergeValue.value3, // zeroBits
                        lhs.mergeValue.value1 // zeroCount
                    )
                );
            }
            if (rhs.mergeType == MerkleTreeLib.MergeValueType.VALUE) {
                hashValueRight = rhs.mergeValue.value2;
            } else {
                hashValueRight = keccak256(
                    abi.encode(
                        MERGE_ZEROS,
                        rhs.mergeValue.value2, // baseNode
                        rhs.mergeValue.value3, // zeroBits
                        rhs.mergeValue.value1 // zeroCount
                    )
                );
            }
            bytes32 hashValue = keccak256(abi.encode(MERGE_NORMAL, height, nodeKey, hashValueLeft, hashValueRight));
            v.set_VALUE(hashValue);
        }
    }

    function mergeWithZero(
        uint8 height,
        bytes32 nodeKey,
        MerkleTreeLib.MergeValue memory value,
        MerkleTreeLib.MergeValue memory v,
        bool setBit
    ) public view {
        console.log("mergeWithZero");
        if (value.mergeType == MerkleTreeLib.MergeValueType.VALUE) {
            bytes32 zeroBits = setBit ? bytes32(0).setBit(MAX_TREE_LEVEL - height) : bytes32(0);
            bytes32 baseNode = hashBaseNode(height, nodeKey, value.mergeValue.value2);
            v.set_MERGE_WITH_ZERO(1, baseNode, zeroBits);
        } else if (value.mergeType == MerkleTreeLib.MergeValueType.MERGE_WITH_ZERO) {
            bytes32 zeroBits = setBit
                ? value.mergeValue.value3.setBit(MAX_TREE_LEVEL - height)
                : value.mergeValue.value3;
            unchecked {
                v.set_MERGE_WITH_ZERO(value.mergeValue.value1 + 1, value.mergeValue.value2, zeroBits);
            }
        } else {
            revert InvalidMergeValue();
        }
    }

    function hashBaseNode(uint8 height, bytes32 key, bytes32 value) public pure returns (bytes32) {
        return keccak256(abi.encode(height, key, value));
    }

    // function intoMergeValue(
    //     MerkleTreeLib.MergeValue memory mergeValue,
    //     bytes32 key,
    //     bytes32 value,
    //     uint8 height
    // ) internal view {
    //     if (value.isZero() || height == 0) {
    //         // return
    //         //     MergeValue({
    //         //         mergeType: MergeValueType.VALUE,
    //         //         mergeValue: MergeValueSingle({value1: height, value2: value, value3: bytes32(0)})
    //         //     });
    //     } else {
    //         bytes32 baseKey = key.parentPath(0);
    //         bytes32 baseNode = hashBaseNode(0, baseKey, value);
    //         bytes32 zeroBits = key;
    //         uint iReverse;
    //         for (uint i = height; i <= MAX_TREE_LEVEL; ) {
    //             unchecked {
    //                 iReverse = MAX_TREE_LEVEL - i;
    //             }
    //             if (key.getBit(iReverse)) {
    //                 zeroBits = zeroBits.clearBit(iReverse);
    //             }
    //             unchecked {
    //                 i += 1;
    //             }
    //         }
    //         // return set_MERGE_WITH_ZERO(height, baseNode, zeroBits);
    //         mergeValue.mergeType = MerkleTreeLib.MergeValueType.MERGE_WITH_ZERO;
    //         mergeValue.mergeValue.value1 = height;
    //         mergeValue.mergeValue.value2 = baseNode;
    //         mergeValue.mergeValue.value3 = zeroBits;
    //         console.log("value3", uint256(mergeValue.mergeValue.value3));
    //     }
    // }

    function intoMergeValue(
        MerkleTreeLib.MergeValue memory mergeValue,
        bytes32 key,
        bytes32 value,
        uint8 height
    ) internal pure {
        if (value.isZero() || height == 0) {
            return;
        }

        // mergeValue.mergeType = MerkleTreeLib.MergeValueType.MERGE_WITH_ZERO;
        // mergeValue.mergeValue.value1 = height;
        // mergeValue.mergeValue.value2 = hashBaseNode(0, key.parentPath(0), value);
        processNextLevel(mergeValue, key, MAX_TREE_LEVEL - height);
    }

    function processNextLevel(
        MerkleTreeLib.MergeValue memory mergeValue,
        bytes32 zeroBits,
        uint iReverse
    ) internal pure {
        if (zeroBits.getBit(iReverse)) {
            zeroBits = zeroBits.clearBit(iReverse);
        }

        if (iReverse == 0) {
            mergeValue.mergeValue.value3 = zeroBits;
            return;
        }

        processNextLevel(mergeValue, zeroBits, iReverse - 1);
    }
}
