// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {AIBasedLockedToken} from "../src/AIBasedLockedToken.sol";

contract DeployAIBasedLockedToken is Script {
    function run() external returns (AIBasedLockedToken) {
        vm.startBroadcast();
        AIBasedLockedToken token = new AIBasedLockedToken(msg.sender);
        vm.stopBroadcast();
        return token;
    }
}
