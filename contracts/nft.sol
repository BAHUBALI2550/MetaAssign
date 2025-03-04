// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTSTORE is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter; 

    // Fixed price per NFT
    uint256 public constant tokenPrice = 0.05 ether;
    bool public saleLive;

    event NFTPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);

    // Optional event if owner mints when sale not live
    event NFTMinted(uint256 indexed tokenId, address indexed recipient);

    constructor() ERC721("Digital Art Collection", "DAC") {
        saleLive = false; // sale closed at first
    }

    
    function mintNFTByOwner(address to, string memory _tokenURI) external onlyOwner {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        emit NFTMinted(newTokenId, to);
    }

    function purchaseNFT(string memory _tokenURI) external payable {
        require(saleLive, "Sale is currently closed");
        require(msg.value == tokenPrice, "Incorrect ETH value sent");

        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        emit NFTPurchased(newTokenId, msg.sender, msg.value);
    }

    function toggleSaleStatus(bool _open) external onlyOwner {
        saleLive = _open;
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Funds Insufficient");
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
