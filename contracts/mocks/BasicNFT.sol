// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {

event NFTMinted(address indexed owner, uint256 indexed tokenId);
    
    uint256 public tokenCount;
    mapping(uint256=>string) private tokenURIs;

    constructor(string memory _name, string memory _symbol) ERC721(_name,_symbol){

    }

    function mint(string memory _tokenURI) external {
            tokenCount+=1;
            _mint(msg.sender,tokenCount);
            tokenURIs[tokenCount]=_tokenURI;
            emit NFTMinted(msg.sender,tokenCount);
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory){
            return tokenURIs[tokenId];
    }





}