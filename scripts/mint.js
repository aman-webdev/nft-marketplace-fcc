const { ethers,network } = require("hardhat")
const {moveBlocks}=require("../utils/moveBlock")
const TOKEN_URI = "https://ipfs.io/ipfs/QmR7YxBTrVQCwW6B4wJVgP3KaRrjjZARquL7eJnDkkZM85/1.json"
const mint = async () => {

    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    console.log(nftMarketplace.address)
    const basicNFT = await ethers.getContract("BasicNFT")
    const mintTx = await basicNFT.mint(TOKEN_URI)
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(" id " + tokenId.toString())

   

    if(network.config.chainId===31337)
     {   console.log("Moving blocks")
        await moveBlocks(2,(sleepAmount=1000))}
}

mint()
