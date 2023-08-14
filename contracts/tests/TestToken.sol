// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Orbiter Test Token", "OTT") {
        _mint(msg.sender, 999999 ether);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount * (1 ether));
    }
}
