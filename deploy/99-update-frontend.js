const { ethers, network } = require("hardhat")
const fs = require("fs");
const constantsLocation = "./constants/networkMapping.json"

module.exports=async()=>{
    if(process.env.UPDATE_FRONT_END){
        console.log("Updating front end")
        await updateContractAddresses()
    }
}

const updateContractAddresses = async()=>{
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(constantsLocation,"utf8"))
    console.log(!(chainId in contractAddresses))
    
    if((chainId in contractAddresses)){
        console.log("first")
        if(!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)){
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        }else{
            contractAddresses[chainId]["NftMarketplace"] = {"NftMarketplace":[nftMarketplace.address]}
        }
    }

    
    console.log(contractAddresses)
    fs.writeFileSync(constantsLocation, JSON.stringify(contractAddresses));

   const ud= JSON.parse(fs.readFileSync(constantsLocation,"utf8"))
   console.log(ud)

}

module.exports.tags=["all","frontend"]