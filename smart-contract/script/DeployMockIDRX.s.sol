// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { MockIDRX } from "../src/MockIDRX.sol";

contract DeployMockIDRX is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        MockIDRX token = new MockIDRX();
        vm.stopBroadcast();

        console2.log("MockIDRX:", address(token));
    }
}
