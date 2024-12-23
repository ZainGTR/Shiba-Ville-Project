// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
/**
 * @title ShibaVille Ville NFT Contract
 * @notice This contract manages the minting and ownership of Ville NFTs.
 */
contract VilleNFT is ERC721URIStorage {
    using Strings for uint256;
    uint256 private _nextTokenId = 0;
    uint256 private _mintPrice = 0.01 ether;
    string private _baseTokenURI = "https://api.shibaville.io/ville/";
    address private immutable dev;

    constructor(address _dev) ERC721("VilleNFT", "VILLE") {
        require(_dev != address(0), "Developer address cannot be zero");
        dev = _dev;
    }

    /**
     * @notice Mint a new Ville NFT
     * @dev Anyone can mint a new ville by paying the mint price
     */
    function mint() external payable returns (uint256) {
        require(msg.value == _mintPrice, "Incorrect mint price");
        uint256 tokenId = _nextTokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, concatenate(_baseTokenURI, tokenId));
        _nextTokenId++;
        _mintPrice += 0.0001 ether;
        payable(dev).transfer(msg.value);
        return tokenId;
    }

    function concatenate(string memory _base, uint256 _value) internal pure returns (string memory) {
        return string(abi.encodePacked(_base, _value.toString()));
    }

    function getPrice() public view returns (uint256) {
        return _mintPrice;
    }

    function getNextId() public view returns (uint256) {
        return _nextTokenId;
    }

}