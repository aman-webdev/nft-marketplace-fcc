Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed")

    const logger = Moralis.Cloud.getLogger()
    logger.info("Looking for confirmed Tx .........................")
    logger.info(request)
    if (confirmed) {
        logger.info("Found Item")
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        const itemListed = await query.first()
        if (itemListed) {
            logger.info(
                `Updating Item | with ${request.object.get("tokenId")} and ${request.object.get(
                    "nftAddress"
                )} with price : ${request.object.get("price")}`
            )
            
           itemListed.set("price", request.object.get("price"))
            await itemListed.save()
        } else {

            const activeItem = new ActiveItem()
            activeItem.set("marketplaceAddress", request.object.get("address"))
            activeItem.set("nftAddress", request.object.get("nftAddress"))
            activeItem.set("price", request.object.get("price"))
            activeItem.set("tokenId", request.object.get("tokenId"))
            activeItem.set("seller", request.object.get("seller"))
            logger.info(
                `Adding address ${request.object.get("address")} . TokenId ${request.object.get(
                    "tokenId"
                )}`
            )
            logger.info(" saving...")
            await activeItem.save()
        }
    } 
})

Moralis.Cloud.afterSave("ItemCancelled", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info("Item Cancelled..........................")
    logger.info(request)
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info("Marketplace | Query: " + query)
        const cancelledItem = await query.first()
        logger.info(`Marketplace | Cancelled: ${cancelledItem}`)
        if (cancelledItem) {
            logger.info("Deleting")
            await cancelledItem.destroy()
        } else {
            logger.info("No item found....")
        }
    }
})

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    if (confirmed) {
        logger.info("Item Bought....")
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info("Marketplace | Query: " + query)
        const boughtItem = await query.first()
        if (boughtItem) {
            logger.info("Deleting recently bought item")
            await boughtItem.destroy()
        } else {
            logger.info("No Item Found")
        }
    }
})
