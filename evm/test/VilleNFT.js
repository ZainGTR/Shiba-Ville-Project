const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VilleNFT Contract", function () {
  let VilleNFT, villeNFT;
  let owner, user1, user2;
  const dev = "0xB2972a5C242f98c1626Df11a52a1Edbc62Acd507";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const VilleNFTFactory = await ethers.getContractFactory("VilleNFT");
    villeNFT = await VilleNFTFactory.deploy(dev);
  });

  it("Should deploy with the correct initial state", async function () {
    const initialPrice = await villeNFT.getPrice();
    expect(initialPrice).to.equal(ethers.parseEther("0.01"));
  });

  it("Should allow users to mint an NFT by paying the mint price", async function () {
    const mintPrice = await villeNFT.getPrice();
    await expect(villeNFT.connect(user1).mint({ value: mintPrice }))
      .to.emit(villeNFT, "Transfer") // ERC721 Transfer event
      .withArgs("0x0000000000000000000000000000000000000000", user1.address, 0); // Token ID 0

    const ownerOfToken0 = await villeNFT.ownerOf(0);
    expect(ownerOfToken0).to.equal(user1.address);

    const newPrice = await villeNFT.getPrice();
    expect(newPrice).to.equal(mintPrice + ethers.parseEther("0.0001"));
  });

  it("Should revert if the mint price is incorrect", async function () {
    const mintPrice = await villeNFT.getPrice();
    await expect(
      villeNFT.connect(user1).mint({ value: mintPrice - BigInt(1) })
    ).to.be.revertedWith("Incorrect mint price");

    await expect(
      villeNFT.connect(user1).mint({ value: mintPrice + BigInt(1) })
    ).to.be.revertedWith("Incorrect mint price");
  });

  it("Should transfer the mint price to the developer's address", async function () {
    const mintPrice = await villeNFT.getPrice();
    const initialDevBalance = await ethers.provider.getBalance(dev);

    await villeNFT.connect(user1).mint({ value: mintPrice });

    const finalDevBalance = await ethers.provider.getBalance(dev);
    expect(finalDevBalance - initialDevBalance).to.equal(mintPrice);
  });

  it("Should mint multiple NFTs and increment token IDs and price correctly", async function () {
    const initialPrice = await villeNFT.getPrice();
    // Mint first NFT
    await villeNFT.connect(user1).mint({ value: initialPrice });
    expect(await villeNFT.ownerOf(0)).to.equal(user1.address);

    const secondPrice = await villeNFT.getPrice();

    // Mint second NFT
    await villeNFT.connect(user2).mint({ value: secondPrice });
    expect(await villeNFT.ownerOf(1)).to.equal(user2.address);

    const thirdPrice = await villeNFT.getPrice();
    expect(thirdPrice).to.equal(initialPrice + ethers.parseEther("0.0002"));

    expect();
  });
});
