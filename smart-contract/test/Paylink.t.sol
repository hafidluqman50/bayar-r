// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { MockIDRX } from "../src/MockIDRX.sol";
import { Paylink } from "../src/Paylink.sol";

contract PaylinkTest is Test {
    MockIDRX private token;
    Paylink private paylink;

    address private creator = address(0xA11CE);
    address private payer = address(0xB0B);

    function setUp() public {
        token = new MockIDRX(address(this));
        paylink = new Paylink(address(token));

        token.mint(payer, 1_000_000 ether);

        vm.prank(payer);
        token.approve(address(paylink), type(uint256).max);
    }

    function testCreatePaylinkStoresData() public {
        vm.prank(creator);
        uint256 id = paylink.createPaylink(100 ether, 7, "note");

        (
            address storedCreator,
            uint256 amount,
            uint256 expiry,
            string memory note,
            bool paid,
            address storedPayer,
            uint256 paidAt
        ) = paylink.links(id);

        assertEq(storedCreator, creator);
        assertEq(amount, 100 ether);
        assertEq(note, "note");
        assertFalse(paid);
        assertEq(storedPayer, address(0));
        assertEq(paidAt, 0);
        assertGt(expiry, block.timestamp);
    }

    function testPayTransfersAndMarksPaid() public {
        vm.prank(creator);
        uint256 id = paylink.createPaylink(250 ether, 3, "");

        uint256 creatorBefore = token.balanceOf(creator);
        uint256 payerBefore = token.balanceOf(payer);

        vm.prank(payer);
        paylink.pay(id);

        (,, , , bool paid, address storedPayer, uint256 paidAt) = paylink.links(id);

        assertTrue(paid);
        assertEq(storedPayer, payer);
        assertGt(paidAt, 0);
        assertEq(token.balanceOf(creator), creatorBefore + 250 ether);
        assertEq(token.balanceOf(payer), payerBefore - 250 ether);
    }

    function testPaylinkExpiredReverts() public {
        vm.prank(creator);
        uint256 id = paylink.createPaylink(100 ether, 1, "");

        vm.warp(block.timestamp + 2 days);

        vm.prank(payer);
        vm.expectRevert("Paylink expired");
        paylink.pay(id);
    }

    function testPaylinkAlreadyPaidReverts() public {
        vm.prank(creator);
        uint256 id = paylink.createPaylink(100 ether, 1, "");

        vm.prank(payer);
        paylink.pay(id);

        vm.prank(payer);
        vm.expectRevert("Already paid");
        paylink.pay(id);
    }

    function testPaylinkNotFoundReverts() public {
        vm.prank(payer);
        vm.expectRevert("Paylink not found");
        paylink.pay(999);
    }
}
