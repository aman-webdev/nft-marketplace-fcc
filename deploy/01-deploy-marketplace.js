const { developmentChains } = require("../helper-hardhat.config")
const { ethers, network } = require("hardhat")
const {verify}=require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { log, deploy } = deployments

    const nftMarketplace = await deploy("NFTMarketplace", {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log(`Contract Deployed to ${nftMarketplace.address}`)

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        console.log(`Verifying...`);
        await verify(nftMarketplace.address,[])
        log("-----------------------------------------------------------")
    }


}


module.exports.tags=["all","nftm"]