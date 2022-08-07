const { developmentChains } = require("../helper-hardhat.config")
const { ethers, network } = require("hardhat")
const {verify}=require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { log, deploy } = deployments
    const ARGS=["Mario","SM"];
   const basicNFT = await deploy("BasicNFT",{
        from:deployer,
        log:true,
        args:ARGS,
        waitConfirmations: network.config.blockConfirmations || 1

    })

    console.log("Deployed at " + basicNFT.address)

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        console.log("Verifying....")
        await verify(basicNFT.address,ARGS)
    }
}

module.exports.tags=["all","basicNFT"]