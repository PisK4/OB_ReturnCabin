// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library HelperLib {
    function hash(bytes memory data) internal pure returns (bytes32) {
        return keccak256(data);
    }

    function includes(uint[] memory arr, uint element) internal pure returns (bool) {
        for (uint i = 0; i < arr.length; ) {
            if (element == arr[i]) {
                return true;
            }
            unchecked {
                i++;
            }
        }
        return false;
    }

    function arrayIncludes(uint[] memory arr, uint[] memory elements) internal pure returns (bool) {
        for (uint i = 0; i < elements.length; i++) {
            bool ic = false;
            for (uint j = 0; j < arr.length; ) {
                if (elements[i] == arr[j]) {
                    ic = true;
                    break;
                }
                unchecked {
                    j++;
                }
            }

            if (!ic) return false;

            unchecked {
                i++;
            }
        }
        return true;
    }

    function includes(address[] memory arr, address element) internal pure returns (bool) {
        for (uint i = 0; i < arr.length; ) {
            if (element == arr[i]) {
                return true;
            }
            unchecked {
                i++;
            }
        }
        return false;
    }

    function arrayIncludes(address[] memory arr, address[] memory elements) internal pure returns (bool) {
        for (uint i = 0; i < elements.length; i++) {
            bool ic = false;
            for (uint j = 0; j < arr.length; ) {
                if (elements[i] == arr[j]) {
                    ic = true;
                    break;
                }
                unchecked {
                    j++;
                }
            }

            if (!ic) return false;

            unchecked {
                i++;
            }
        }
        return true;
    }

    // function isRight(bytes32 _hash, uint height) internal pure returns (bool) {
    //     return getBit(uint256(_hash), height);
    // }

    // function setBit(bytes32 bitmap, uint index) internal pure returns (bytes32) {
    //     return bytes32(uint256(bitmap) | (1 << (index & 0xff)));
    // }

    // function setBit(uint256 bitmap, uint index) internal pure returns (uint256) {
    //     return (bitmap | (1 << (index & 0xff)));
    // }

    // function getBit(uint256 bitmap, uint index) internal pure returns (bool) {
    //     return ((bitmap & (1 << index)) > 0) ? true : false;
    // }

    // function getBit(bytes32 bitmap, uint index) internal pure returns (bool) {
    //     return ((uint256(bitmap) & (1 << index)) > 0) ? true : false;
    // }

    // function clearBit(uint256 bitmap, uint index) internal pure returns (uint256) {
    //     return (bitmap & (~(1 << index)));
    // }

    // function clearBit(bytes32 bitmap, uint index) internal pure returns (bytes32) {
    //     return bytes32(uint256(bitmap) & (~(1 << index)));
    // }

    // function copyBits(bytes32 bitmap, uint index) internal pure returns (bytes32) {
    //     return bytes32((uint256(bitmap) << index) >> index);
    // }

    // function parentPath(bytes32 path, uint height) internal pure returns (bytes32) {
    //     if (height == 255) {
    //         return bytes32(0);
    //     }
    //     return copyBits(path, (height + 1));
    // }

    // function searchIndex(uint256 bitmap) internal pure returns (uint) {
    //     unchecked {
    //         for (uint i = 255; i >= 0; i--) {
    //             if ((bitmap >> i) & 1 == 1) {
    //                 return (255 - i);
    //             }
    //         }
    //         return 0;
    //     }
    // }
}
