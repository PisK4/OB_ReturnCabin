import hre, { ethers } from 'hardhat';
import { BridgeLib } from '../../typechain-types/contracts/ORManager';
import { BigNumber, Bytes, constants } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TestToken, TestToken__factory } from '../../typechain-types';
import lodash, { chain } from 'lodash';
import { mock } from 'node:test';

export const chainNames = {
  5: "goerli",
  420: "optimisim goerli",
  421613: "arbitrum goerli",
  280:   "zk-sync Era Testnet"
};

// mark the chain id that if we don't want to test
export const chainIdsMock = [
  // 1, 
  // 42161, 
  // 10, 
  // 324,
  5,      // goerli
  420,    // optimisim goerli testnet
  421613, // arbitrum goerli testnet
  // 280,    // zk-sync Era testnet
];

export const chainIdsMockMainnetToken = [
  // 1, 
  // 42161, 
  // 10, 
  // 324,
  "0x0000000000000000000000000000000000000000",      // goerli
  "0x0000000000000000000000000000000000000000",    // optimisim goerli testnet
  "0x0000000000000000000000000000000000000000", // arbitrum goerli testnet
  // 280,    // zk-sync Era testnet
];

// struct SubmitInfo 
export interface SubmitInfo {
  stratBlock: number;
  endBlock: number;
  profitRoot: string;
  stateTransTreeRoot: string;
}

export interface SMTLeaf {
  key: SMTKey;
  value: SMTValue;
}

interface SMTKey {
  token: string;
  dealer: string;
  chainId: number;
}

interface SMTValue {
  dealer: string;
  token: string;
  chainId: number;
  amount: BigNumber;
}

interface MergeValueSingle{
  value1: number;
  value2: Bytes;
  value3: Bytes;
}

export interface MergeValue{ 
  mergeType: number;
  mergeValue: MergeValueSingle;
}

export interface SMTProof {
  proofs: string[][];
  siblings: string[];
  smtLeaves: SMTLeaf[];
}

/************************ Mock Data ***************************/

export const dealersMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(0, 2).map(signer => signer.address);
};

export const submitterMock = async () => {
  const signers = await ethers.getSigners();
  return signers[0].address;
}
// return signers
export const dealersSignersMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(0, 2);
};

export const profitRootMock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('profitRoot'));
export const stateTransTreeRootMock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('stateTransTreeRoot'));

export const SubmitInfoMock = async (): Promise<SubmitInfo> => {
  const submitInfo: SubmitInfo = {
    stratBlock: 0,
    endBlock: 2,
    profitRoot: profitRootMock,
    stateTransTreeRoot: stateTransTreeRootMock,
  };
  return submitInfo;
}

export const proofsMock: string[][] = [[ethers.utils.keccak256(ethers.utils.toUtf8Bytes('proofs'))]];
export const siblingsMock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('siblings'));

export const mockKey: SMTKey = {
  token:  ethers.constants.AddressZero,
  dealer: ethers.constants.AddressZero,
  chainId: 1,
}

export const mockValue: SMTValue = {
  dealer: ethers.constants.AddressZero,
  token: ethers.constants.AddressZero,
  chainId: 1,
  amount: BigNumber.from(1000),
}

export const smtLeavesMock: SMTLeaf = 
  {
    key: {
      token: mockKey.token,
      dealer: mockKey.dealer,
      chainId: mockKey.chainId,
    },
    value: {
      dealer: mockValue.dealer,
      token: mockValue.token,
      chainId: mockValue.chainId,
      amount: mockValue.amount,
    }
  };

export const mergeValueMock: MergeValue = {
  mergeType: 1,
  mergeValue: {
    value1: 1,
    value2: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('value2')) as unknown as Bytes,
    value3: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('value3')) as unknown as Bytes,
  }
}

// export const SMTProofMock = async (): Promise<SMTProof> => {
//   const smtProof: SMTProof = {
//     proofs: proofsMock,
//     siblings: [siblingsMock],
//     smtLeaves: smtLeavesMock,
//   };
//   return smtProof;
// }

/************************ Mock Data ************************** */

