const {ethers,network}=require("hardhat")
const {moveBlocks}=require("../utils/moveBlock")

const updateItem = async()=>{
    const basicNFT = await ethers.getContract("BasicNFT")
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const tokenCount = await basicNFT.tokenCount();
    await nftMarketplace.updateListing(basicNFT.address,tokenCount,ethers.utils.parseEther("0.2"))
    console.log("Item updated")
    if(network.config.chainId===31337){
        moveBlocks()
    }
}

updateItem()