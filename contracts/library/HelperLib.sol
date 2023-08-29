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

    function isRight(bytes32 _hash, uint8 height) internal pure returns (bool) {
        return getBit(_hash, height);
    }

    function getBit(bytes32 _hash, uint8 i) internal pure returns (bool) {
        uint8 bytePos = i / 8;
        uint8 bitPos = i % 8;
        uint8 mask = uint8(1) << bitPos;
        return (uint8(_hash[bytePos]) & mask) != 0;
    }

    function setBit(bytes32 value, uint8 i) internal pure returns (bytes32) {
        bytes32 mask = bytes32(uint256(1) << i);
        return value | mask;
    }

    function clearBit(bytes32 value, uint8 i) internal pure returns (bytes32) {
        bytes32 mask = bytes32(~(uint256(1) << i));
        return value & mask;
    }

    function parentPath(bytes32 _hash, uint8 height) internal pure returns (bytes32) {
        if (height == 255) {
            return bytes32(0);
        }

        bytes32 parentHash;
        uint8 bytePosition = height / 8;
        uint8 bitPosition = height % 8;

        for (uint8 i = 0; i <= bytePosition; i++) {
            parentHash |= bytes32(uint256(uint8(_hash[i])) << ((bytePosition - i) * 8));
        }

        parentHash &= bytes32(uint256(2 ** ((bitPosition + 1) * 8 - 1) - 1));

        return parentHash;
    }
}