export const defaultChainInfoArray: BridgeLib.ChainInfoStruct[] = chainIdsMock.map((chainId) => {
  return {
    id: BigNumber.from(chainId),
    batchLimit: BigNumber.from(1000),
    minVerifyChallengeSourceTxSecond: BigNumber.from(100),
    maxVerifyChallengeSourceTxSecond: BigNumber.from(200),
    minVerifyChallengeDestTxSecond: BigNumber.from(100),
    maxVerifyChallengeDestTxSecond: BigNumber.from(200),
    nativeToken: BigNumber.from(chainIdsMockMainnetToken[chainIdsMock.indexOf(chainId)]),
    spvs: [constants.AddressZero],
  };
});

export function getRandomPadding() {
  return Math.floor(Math.random() * 500) + 1;
}

export let testToken = {
  USDT_TOKEN: [] as string[],
  UDSC_TOKEN: [] as string[],
  MAINNET_TOKEN: [] as string[],
  ARBITRUM_TOKEN: [] as string[],
  OPTIMISM_TOKEN: [] as string[],
  ERA_TOKRN: [] as string[] 
};

export function initTestToken() {
  const usdtTokens = new Set<string>();
  const usdcTokens = new Set<string>();
  const mainnetTokens = new Set<string>();
  const arbitrumTokens = new Set<string>();
  const optimismTokens = new Set<string>();
  const eraTokens = new Set<string>();

  if(process.env['MAINNET_NATIVE_TOKEN'] != undefined) {
    process.env['MAINNET_NATIVE_TOKEN'].split(',').forEach((token) => {
      mainnetTokens.add(token);
    });
  }

  if (process.env['ARBITRUM_NATIVE_TOKEN'] != undefined) {
    process.env['ARBITRUM_NATIVE_TOKEN'].split(',').forEach((token) => {
      arbitrumTokens.add(token);
    });
  }

  if (process.env['OPTIMISM_NATIVE_TOKEN'] != undefined) {
    process.env['OPTIMISM_NATIVE_TOKEN'].split(',').forEach((token) => {
      optimismTokens.add(token);
    });
  }

  if (process.env['MAINNET_TEST_USDT'] != undefined) {
    process.env['MAINNET_TEST_USDT'].split(',').forEach((token) => {
      usdtTokens.add(token);
    });
    process.env['MAINNET_TEST_USDT'] .split(',').forEach((token) => {
      mainnetTokens.add(token);
    });
  }
  if (process.env['ARBITRUM_TEST_USDT'] != undefined) {
    process.env['ARBITRUM_TEST_USDT'].split(',').forEach((token) => {
      usdtTokens.add(token);
    });
    process.env['ARBITRUM_TEST_USDT'].split(',').forEach((token) => {
      arbitrumTokens.add(token);
    });
  }
  if (process.env['OPTIMISM_TEST_USDT'] != undefined) {
    process.env['OPTIMISM_TEST_USDT'].split(',').forEach((token) => {
      usdtTokens.add(token);
    });
    process.env['OPTIMISM_TEST_USDT'].split(',').forEach((token) => {
      optimismTokens.add(token);
    });
  }

  if (process.env['MAINNET_TEST_USDC'] != undefined) {
    process.env['MAINNET_TEST_USDC'].split(',').forEach((token) => {
      usdcTokens.add(token);
    });
    process.env['MAINNET_TEST_USDC'].split(',').forEach((token) => {
      mainnetTokens.add(token);
    });
  }
  if (process.env['ARBITRUM_TEST_USDC'] != undefined) {
    process.env['ARBITRUM_TEST_USDC'].split(',').forEach((token) => {
      usdcTokens.add(token);
    });
    process.env['ARBITRUM_TEST_USDC'].split(',').forEach((token) => {
      arbitrumTokens.add(token);
    });
  }
  if (process.env['OPTIMISM_TEST_USDC'] != undefined) {
    process.env['OPTIMISM_TEST_USDC'].split(',').forEach((token) => {
      usdcTokens.add(token);
    });
    process.env['OPTIMISM_TEST_USDC'].split(',').forEach((token) => {
      optimismTokens.add(token);
    });
  }

  testToken = {
    USDT_TOKEN: Array.from(usdtTokens),
    UDSC_TOKEN: Array.from(usdcTokens),
    MAINNET_TOKEN: Array.from(new Set([...mainnetTokens])),
    ARBITRUM_TOKEN: Array.from(new Set([...arbitrumTokens])),
    OPTIMISM_TOKEN: Array.from(new Set([...optimismTokens])),
    ERA_TOKRN: []
  };

  // console.log(testToken);
}

