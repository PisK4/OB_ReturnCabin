import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from 'hardhat';
import { TestToken, TestToken__factory } from "../typechain-types";
import { expect } from "chai";
import { formatEther } from "ethers/lib/utils";


describe("Test deploy token", () => {
  let signers: SignerWithAddress[];
  let mdcOwner: SignerWithAddress;
  let testToken: TestToken;

  before(async function () {
    signers = await ethers.getSigners();
    mdcOwner = signers[0];

    testToken = await new TestToken__factory(mdcOwner).deploy();
    console.log('Address of testToken:', testToken.address);


    await testToken.deployed();
  });

  it("contract should be deployed", async function () {
    expect(testToken.address).to.not.equal(0);
    const balance = await testToken.balanceOf(mdcOwner.address);
    console.log('Balance of mdcOwner:', formatEther(balance));
  });

  it("should Mint 1000 tokens", async function () {
    await testToken.mint(1000000);
    const balance = await testToken.balanceOf(mdcOwner.address);
    console.log('Balance of mdcOwner:', formatEther(balance));
  });

});
