
Moralis.Cloud.afterSave("ItemListed",async(request)=>{

        const confirmed = request.object.get("confirmed");

        const logger = Moralis.Cloud.getLogger()
        logger.info("Looking for confirmed Tx .........................")
        logger.info(request)
        if(confirmed){
                logger.info("Found Item")
                const ActiveItem = Moralis.Object.extend("ActiveItem")

                const activeItem = new ActiveItem()     
                activeItem.set("marketplaceAddress",request.object.get("address"))
                activeItem.set("nftAddress",request.object.get("nftAddress"))
                activeItem.set("price",request.object.get("price"))
                activeItem.set("tokenId",request.object.get("tokenId"))
                activeItem.set("seller",request.object.get("seller"))
                logger.info(`Adding address ${request.object.get("address")} . TokenId ${request.object.get("tokenId")}`)
                logger.info("saving...")
                await activeItem.save()
        }
})

Moralis.Cloud.afterSave("ItemCancelled",async(request)=>{
        const confirmed = request.object.get("confirmed")
        const logger = Moralis.Cloid.getLogger()
        logger.info("Item Bought..........................")
        logger.info(request)
        if(confirmed){
                const ActiveItem = Moralis.Object.extend("ActiveItem")
                const query = new Moralis.Query(ActiveItem)
                query.equalTo("marketplaceAddress",request.object.get("marketplaceAddress"))
                query.equalTo("nftAddress",request.object.get("nftAddress"))
                query.equalTo("tokenId",request.object.get("tokenId"))
        }
})