export function calculateMainnetToken(
  chainId: number,
  L2token: string
) : string{
  switch (chainId) {
    case 421613:{
      if(testToken.ARBITRUM_TOKEN.indexOf(L2token) != -1){
        return testToken.MAINNET_TOKEN[testToken.ARBITRUM_TOKEN.indexOf(L2token)];
      }
    }
    case 420:{
      if(testToken.OPTIMISM_TOKEN.indexOf(L2token) != -1){
        return testToken.MAINNET_TOKEN[testToken.OPTIMISM_TOKEN.indexOf(L2token)];
      }
    }
    case 5:{
      return L2token;
    }
    default:
      return constants.AddressZero;
  }
}

export function chainIDgetTokenSequence(
  chainId: number,
  idx: number
){
  switch (chainId) {
    case 5:{
      if (idx < testToken.MAINNET_TOKEN.length) {
        return testToken.MAINNET_TOKEN[idx];
      } else {
        return ethers.constants.AddressZero;
      }
    }
    case 421613:{
      if (idx < testToken.ARBITRUM_TOKEN.length) {
        return testToken.ARBITRUM_TOKEN[idx];
      } else {
        return ethers.constants.AddressZero;
      }
    }
    case 420:{
      if (idx < testToken.OPTIMISM_TOKEN.length) {
        return testToken.OPTIMISM_TOKEN[idx];
      } else {
        return ethers.constants.AddressZero;
      }
    }
    default:
      return ethers.constants.AddressZero;
  }
}

export function chainIDgetToken(
  chainId: number,
  isNative: boolean,
  type?: string,
) {
  let mainnetToken = ethers.constants.AddressZero;
  let arbitrumToken = ethers.constants.AddressZero;
  let optimismToken = ethers.constants.AddressZero;
  let eraToken = ethers.constants.AddressZero;
  if(!isNative){
    mainnetToken = testToken.MAINNET_TOKEN.length > 0 ? lodash.sample(testToken.MAINNET_TOKEN.slice(1))! : ethers.Wallet.createRandom().address;
    arbitrumToken = testToken.ARBITRUM_TOKEN.length > 0 ? lodash.sample(testToken.ARBITRUM_TOKEN.slice(1))! : ethers.Wallet.createRandom().address;
    optimismToken = testToken.OPTIMISM_TOKEN.length > 0 ? lodash.sample(testToken.OPTIMISM_TOKEN.slice(1))! : ethers.Wallet.createRandom().address;
    eraToken = testToken.ERA_TOKRN.length > 0 ? lodash.sample(testToken.ERA_TOKRN.slice(1))! : ethers.Wallet.createRandom().address;
  
  }
  
  switch (chainId) {
    case 1:
      return mainnetToken;
    case 42161:
      return arbitrumToken;
    case 10:
      return optimismToken;
    case 5:{
      if(type == 'USDT'){
        const goerliUSDT = process.env['MAINNET_TEST_USDT'] != undefined ? process.env['MAINNET_TEST_USDT'] : ethers.constants.AddressZero
        return goerliUSDT
      } else if(type == 'USDC'){
        const goerliUSDC = process.env['MAINNET_TEST_USDC'] != undefined ? process.env['MAINNET_TEST_USDC'] : ethers.constants.AddressZero
        return goerliUSDC
      }else{
        return mainnetToken;
      }
    }
    case 420:{
      if(type == 'USDT'){
        const optimismUSDT = process.env['OPTIMISM_TEST_USDT'] != undefined ? process.env['OPTIMISM_TEST_USDT'] : ethers.constants.AddressZero
        return optimismUSDT
      } else if(type == 'USDC'){
        const optimismUSDC = process.env['OPTIMISM_TEST_USDC'] != undefined ? process.env['OPTIMISM_TEST_USDC'] : ethers.constants.AddressZero
        return optimismUSDC
      }else{
        return optimismToken;
      }
    }
    case 421613:{
      if(type == 'USDT'){
        const arbitrumUSDT = process.env['ARBITRUM_TEST_USDT'] != undefined ? process.env['ARBITRUM_TEST_USDT'] : ethers.constants.AddressZero
        return arbitrumUSDT
      } else if(type == 'USDC'){
        const arbitrumUSDC = process.env['ARBITRUM_TEST_USDC'] != undefined ? process.env['ARBITRUM_TEST_USDC'] : ethers.constants.AddressZero
        return arbitrumUSDC
      }else{
        return arbitrumToken;
      }
    }
    case 280:
      return eraToken;
    default:
      return ethers.Wallet.createRandom().address;
  }

}

