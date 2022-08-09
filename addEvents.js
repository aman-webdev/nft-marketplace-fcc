const { network } = require("hardhat");
const Moralis = require("moralis/node")
require("dotenv").config();
const contractAddresses = require("./constants/networkMapping.json")

const chainId = process.env.chainId || "31337"
const moralisChainId = "31337" ? "1337" : chainId
const contractAddress = contractAddresses[chainId]["NftMarketplace"][0]

const SERVER_URL=process.env.SERVER_URL
const APP_ID=process.env.APP_ID
const MASTER_KEY=process.env.MASTER_KEY



const main=async()=>{
    
    await Moralis.start({serverUrl:SERVER_URL,appId:APP_ID, masterKey:MASTER_KEY});
    console.log("connection")
    console.log(`working with contract ${contractAddress}`)

    const itemListedOptions = {
        chainId : moralisChainId,
        sync_historical:true,
        topic: "ItemListed(address,address,uint256,uint256)",
        abi: {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "nftAddress",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              }
            ],
            "name": "ItemListed",
            "type": "event"
          },
          tableName:"ItemListed",
          address:contractAddress
        
    }
    const itemBoughtOptions = {
        chainId : moralisChainId,
        sync_historical:true,
        topic: "ItemBought(address,address,uint256,uint256)",
        abi:  {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "nftAddress",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
              }
            ],
            "name": "ItemBought",
            "type": "event"
          },
          tableName:"ItemBought",
          address:contractAddress
        
    }
    const itemCancelledtOptions = {
        chainId : moralisChainId,
        sync_historical:true,
        topic: "ItemCancelled(address,address,uint256)",
        abi: {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "nftAddress",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
              }
            ],
            "name": "ItemCancelled",
            "type": "event"
          },
          tableName:"ItemCancelled",
          address:contractAddress
        
    }

    const listedResponse = await Moralis.Cloud.run("watchContractEvent",itemListedOptions,{useMasterKey:true})
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent",itemBoughtOptions,{useMasterKey:true})
    const cancelledResponse = await Moralis.Cloud.run("watchContractEvent",itemCancelledtOptions,{useMasterKey:true})
    console.log(listedResponse,boughtResponse,cancelledResponse)
    if(listedResponse.success && boughtResponse.success && cancelledResponse.success){
        console.log("Success ....")
    }else{
        console.log("Something went wrong ....")
    }
}

main()