const {network}=require("hardhat")
const sleep=(time)=>{
    return new Promise((resolve, reject)=>{
        setTimeout(resolve,time)
    })
}
const moveBlocks = async(amount,sleepAmout=0)=>{
        console.log("Moving blocks")
        for(let i=0;i<amount;i++){
            await network.provider.request({method:"evm_mine",params:[]})
        }

        if(sleepAmout){
            console.log("Sleeping")
            await sleep(sleepAmout)
        }
}

module.exports={moveBlocks,sleep};