function checkTokensChainInfo(token: string): string {
  // check if token in testToken.USDT_TOKEN
  if (testToken.USDT_TOKEN.includes(token)) {
    return 'USDT';
  }else if (testToken.UDSC_TOKEN.includes(token)) {
    return 'USDC';
  }else {
    return 'UNKNOWN';
  }
}

export function getRulesSetting(getNative: boolean)
{
  let chain0Id: keyof typeof chainNames = 0 as keyof typeof chainNames;
  let chain1Id: keyof typeof chainNames = 0 as keyof typeof chainNames;
  let chain0token: string;
  let chain1token: string;
  chain0Id = lodash.sample(chainIdsMock)! as keyof typeof chainNames;
  chain1Id = lodash.sample(chainIdsMock.filter((id) => id !== chain0Id))! as keyof typeof chainNames;

  if (chain0Id > chain1Id) {
    [chain0Id, chain1Id] = [chain1Id, chain0Id];
  }

  chain0token = chainIDgetToken(chain0Id, getNative);
  chain1token = chainIDgetToken(chain1Id, getNative, checkTokensChainInfo(chain0token));

  let randomStatus1 = Math.floor(Math.random() * 2);
  let randomStatus2 = Math.floor(Math.random() * 2);
  const chain0MinPrice = BigNumber.from(5).pow(parseInt(Math.random() * 18 + '')).add(BigNumber.from('50000000000000000'))
  const chain0MaxPrice = BigNumber.from(5).pow(parseInt(Math.random() * 19 + '')).add(BigNumber.from('70000000000000000'))
  const chain1MinPrice = BigNumber.from(5).pow(parseInt(Math.random() * 18 + '')).add(BigNumber.from('50000000000000000'))
  const chain1MaxPrice = BigNumber.from(5).pow(parseInt(Math.random() * 19 + '')).add(BigNumber.from('80000000000000000'))
  const chain0withholdingFee = BigNumber.from(5).pow(parseInt(Math.random() * 15 + '')).add(BigNumber.from('100000000000000'))
  const chain1withholdingFee = BigNumber.from(5).pow(parseInt(Math.random() * 15 + '')).add(BigNumber.from('100000000000000'))

  randomStatus1 = 1
  randomStatus2 = 1

  return { 
    chain0Id, 
    chain1Id , 
    chain0token, 
    chain1token,
    randomStatus1,
    randomStatus2,
    chain0MinPrice,
    chain0MaxPrice,
    chain1MinPrice,
    chain1MaxPrice,
    chain0withholdingFee,
    chain1withholdingFee
  };
}

export async function verifyContract(address: string, args: any[]) {
  if ((await ethers.provider.getNetwork()).chainId != 31337) {
    try {
      return await hre.run("verify:verify", {
        address: address,
        constructorArguments: args,
      });
    } catch (e) {
      console.log(address, args, e);
    }
  } 
}

export async function printCurrentTime() {
  const currentTime = await getCurrentTime();
  console.log('Current timestamp:', currentTime);
}

export async function getCurrentTime() {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
}

export async function mineXMinutes(time: number) {
  const currentTime = await getCurrentTime();
  await ethers.provider.send("evm_increaseTime", [currentTime]);
  await ethers.provider.send("evm_mine", [currentTime+(time*60)]);
  console.log(
    `mine ${time} minutes, current time: ${await getCurrentTime()}`
  )
}




