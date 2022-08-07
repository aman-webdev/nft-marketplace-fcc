const { developmentChains } = require("../../helper-hardhat.config")
const { network, ethers, getNamedAccounts, deployments } = require("hardhat")
const { assert, expect } = require("chai")

const TOKEN_URI = "https://ipfs.io/ipfs/QmR7YxBTrVQCwW6B4wJVgP3KaRrjjZARquL7eJnDkkZM85/1.json"
const LISTING_PRICE = ethers.utils.parseEther("1")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace", () => {
          let nftMarketplace, basicNFT, deployer, tester
          beforeEach(async () => {
              ;[deployer, tester] = await ethers.getSigners()
              await deployments.fixture(["all"])
              nftMarketplace = await ethers.getContract("NFTMarketplace", deployer)
              basicNFT = await ethers.getContract("BasicNFT", deployer)
          })

          describe("Deployment", () => {
              it("Should deploy NFT Marketplace", async () => {
                  const initProceeds = await nftMarketplace.getProceeds(deployer.address)
                  assert.equal(initProceeds.toString(), "0")
              })

              it("Should deploy NFT", async () => {
                  const name = await basicNFT.name()
                  const symbol = await basicNFT.symbol()
                  const tokenCount = await basicNFT.tokenCount()
                  assert.equal(name, "Mario")
                  assert.equal(symbol, "SM")
                  assert.equal(tokenCount.toString(), "0")
              })

              it("Should mint an NFT", async () => {
                  await basicNFT.mint(TOKEN_URI)
                  const tokenCount = await basicNFT.tokenCount()
                  const uri = await basicNFT.tokenURI(tokenCount.toString())
                  assert.equal(tokenCount.toString(), "1")
                  assert.equal(TOKEN_URI, uri)
              })
          })

          describe("List Item", () => {
              let tokenCount
              beforeEach(async () => {
                  await basicNFT.mint(TOKEN_URI)
                  tokenCount = await basicNFT.tokenCount()
                  await basicNFT.approve(nftMarketplace.address, tokenCount)
              })

              it("Should not list an unapproved item", async () => {
                  await basicNFT.approve(ethers.constants.AddressZero, tokenCount)
                  await expect(
                      nftMarketplace.listItem(
                          basicNFT.address,
                          tokenCount.toString(),
                          LISTING_PRICE
                      )
                  ).to.be.reverted
              })

              it("Should List an Item", async () => {
                  await nftMarketplace.listItem(
                      basicNFT.address,
                      tokenCount.toString(),
                      LISTING_PRICE
                  )
                  const [price, seller] = await nftMarketplace.getListing(
                      basicNFT.address,
                      tokenCount
                  )
                  assert.equal(price.toString(), LISTING_PRICE.toString())
                  assert.equal(seller, deployer.address)
              })

              it("Should not list a not owned nft", async () => {
                  const testerConnected = nftMarketplace.connect(tester)
                  await expect(
                      testerConnected.listItem(
                          basicNFT.address,
                          tokenCount.toString(),
                          LISTING_PRICE
                      )
                  ).to.be.revertedWith("NFTMarketplace__NotOwner()")
              })

              it("Should not list an already listed item", async () => {
                  await nftMarketplace.listItem(
                      basicNFT.address,
                      tokenCount.toString(),
                      LISTING_PRICE
                  )
                  const [price, seller] = await nftMarketplace.getListing(
                      basicNFT.address,
                      tokenCount
                  )
                  await expect(
                      nftMarketplace.listItem(
                          basicNFT.address,
                          tokenCount.toString(),
                          LISTING_PRICE
                      )
                  ).to.be.revertedWith("NFTMarketplace__AlreadyListed")
                  assert.equal(price.toString(), LISTING_PRICE.toString())
                  assert.equal(seller, deployer.address)
              })

              it("Should not list an item with price 0", async () => {
                  await expect(
                      nftMarketplace.listItem(basicNFT.address, tokenCount.toString(), 0)
                  ).to.be.revertedWith("NFTMarketplace__PriceMustBeAboveZero()")
              })
          })

          describe("Buy Item", () => {
              let tokenCount, testerConnected
              beforeEach(async () => {
                  testerConnected = nftMarketplace.connect(tester)
                  await basicNFT.mint(TOKEN_URI)
                  tokenCount = await basicNFT.tokenCount()
                  await basicNFT.approve(nftMarketplace.address, tokenCount)
              })

              it("Should not buy a non listed token", async () => {
                  await expect(
                      nftMarketplace.buyItem(basicNFT.address, tokenCount, { value: LISTING_PRICE })
                  ).to.be.revertedWith("NFTMarketplace__NotListed")
              })

              it("Should not buy an item with paying less than listed price", async () => {
                  await nftMarketplace.listItem(
                      basicNFT.address,
                      tokenCount.toString(),
                      LISTING_PRICE
                  )
                  await expect(
                      testerConnected.buyItem(basicNFT.address, tokenCount, { value: 10 })
                  ).to.be.revertedWith("NFTMarketplace__PriceNotMet")
              })

              it("Should buy an NFT", async () => {
                  const initOwner = await basicNFT.ownerOf(tokenCount)
                  await nftMarketplace.listItem(
                      basicNFT.address,
                      tokenCount.toString(),
                      LISTING_PRICE
                  )
                  await testerConnected.buyItem(basicNFT.address, tokenCount, {
                      value: LISTING_PRICE,
                  })
                  const newOwner = await basicNFT.ownerOf(tokenCount)
                  const [price, seller] = await nftMarketplace.getListing(
                      nftMarketplace.address,
                      tokenCount
                  )
                  const ownerProceeds = await nftMarketplace.getProceeds(deployer.address)
                  assert.equal(initOwner, deployer.address)
                  assert.equal(newOwner, tester.address)
                  assert.equal(ethers.constants.AddressZero, seller)
                  assert.equal(price.toNumber(), 0)
                  assert.equal(ownerProceeds.toString(), LISTING_PRICE)
              })
          })

          describe("Cancel Listing", () => {
              let tokenCount, testerConnected
              beforeEach(async () => {
                  testerConnected = nftMarketplace.connect(tester)
                  await basicNFT.mint(TOKEN_URI)
                  tokenCount = await basicNFT.tokenCount()

                  await basicNFT.approve(nftMarketplace.address, tokenCount)
                  await nftMarketplace.listItem(basicNFT.address, tokenCount, LISTING_PRICE)
              })

              it("Should not cancel the listing by non owner", async () => {
                  await expect(
                      testerConnected.cancelListing(basicNFT.address, tokenCount)
                  ).to.be.revertedWith("NFTMarketplace__NotOwner()")
              })

              it("Should not cancel a non listed item", async () => {
                  const testerNFT = basicNFT.connect(tester)
                  await testerNFT.mint(TOKEN_URI)
                  const updatedCount = await testerNFT.tokenCount()
                  await expect(
                      testerConnected.cancelListing(basicNFT.address, updatedCount)
                  ).to.be.revertedWith("NFTMarketplace__NotListed")
                  assert.equal(updatedCount.toString(), "2")
              })

              it("Should cancel an item", async () => {
                  await nftMarketplace.cancelListing(basicNFT.address, tokenCount)
                  const [price, seller] = await nftMarketplace.getListing(
                      basicNFT.address,
                      tokenCount
                  )
                  assert.equal(price.toString(), "0")
                  assert.equal(seller, ethers.constants.AddressZero)
              })
          })

          describe("Update Listing", async () => {
              beforeEach(async () => {
                  testerConnected = nftMarketplace.connect(tester)
                  await basicNFT.mint(TOKEN_URI)
                  tokenCount = await basicNFT.tokenCount()

                  await basicNFT.approve(nftMarketplace.address, tokenCount)
                  await nftMarketplace.listItem(basicNFT.address, tokenCount, LISTING_PRICE)
              })

              it("Should update the listing", async () => {
                  await nftMarketplace.updateListing(
                      basicNFT.address,
                      tokenCount,
                      ethers.utils.parseEther("2")
                  )
                  const [price, seller] = await nftMarketplace.getListing(
                      basicNFT.address,
                      tokenCount
                  )
                  assert.equal(price.toString(), ethers.utils.parseEther("2"))
                  assert.equal(seller, deployer.address)
              })
          })

          describe("Withdraw Proceeding", async () => {
              beforeEach(async () => {
                  testerConnected = nftMarketplace.connect(tester)
                  await basicNFT.mint(TOKEN_URI)
                  tokenCount = await basicNFT.tokenCount()

                  await basicNFT.approve(nftMarketplace.address, tokenCount)
                  await nftMarketplace.listItem(basicNFT.address, tokenCount, LISTING_PRICE)
              })

              it("Should revert if the proceeding amount is 0", async () => {
                  await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
                      "NFTMarketplace__NoProceeds"
                  )
              })

              it("Should withdraw Proceeds", async () => {
                  const initBalance = await deployer.provider.getBalance(deployer.address)
                  await testerConnected.buyItem(basicNFT.address, tokenCount, {
                      value: LISTING_PRICE,
                  })
                  await nftMarketplace.withdrawProceeds()
                  const updatedBalance = await deployer.provider.getBalance(deployer.address)
                  const updateProceeds = await nftMarketplace.getProceeds(deployer.address)
                  const [price, seller] = await nftMarketplace.getListing(
                      basicNFT.address,
                      tokenCount
                  )
                  assert.equal(price.toString(), "0")
                  assert.equal(seller, ethers.constants.AddressZero)
                  assert.equal(updateProceeds.toString(), "0")
              })
          })
      })
