// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { Paylink } from "../src/Paylink.sol";

contract DeployPaylink is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address token = vm.envAddress("MOCK_IDRX_ADDRESS");

        vm.startBroadcast(deployerKey);
        Paylink paylink = new Paylink(token);
        vm.stopBroadcast();

        console2.log("Paylink:", address(paylink));
    }
}
