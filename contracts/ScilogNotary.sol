// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title scilog12 logbook notary
/// @notice Stores SHA-256 content hashes of student logbooks. Anchoring is one-shot per hash;
///         the chain only ever proves a given content snapshot existed at a given block.
contract ScilogNotary {
    event Anchored(address indexed submitter, bytes32 indexed contentHash, uint256 timestamp);

    mapping(bytes32 => uint256) public anchoredAt; // hash => block.timestamp (0 if not anchored)

    function anchor(bytes32 contentHash) external {
        require(anchoredAt[contentHash] == 0, "already anchored");
        anchoredAt[contentHash] = block.timestamp;
        emit Anchored(msg.sender, contentHash, block.timestamp);
    }
}
