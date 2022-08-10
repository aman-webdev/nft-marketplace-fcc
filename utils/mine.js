const {moveBlocks}=require("./moveBlock")
const BLOCKS=2
const SLEEP_AMOUNT=1000;
const mine=async()=>{
    await moveBlocks(BLOCKS,SLEEP_AMOUNT)
}

mine()