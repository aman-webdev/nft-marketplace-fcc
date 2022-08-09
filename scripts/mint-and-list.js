const { ethers,network } = require("hardhat")
const {moveBlocks}=require("../utils/moveBlock")
const TOKEN_URI = "https://ipfs.io/ipfs/QmR7YxBTrVQCwW6B4wJVgP3KaRrjjZARquL7eJnDkkZM85/1.json"
const PRICE = ethers.utils.parseEther("0.1")
const mintAndList = async () => {

    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    console.log(nftMarketplace.address)
    const basicNFT = await ethers.getContract("BasicNFT")
    const mintTx = await basicNFT.mint(TOKEN_URI)
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log("Approving nft with id " + tokenId.toString())

    const approvalTx = await basicNFT.approve(nftMarketplace.address,tokenId);
    await approvalTx.wait(1)

    const tx = await nftMarketplace.listItem(basicNFT.address,tokenId,PRICE);
    await tx.wait(1)

    console.log("Listed")

    if(network.config.chainId===31337)
     {   console.log("Moving blocks")
        await moveBlocks(2,(sleepAmount=1000))}
}

mintAndList()
