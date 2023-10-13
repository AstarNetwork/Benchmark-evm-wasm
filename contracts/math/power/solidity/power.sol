// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Power {
    function power(uint256 n) external returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < n; i++) {
            sum += 2**i;
        }
        return sum;
    }
}