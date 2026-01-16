// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Paylink {
    using SafeERC20 for IERC20;

    struct Link {
        address creator;
        uint256 amount;
        uint256 expiry;
        string note;
        bool paid;
        address payer;
        uint256 paidAt;
    }

    IERC20 public immutable idrx;
    uint256 public nextId;
    mapping(uint256 => Link) public links;

    event PaylinkCreated(
        uint256 indexed id,
        address indexed creator,
        uint256 amount,
        uint256 expiry,
        string note
    );
    event PaylinkPaid(
        uint256 indexed id,
        address indexed payer,
        uint256 amount,
        uint256 paidAt
    );

    constructor(address idrxToken) {
        require(idrxToken != address(0), "IDRX address required");
        idrx = IERC20(idrxToken);
    }

    function createPaylink(
        uint256 amount,
        uint256 expiryDays,
        string calldata note
    ) external returns (uint256) {
        require(amount > 0, "Amount required");
        require(expiryDays > 0, "Expiry required");

        uint256 id = nextId;
        nextId += 1;

        uint256 expiry = block.timestamp + (expiryDays * 1 days);
        links[id] = Link({
            creator: msg.sender,
            amount: amount,
            expiry: expiry,
            note: note,
            paid: false,
            payer: address(0),
            paidAt: 0
        });

        emit PaylinkCreated(id, msg.sender, amount, expiry, note);
        return id;
    }

    function pay(uint256 id) external {
        Link storage link = links[id];
        require(link.creator != address(0), "Paylink not found");
        require(!link.paid, "Already paid");
        require(block.timestamp <= link.expiry, "Paylink expired");

        link.paid = true;
        link.payer = msg.sender;
        link.paidAt = block.timestamp;

        idrx.safeTransferFrom(msg.sender, link.creator, link.amount);

        emit PaylinkPaid(id, msg.sender, link.amount, link.paidAt);
    }

    function getPaylink(uint256 id) external view returns (Link memory) {
        return links[id];
    }
}
