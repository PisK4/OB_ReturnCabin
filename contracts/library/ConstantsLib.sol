// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library ConstantsLib {
    uint constant RATIO_MULTIPLE = 10000;

    uint constant MIN_ENABLE_DELAY = 120; // Unit: second

    uint constant DEALER_WITHDRAW_DELAY = 3600; // Unit: second

    uint constant WITHDRAW_DURATION = 3360; // Unit: second

    uint constant LOCK_DURATION = 240; // Unit: second
}
