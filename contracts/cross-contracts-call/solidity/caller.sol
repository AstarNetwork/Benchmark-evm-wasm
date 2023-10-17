// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Caller {
    IERC20 private _token;

    constructor() {}

    function ccall(address token, address recipient, uint256 amount, uint256 n) public {
        IERC20 erc20 = IERC20(token);
        for (uint256 i = 0; i < n; i++) {
            erc20.transfer(recipient, amount);
        }
    }
}