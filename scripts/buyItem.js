const { ethers,network } = require("hardhat")
const {moveBlocks}=require("../utils/moveBlock")

const buyItem=async()=>{
    const [deployer,buyer]=await ethers.getSigners()
    const basicNFT = await ethers.getContract("BasicNFT",deployer)
    const nftMarketplace = await ethers.getContract("NFTMarketplace",deployer)
    const tokenCount = await basicNFT.tokenCount();
    const buyerConnected = nftMarketplace.connect(buyer)
    console.log("Item Bought")
    await buyerConnected.buyItem(basicNFT.address,tokenCount,{value:ethers.utils.parseEther("0.1")})
    if(network.config.chainId===31337){
        moveBlocks(2,1000)
    }
}

buyItem()