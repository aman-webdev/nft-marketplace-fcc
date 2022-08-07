// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NFTMarketplace__PriceMustBeAboveZero();
error NFTMarketplace__NotApprovedForMarketplace();
error NFTMarketplace__AlreadyListed(address nftAddress ,uint256 tokenId);
error NFTMarketplace__NotOwner();
error NFTMarketplace__NotListed(address nftAddress ,uint256 tokenId);
error NFTMarketplace__PriceNotMet(address nftAddress ,uint256 tokenId,uint256 price);
error NFTMarketplace__NoProceeds(); 
error NFTMarketplace__TransferFailed();

contract NFTMarketplace is ReentrancyGuard {
    struct Listing{
        uint256 price; 
        address seller;
    }

    event ItemListed(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemBought(address indexed buyer, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemCancelled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId);

    // NFT Contract Address => NFT Token Id => Listing
    mapping(address=>mapping(uint256=>Listing)) private s_listings;
    //Seller address => Amount earned
    mapping(address=>uint256) private s_proceeds;

    modifier notListed(address nftAddress,uint256 tokenId, address owner){
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price>0){
            revert NFTMarketplace__AlreadyListed(nftAddress,tokenId);
        }
        _;
    }

    modifier isOwner(address nftAddress,uint256 tokenId, address spender){
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if(spender!=owner){
            revert NFTMarketplace__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId){
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price<=0){
            revert NFTMarketplace__NotListed(nftAddress,tokenId);
        }
        _;
    }


    function listItem(address nftAddress, uint256 tokenId, uint256 price) external notListed(nftAddress,tokenId,msg.sender) isOwner(nftAddress,tokenId,msg.sender) {
        if(price<=0){
            revert NFTMarketplace__PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(nftAddress);
        if(nft.getApproved(tokenId)!=address(this)){
            revert NFTMarketplace__NotApprovedForMarketplace();
        }

        s_listings[nftAddress][tokenId]=Listing(price,msg.sender);
        emit ItemListed(msg.sender,nftAddress,tokenId,price);


    }

    function buyItem(address nftAddress ,uint256 tokenId) external payable isListed(nftAddress,tokenId) nonReentrant(){
        Listing memory listed = s_listings[nftAddress][tokenId];
        if(msg.value<listed.price){
            revert NFTMarketplace__PriceNotMet(nftAddress,tokenId,listed.price);
        }
        s_proceeds[listed.seller]+=msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listed.seller,msg.sender,tokenId);
        emit ItemBought(msg.sender,nftAddress,tokenId,listed.price);
    }

    function cancelListing(address nftAddress, uint256 tokenId) external isOwner(nftAddress,tokenId,msg.sender) isListed(nftAddress,tokenId){
        delete s_listings[nftAddress][tokenId];
        emit ItemCancelled(msg.sender,nftAddress,tokenId);
    }

    function updateListing(address nftAddress, uint256 tokenId,uint256 newPrice) external isListed(nftAddress,tokenId) isOwner(nftAddress,tokenId,msg.sender){
        s_listings[nftAddress][tokenId].price=newPrice;
        emit ItemListed(msg.sender,nftAddress,tokenId,newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if(proceeds<=0){
            revert NFTMarketplace__NoProceeds();
        }

        s_proceeds[msg.sender]=0;
        (bool success, ) = payable(msg.sender).call{value:proceeds}("");
        if(!success){
            revert NFTMarketplace__TransferFailed();
        }
    }

    function getListing(address nftAddress, uint256 tokenId) external view returns(Listing memory){
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns(uint256){
        return s_proceeds[seller];
    }




}