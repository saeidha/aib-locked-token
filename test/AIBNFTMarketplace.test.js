const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIBNFTMarketplace", function () {
    // Declare variables for contracts and accounts
    let marketplace, mockNft;
    let owner, seller, buyer;
    
    // Define constants for fees and prices
    const listingFee = ethers.parseEther("0.01");
    const nftPrice = ethers.parseEther("1.0");
    const tokenId = 0;

    // Deploy contracts and mint an NFT before each test
    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        // Deploy MockNFT contract for testing
        const MockNFT = await ethers.getContractFactory("MockNFT");
        mockNft = await MockNFT.deploy();
        await mockNft.waitForDeployment();
        
        // Mint NFT with tokenId 0 to the 'seller' account
        await mockNft.connect(owner).mint(seller.address);

        // Deploy the main marketplace contract
        const AIBNFTMarketplace = await ethers.getContractFactory("AIBNFTMarketplace");
        marketplace = await AIBNFTMarketplace.deploy(listingFee);
        await marketplace.waitForDeployment();
    });

    // Test group for contract deployment
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await marketplace.owner()).to.equal(owner.address);
        });

        it("Should set the initial listing fee", async function () {
            expect(await marketplace.getListingFee()).to.equal(listingFee);
        });
    });

    // Test group for listing NFTs
    describe("Listing an NFT", function () {
        beforeEach(async function () {
            // Pre-approval: Seller must approve the marketplace to handle the NFT
            await mockNft.connect(seller).approve(await marketplace.getAddress(), tokenId);
        });

        it("Should fail if listing fee is not paid", async function () {
            await expect(
                marketplace.connect(seller).listNFT(await mockNft.getAddress(), tokenId, nftPrice)
            ).to.be.revertedWith("Incorrect listing fee paid.");
        });

        it("Should fail if the marketplace is not approved for the NFT", async function () {
            await mockNft.connect(owner).mint(seller.address); // Mint a new NFT
            const newTokenId = 1;
            await expect(
                marketplace.connect(seller).listNFT(await mockNft.getAddress(), newTokenId, nftPrice, { value: listingFee })
            ).to.be.revertedWith("Marketplace not approved for this NFT.");
        });

        it("Should successfully list an NFT and lock it", async function () {
            await expect(
                marketplace.connect(seller).listNFT(await mockNft.getAddress(), tokenId, nftPrice, { value: listingFee })
            ).to.emit(marketplace, "NFTListed");

            // Verify NFT is now owned (locked) by the marketplace
            expect(await mockNft.ownerOf(tokenId)).to.equal(await marketplace.getAddress());

            // Verify listing details are correct
            const listing = await marketplace.getListing(await mockNft.getAddress(), tokenId);
            expect(listing.seller).to.equal(seller.address);
            expect(listing.price).to.equal(nftPrice);
        });
    });
    
    // Test group for buying NFTs
    describe("Buying an NFT", function () {
        beforeEach(async function () {
            await mockNft.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).listNFT(await mockNft.getAddress(), tokenId, nftPrice, { value: listingFee });
        });
        
        it("Should fail if insufficient ETH is sent", async function() {
            const lowPrice = ethers.parseEther("0.5");
            await expect(
                marketplace.connect(buyer).buyNFT(await mockNft.getAddress(), tokenId, { value: lowPrice })
            ).to.be.revertedWith("Insufficient funds to purchase.");
        });
        
        it("Should successfully complete the purchase and transfer assets", async function() {
            const sellerInitialBalance = await ethers.provider.getBalance(seller.address);
            
            await marketplace.connect(buyer).buyNFT(await mockNft.getAddress(), tokenId, { value: nftPrice });

            // Verify NFT ownership is transferred to buyer
            expect(await mockNft.ownerOf(tokenId)).to.equal(buyer.address);
            
            // Verify seller received the payment
            const sellerFinalBalance = await ethers.provider.getBalance(seller.address);
            expect(sellerFinalBalance).to.equal(sellerInitialBalance + nftPrice);

            // Verify the listing is removed
            const listing = await marketplace.getListing(await mockNft.getAddress(), tokenId);
            expect(listing.price).to.equal(0);
        });
    });

    // Test group for canceling listings
    describe("Cancelling a Listing", function () {
        beforeEach(async function () {
            await mockNft.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).listNFT(await mockNft.getAddress(), tokenId, nftPrice, { value: listingFee });
        });

        it("Should fail if a non-seller tries to cancel", async function () {
            await expect(
                marketplace.connect(buyer).cancelListing(await mockNft.getAddress(), tokenId)
            ).to.be.revertedWith("You are not the seller of this NFT.");
        });

        it("Should allow the seller to cancel and retrieve the NFT", async function () {
            await marketplace.connect(seller).cancelListing(await mockNft.getAddress(), tokenId);

            // Verify NFT is returned to the seller
            expect(await mockNft.ownerOf(tokenId)).to.equal(seller.address);

            // Verify listing is deleted
            const listing = await marketplace.getListing(await mockNft.getAddress(), tokenId);
            expect(listing.price).to.equal(0);
        });
    });

    // Test group for admin functionalities
    describe("Admin Functions", function () {
        it("Should allow owner to update the listing fee", async function () {
            const newFee = ethers.parseEther("0.05");
            await marketplace.connect(owner).updateListingFee(newFee);
            expect(await marketplace.getListingFee()).to.equal(newFee);
        });

        it("Should allow owner to withdraw fees", async function () {
            await mockNft.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await marketplace.connect(seller).listNFT(await mockNft.getAddress(), tokenId, nftPrice, { value: listingFee });
            
            const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
            const contractBalance = await marketplace.getContractBalance();

            const tx = await marketplace.connect(owner).withdrawFees();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
            expect(ownerFinalBalance).to.equal(ownerInitialBalance + contractBalance - gasUsed);
        });
        
        it("Should allow owner to pause and unpause the contract", async function() {
            await marketplace.connect(owner).pause();
            
            await mockNft.connect(seller).approve(await marketplace.getAddress(), tokenId);
            await expect(
                marketplace.connect(seller).listNFT(await mockNft.getAddress(), tokenId, nftPrice, { value: listingFee })
            ).to.be.revertedWithCustomError(marketplace, "EnforcedPause");
            
            await marketplace.connect(owner).unpause();
            
            await expect(
                marketplace.connect(seller).listNFT(await mockNft.getAddress(), tokenId, nftPrice, { value: listingFee })
            ).to.not.be.reverted;
        });
    });
});