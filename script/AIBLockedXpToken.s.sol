// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {AIBLockedXpToken} from "../src/AIBLockedXpToken.sol";

contract DeployAIBLockedXpToken is Script {
    function run() external returns (AIBLockedXpToken) {
        vm.startBroadcast();
        AIBLockedXpToken token = new AIBLockedXpToken(msg.sender);
        vm.stopBroadcast();
        return token;
    }
}
