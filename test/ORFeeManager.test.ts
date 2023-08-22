import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { assert, expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import {
  ORFeeManager,
  ORFeeManager__factory,
  ORManager,
  ORManager__factory,
  Verifier,
  Verifier__factory,
} from '../typechain-types';
import { log } from 'console';
import { sign } from 'crypto';
import { dealersMock, dealersSignersMock, initTestToken } from './lib/mockData';

describe('ORFeeManger', () => {
  let signers: SignerWithAddress[];
  let orManager: ORManager;
  let orFeeManager: ORFeeManager;
  let dealerSinger: SignerWithAddress;
  let verifier: Verifier

  before(async function () {
    initTestToken();
    signers = await ethers.getSigners();
    dealerSinger = signers[2];

    const envORManagerAddress = process.env['OR_MANAGER_ADDRESS'];
    assert(
      !!envORManagerAddress,
      'Env miss [OR_MANAGER_ADDRESS]. You may need to test ORManager.test.ts first. Example: npx hardhat test test/ORManager.test test/ORFeeManager.test.ts',
    );

    orManager = new ORManager__factory(signers[0]).attach(envORManagerAddress);
    await orManager.deployed();

    verifier = await new Verifier__factory(signers[0]).deploy();  

    if(process.env['OR_FEE_MANAGER_ADDRESS'] != undefined) {
      orFeeManager = new ORFeeManager__factory(signers[0]).attach(process.env['OR_FEE_MANAGER_ADDRESS'] as string);
    } else{
      orFeeManager = await new ORFeeManager__factory(signers[0]).deploy(
        signers[1].address,
        orManager.address,
        verifier.address,
      );
    }

    console.log('Address of orFeeManager:', orFeeManager.address);
    await orFeeManager.deployed();
  });

  // it("transferOwnership should succeed", async function () {
  //   // transferOwnership to signer[0]
  //   await orFeeManager
  //     .connect(signers[1])
  //     .transferOwnership(signers[0].address);

  //   const newOwner = await orFeeManager.owner();
  //   expect(newOwner).eq(signers[0].address);

  // });

  it("ORFeeManager's functions prefixed with _ should be private", async function () {
    for (const key in orFeeManager.functions) {
      expect(key.replace(/^_/, '')).eq(key);
    }
  });

  it('Function updateDealer should emit events and update dealerInfo', async function () {
    const feeRatio = BigNumber.from(1000);
    const extraInfoTypes = ['string', 'string'];
    const extraInfoValues = ['https://orbiter.finance/', '@Orbiter_Finance'];
    const extraInfo = defaultAbiCoder.encode(extraInfoTypes, extraInfoValues);

    let dealersigners: SignerWithAddress[];
    dealersigners = await dealersSignersMock();

    await Promise.all(
      dealersigners.map(async (dealersigner) => {
        const { events } = await orFeeManager
          .connect(dealersigner)
          .updateDealer(feeRatio, extraInfo)
          .then((t) => t.wait());
    
        const args = events?.[0].args;
        expect(args?.dealer).eq(dealersigner.address);
        expect(args?.feeRatio).eq(feeRatio);
        expect(args?.extraInfo).eq(extraInfo);
    
        const dealerInfo = await orFeeManager.getDealerInfo(dealersigner.address);
        log("Address of dealer:", dealersigner.address);
        expect(dealerInfo.feeRatio).eq(feeRatio);
        expect(dealerInfo.extraInfoHash).eq(keccak256(extraInfo));
      })
    ); 
   });
});
