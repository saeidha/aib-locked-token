// File: src/MockNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockNFT is ERC721 {
    uint256 private _tokenIds;

    constructor() ERC721("Mock NFT", "MOCK") {}

    function mint(address to) public returns (uint256) {
        uint256 newItemId = _tokenIds;
        _safeMint(to, newItemId);
        _tokenIds++;
        return newItemId;
    }
}