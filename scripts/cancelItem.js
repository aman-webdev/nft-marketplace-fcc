const { ethers, network } = require("hardhat")
const {moveBlocks}=require("../utils/moveBlock")

const cancelItem=async()=>{
    const basicNFT  = await ethers.getContract("BasicNFT")
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const tokenId = await basicNFT.tokenCount();
   const tx= await nftMarketplace.cancelListing(basicNFT.address,tokenId)
   await tx.wait(1)
    console.log(`Item with Id ${tokenId.toString()} Cancelled`)
    if(network.config.chainId===31337){
        await moveBlocks(2,sleepAmount=1000)
    }
}

cancelItem()