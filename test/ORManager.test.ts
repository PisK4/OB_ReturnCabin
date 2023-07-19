import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import {
  BigNumber,
  BigNumberish,
  CallOverrides,
  Wallet,
  constants,
} from 'ethers';
import { ethers } from 'hardhat';
import lodash from 'lodash';
import { ORManager, ORManager__factory } from '../typechain-types';
import { BridgeLib } from '../typechain-types/contracts/interface/IORManager';
import { defaultChainInfo, defaultsEbcs } from './defaults';
import { embedStorageVersionIncrease, testRevertedOwner } from './utils.test';

describe('Test ORManager', () => {
  let signers: SignerWithAddress[];
  let orManager: ORManager;

  before(async function () {
    signers = await ethers.getSigners();
  });

  it('Owner should be able to be set when deploying the contract', async function () {
    orManager = await new ORManager__factory(signers[0]).deploy(
      signers[1].address,
    );
    console.log('Address of orManager contract:', orManager.address);
    await orManager.deployed();

    // set environment variables
    process.env['OR_MANAGER_ADDRESS'] = orManager.address;

    const owner = await orManager.owner();
    expect(owner).eq(signers[1].address);
  });

  it("ORManager's functions prefixed with _ should be private", async function () {
    for (const key in orManager.functions) {
      expect(key.replace(/^_/, '')).eq(key);
    }
  });

  it('Function transferOwnership should succeed', async function () {
    await testRevertedOwner(orManager.transferOwnership(signers[0].address));

    await orManager
      .connect(signers[1])
      .transferOwnership(signers[0].address)
      .then((t) => t.wait());
  });

  it(
    'Function registerChains should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const chains = [
          lodash.cloneDeepWith(defaultChainInfo),
          lodash.cloneDeepWith(defaultChainInfo),
        ];

        const { events } = await orManager
          .registerChains(chains)
          .then((i) => i.wait());

        for (const i in chains) {
          const event = events![i];
          let chainInfo: BridgeLib.ChainInfoStruct = lodash.toPlainObject(
            event.args!.chainInfo,
          );

          expect(lodash.toPlainObject(chainInfo)).to.deep.includes(chains[i]);

          const storageChainInfo = await orManager.getChainInfo(chains[i].id);
          expect(storageChainInfo.id).eq(chains[i].id);
        }
      },
    ),
  );

  it(
    'Function updateChainSpvs should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const chainId = defaultChainInfo.id;

        const spvs: string[] = [];
        const indexs: BigNumberish[] = [BigNumber.from(0)];
        for (let i = 0; i < 10; i++) {
          spvs.push(ethers.Wallet.createRandom().address);
        }

        const { events } = await orManager
          .updateChainSpvs(chainId, spvs, indexs)
          .then((t) => t.wait());

        expect(events![0].args!.id).eq(chainId);
        expect(events![0].args!.chainInfo.spvs).deep.eq(spvs);
      },
    ),
  );

  it(
    'Function updateChainTokens should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const chainIds: number[] = [];
        const tokens: BridgeLib.TokenInfoStruct[] = [];
        for (let i = 1; i <= 10; i++) {
          chainIds.push(Number(defaultChainInfo.id));
          tokens.push({
            token: BigNumber.from(ethers.Wallet.createRandom().address).add(0), // add(0), convert _hex uppercase to lowercase
            mainnetToken: constants.AddressZero,
            decimals: i * 2,
          });
        }

        const { events } = await orManager
          .updateChainTokens(chainIds, tokens)
          .then((t) => t.wait());

        (events || []).forEach((event, i) => {
          expect(event.args?.id).to.eq(chainIds[i]);
          expect(lodash.toPlainObject(event.args?.tokenInfo)).to.deep.includes(
            tokens[i],
          );
        });

        const latestIndex = tokens.length - 1;
        const tokenInfo = await orManager.getChainTokenInfo(
          chainIds[latestIndex],
          tokens[latestIndex].token,
        );
        expect(lodash.toPlainObject(tokenInfo)).to.deep.includes(
          tokens[latestIndex],
        );
      },
    ),
  );

  it(
    'Function updateEbcs should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const ebcs = lodash.cloneDeep(defaultsEbcs);
        const statuses: boolean[] = [];

        const { events } = await orManager
          .updateEbcs(ebcs, statuses)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.ebcs).to.deep.eq(ebcs);
        expect(args.statuses).to.deep.eq(statuses);

        for (const ebc of ebcs) {
          const status = await orManager.ebcIncludes(ebc);
          expect(status).to.deep.eq(true);
        }

        expect(await orManager.ebcIncludes(constants.AddressZero)).to.deep.eq(
          false,
        );
      },
    ),
  );

  it(
    'Function updateSubmitter should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const submitter = ethers.Wallet.createRandom().address;

        const { events } = await orManager
          .updateSubmitter(submitter)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.submitter).to.deep.eq(submitter);

        const storageSubmitter = await orManager.submitter();
        expect(storageSubmitter).to.deep.eq(submitter);
      },
    ),
  );

  it(
    'Function updateProtocolFee should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const protocolFee = 10;

        const { events } = await orManager
          .updateProtocolFee(protocolFee)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.protocolFee).to.deep.eq(protocolFee);

        const storageProtocolFee = await orManager.protocolFee();
        expect(storageProtocolFee).to.deep.eq(protocolFee);
      },
    ),
  );

  it(
    'Function updateMinChallengeRatio should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const minChallengeRatio = 20;

        const { events } = await orManager
          .updateMinChallengeRatio(minChallengeRatio)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.minChallengeRatio).to.deep.eq(minChallengeRatio);

        const storageMinChallengeRatio = await orManager.minChallengeRatio();
        expect(storageMinChallengeRatio).to.deep.eq(minChallengeRatio);
      },
    ),
  );

  it(
    'Function updateChallengeUserRatio should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const challengeUserRatio = 15;

        const { events } = await orManager
          .updateChallengeUserRatio(challengeUserRatio)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.challengeUserRatio).to.deep.eq(challengeUserRatio);

        const storageChallengeUserRatio = await orManager.challengeUserRatio();
        expect(storageChallengeUserRatio).to.deep.eq(challengeUserRatio);
      },
    ),
  );

  it(
    'Function updateFeeChallengeSecond should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const feeChallengeSecond = 25;

        const { events } = await orManager
          .updateFeeChallengeSecond(feeChallengeSecond)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.feeChallengeSecond).to.deep.eq(feeChallengeSecond);

        const storageFeeChallengeSecond = await orManager.feeChallengeSecond();
        expect(storageFeeChallengeSecond).to.deep.eq(feeChallengeSecond);
      },
    ),
  );

  it(
    'Function updateFeeTakeOnChallengeSecond should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const feeTakeOnChallengeSecond = 25;

        const { events } = await orManager
          .updateFeeTakeOnChallengeSecond(feeTakeOnChallengeSecond)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.feeTakeOnChallengeSecond).to.deep.eq(
          feeTakeOnChallengeSecond,
        );

        const storageFeeTakeOnChallengeSecond =
          await orManager.feeTakeOnChallengeSecond();
        expect(storageFeeTakeOnChallengeSecond).to.deep.eq(
          feeTakeOnChallengeSecond,
        );
      },
    ),
  );

  it(
    'Function updateMaxMDCLimit should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const maxMDCLimit = BigNumber.from(2).pow(64).sub(1);

        const { events } = await orManager
          .updateMaxMDCLimit(maxMDCLimit)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.maxMDCLimit).to.deep.eq(maxMDCLimit);

        const storageMaxMDCLimit = await orManager.maxMDCLimit();
        expect(storageMaxMDCLimit).to.deep.eq(maxMDCLimit);
      },
    ),
  );

  it(
    'Function updateExtraTransferContract should succeed',
    embedStorageVersionIncrease(
      () => orManager.storageVersion(),
      async function () {
        const extraTransferContract = BigNumber.from(
          Wallet.createRandom().address.toLowerCase(),
        ).toHexString();

        const { events } = await orManager
          .updateExtraTransferContract(extraTransferContract)
          .then((t) => t.wait());

        const args = events![0].args!;
        expect(args.extraTransferContract).to.deep.eq(extraTransferContract);

        const storageETC = await orManager.extraTransferContract();
        expect(storageETC).to.deep.eq(extraTransferContract);
      },
    ),
  );
});
