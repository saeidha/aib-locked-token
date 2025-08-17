// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AIBasedLockedToken} from "../src/AIBasedLockedToken.sol";

contract AIBasedLockedTokenTest is Test {
    AIBasedLockedToken public token;
    address public owner = address(0x123);
    address public user1 = address(0x456);
    address public user2 = address(0x789);

    function setUp() public {
        vm.startPrank(owner);
        token = new AIBasedLockedToken(owner);
        vm.stopPrank();
    }

    function test_initial_state() public {
        assertEq(token.name(), "aibasedLockedToken");
        assertEq(token.symbol(), "AIBL");
        assertEq(token.owner(), owner);
    }

    function test_add_to_whitelist() public {
        address[] memory users = new address[](2);
        users[0] = user1;
        users[1] = user2;

        vm.prank(owner);
        token.addToWhitelist(users);

        assertTrue(token.whitelist(user1));
        assertTrue(token.whitelist(user2));
    }

    function test_claim() public {
        address[] memory users = new address[](1);
        users[0] = user1;

        vm.prank(owner);
        token.addToWhitelist(users);

        vm.prank(user1);
        token.claim();

        assertEq(token.balanceOf(user1), 10 * 10**18);
        assertTrue(token.hasClaimed(user1));
        assertEq(token.totalClaims(), 1);
    }

    function test_claim_not_whitelisted() public {
        vm.prank(user1);
        vm.expectRevert("Not whitelisted");
        token.claim();
    }

    function test_claim_already_claimed() public {
        address[] memory users = new address[](1);
        users[0] = user1;

        vm.prank(owner);
        token.addToWhitelist(users);

        vm.prank(user1);
        token.claim();

        vm.prank(user1);
        vm.expectRevert("Already claimed");
        token.claim();
    }

    function test_claim_limit() public {
        address[] memory users = new address[](100);
        for (uint i = 0; i < 100; i++) {
            users[i] = address(uint160(i + 1));
        }

        vm.prank(owner);
        token.addToWhitelist(users);

        for (uint i = 0; i < 100; i++) {
            vm.prank(address(uint160(i + 1)));
            token.claim();
        }

        address[] memory newUser = new address[](1);
        newUser[0] = user1;
        vm.prank(owner);
        token.addToWhitelist(newUser);

        vm.prank(user1);
        vm.expectRevert("Claim limit reached");
        token.claim();
    }

    function test_non_transferable() public {
        address[] memory users = new address[](1);
        users[0] = user1;

        vm.prank(owner);
        token.addToWhitelist(users);

        vm.prank(user1);
        token.claim();

        vm.prank(user1);
        vm.expectRevert("Token is non-transferable");
        token.transfer(user2, 10 * 10**18);
    }
}
