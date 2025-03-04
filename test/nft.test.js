import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised'; // Import the chai-as-promised plugin
import pkg from 'hardhat';

const { ethers } = pkg;

use(chaiAsPromised);

describe("NFTSTORE Contract", function () {
  let nftStore, owner, user1, user2;

  beforeEach(async () => {
    const NFTSTORE = await ethers.getContractFactory("NFTSTORE");
    [owner, user1, user2] = await ethers.getSigners();
    nftStore = await NFTSTORE.deploy();
    await nftStore.deployed();
  });

  // a. Verify owner can mint NFTs and metadata is stored
  describe("Owner Minting", function () {
    it("Should allow owner to mint an NFT with correct metadata", async () => {
      const tokenURI = "ipfs://metadata1";

      await nftStore.connect(owner).mintNFTByOwner(user1.address, tokenURI);
      const tokenId = 1; // token counter starts from 1 in the contract

      // Validate token ownership
      const ownerOfToken = await nftStore.ownerOf(tokenId);
      expect(ownerOfToken).to.equal(user1.address);

      // Validate metadata
      const fetchedURI = await nftStore.tokenURI(tokenId);
      expect(fetchedURI).to.equal(tokenURI);
    });

    it("Should revert if non-owner tries to mint", async () => {
      const tokenURI = "ipfs://metadata2";
      await expect(nftStore.connect(user1).mintNFTByOwner(user1.address, tokenURI)).to.be.rejectedWith("Ownable: caller is not the owner");
    });
  });

  // b. Ensure saleOpen must be true for purchases with correct value
  describe("Purchasing NFTs", function () {
    beforeEach(async () => {
      // Open sale for the test
      await nftStore.connect(owner).toggleSaleStatus(true);
    });

    it("Should allow user to purchase an NFT with correct ETH value and store metadata", async () => {
      const tokenURI = "ipfs://purchase1";
      const tokenPrice = ethers.utils.parseEther("0.05");

      await nftStore.connect(user1).purchaseNFT(tokenURI, { value: tokenPrice });
      const tokenId = 1;

      // Validate token ownership
      const ownerOfToken = await nftStore.ownerOf(tokenId);
      expect(ownerOfToken).to.equal(user1.address);

      // Validate metadata
      const fetchedURI = await nftStore.tokenURI(tokenId);
      expect(fetchedURI).to.equal(tokenURI);
    });
  });

  // c. Confirm incorrect purchase conditions revert the transaction
  describe("Invalid Purchase Conditions", function () {
    it("Should revert if sale is not open", async () => {
      const tokenURI = "ipfs://purchase2";
      const tokenPrice = ethers.utils.parseEther("0.05");

      await expect(nftStore.connect(user1).purchaseNFT(tokenURI, { value: tokenPrice })).to.be.rejectedWith("Sale is currently closed");
    });

    it("Should revert if incorrect ETH value is sent", async () => {
      await nftStore.connect(owner).toggleSaleStatus(true);
      const tokenURI = "ipfs://purchase3";
      const incorrectPrice = ethers.utils.parseEther("0.1"); // Sending double the price

      await expect(nftStore.connect(user1).purchaseNFT(tokenURI, { value: incorrectPrice })).to.be.rejectedWith("Incorrect ETH value sent");
    });
  });

  // d. Validation of owner-only functions
  describe("Owner-only Actions", function () {
    it("Should allow only the owner to toggle the sale status", async () => {
      // Owner toggles sale status
      await nftStore.connect(owner).toggleSaleStatus(true);
      expect(await nftStore.saleLive()).to.equal(true);

      // Non-owner cannot toggle sale status
      await expect(nftStore.connect(user1).toggleSaleStatus(false)).to.be.rejectedWith("Ownable: caller is not the owner");
    });

    it("Should allow only owner to withdraw funds", async () => {
      const tokenURI = "ipfs://purchase4";
      const tokenPrice = ethers.utils.parseEther("0.05");
  
      // Open sale and user1 purchases an NFT
      await nftStore.connect(owner).toggleSaleStatus(true);
      await nftStore.connect(user1).purchaseNFT(tokenURI, { value: tokenPrice });
  
      // Contract balance should be updated
      const contractBalance = await ethers.provider.getBalance(nftStore.address);
      expect(contractBalance.toBigInt()).to.eq(tokenPrice.toBigInt()); // Ensure this passes
  
      // Store the owner's initial balance before withdrawal
      const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
      console.log("Initial owner balance:", ownerInitialBalance.toString());
  
      // Owner withdraws funds
      const tx = await nftStore.connect(owner).withdrawFunds();
      const receipt = await tx.wait();
  
      // Calculate gas cost
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      console.log("Gas cost:", gasCost.toString());
  
      // Owner's final balance after withdrawal
      const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
      console.log("Final owner balance:", ownerFinalBalance.toString());
  
      // Prepare the expected final balance
      const expectedFinalBalance = ownerInitialBalance.add(contractBalance).sub(gasCost);
      console.log("Expected final balance:", expectedFinalBalance.toString());
  
      // Use .eq() for BigNumber comparison
      expect(ownerFinalBalance.toBigInt()).to.eq(expectedFinalBalance.toBigInt());
  
      // Non-owner cannot withdraw funds
      await expect(nftStore.connect(user1).withdrawFunds()).to.be.rejectedWith("Ownable: caller is not the owner");
  });
  

    it("Should revert withdrawal if contract balance is zero", async () => {
      await expect(nftStore.connect(owner).withdrawFunds()).to.be.rejectedWith("Funds Insufficient");
    });
  });
});
