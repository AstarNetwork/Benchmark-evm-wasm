// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Arithmetic {
    function performArithmetic(uint256 n) public pure returns (uint256) {
        uint256 y;
        for (uint256 i = 0; i < n; i++) {
            y = i + 1;
            y = (y + 1) / 2;
            y = y * 2;
            y = y - 2;
        }
        return y;
    }
}