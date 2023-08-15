import { ethers } from 'hardhat';
import { BridgeLib } from '../../typechain-types/contracts/ORManager';
import { BigNumber, constants } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TestToken, TestToken__factory } from '../../typechain-types';
import lodash, { chain } from 'lodash';
import { Test } from 'mocha';

// export const ETHMockToken = [
//   // chain id 1
//   // ethers.utils.getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'), // usdt
//   // ethers.utils.getAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'), // dai
//   ethers.utils.getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), // usdc
// ];

// export const ARBMockToken = [
//   // chain id 42161
//   // ethers.utils.getAddress('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'), // usdt
//   ethers.utils.getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'), // usdc
//   // ethers.utils.gvetAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'), // dai
// ];

// export const OPMockToken = [
//   // chain id 10
//   // ethers.utils.getAddress('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'), // usdt
//   ethers.utils.getAddress('0x7F5c764cBc14f9669B88837ca1490cCa17c31607'), // usdc
//   // ethers.utils.getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'), // dai
// ];

// export const ERAMockToken = [
//   // chain id 324
//   // ethers.utils.getAddress('0x000000000000000000000000000000000000800A'), //ETH
//   ethers.utils.getAddress('0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'), //usdc
// ];

// export const USDTMockToken = [
//   ethers.utils.getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'), // usdt
//   ethers.utils.getAddress('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'), // usdt
//   ethers.utils.getAddress('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'), // usdt
// ];

// export const USDCMockToken = [
//   ethers.utils.getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), // usdc
//   ethers.utils.getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'), // usdc
//   ethers.utils.getAddress('0x7F5c764cBc14f9669B88837ca1490cCa17c31607'), // usdc
//   ethers.utils.getAddress('0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'), // usdc
// ];

// export const DAIMockToken = [
//   ethers.utils.getAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'), // dai
//   ethers.utils.getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'), // dai
// ];

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

export const dealersMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(2, 6).map(signer => signer.address);
};

export const defaultChainInfoArray: BridgeLib.ChainInfoStruct[] = chainIdsMock.map((chainId) => {
  return {
    id: BigNumber.from(chainId),
    batchLimit: BigNumber.from(1000),
    minVerifyChallengeSourceTxSecond: BigNumber.from(100),
    maxVerifyChallengeSourceTxSecond: BigNumber.from(200),
    minVerifyChallengeDestTxSecond: BigNumber.from(100),
    maxVerifyChallengeDestTxSecond: BigNumber.from(200),
    spvs: [constants.AddressZero],
  };
});

export function getRandomPadding() {
  return Math.floor(Math.random() * 500) + 1;
}

// export async function deployBridgeToken() {
//   let signers: SignerWithAddress[];
//   let mdcOwner: SignerWithAddress;
//   let mainnetTestToken: TestToken;
//   let arbitrumTestToken: TestToken;
//   let optimisimTestToken: TestToken;
//   let eraTestToken: TestToken;
//   signers = await ethers.getSigners();
//   mdcOwner = signers[0];

//   // Connect to Arbitrum Goerli network
//   const arbitrumGoerliProvider = new ethers.providers.JsonRpcProvider(
//     process.env.ARBITRUM_GOERLI_RPC!
//   );

//   const arbitrumGoerliSigner = ethers.Wallet.fromMnemonic(process.env.MNEMONIC!).connect(arbitrumGoerliProvider);

//   // Connect to Optimism Goerli network
//   const optimismGoerliProvider = new ethers.providers.JsonRpcProvider(
//     process.env.OPTIMISM_GOERLI_RPC!
//   );

//   const optimismGoerliSigner = ethers.Wallet.fromMnemonic(process.env.MNEMONIC!).connect(optimismGoerliProvider);

//   // Connect to zk-sync Era testnet
//   const eraTestnetProvider = new ethers.providers.JsonRpcProvider(
//     process.env.ZKSYNC_ERA_TESTNET_RPC!
//   );

//   const eraTestnetSigner = ethers.Wallet.fromMnemonic(process.env.MNEMONIC!).connect(eraTestnetProvider);

//   const TestToken = await ethers.getContractFactory('TestToken');

//   if ((await ethers.provider.getNetwork()).chainId === 31337) {
//     arbitrumTestToken = await TestToken.connect(signers[0]).deploy();
//     optimisimTestToken = await TestToken.connect(signers[0]).deploy();
//     eraTestToken = await TestToken.connect(signers[0]).deploy();
//   } else {
//     arbitrumTestToken = await TestToken.connect(arbitrumGoerliSigner).deploy();
//     optimisimTestToken = await TestToken.connect(optimismGoerliSigner).deploy();
//     eraTestToken = await TestToken.connect(eraTestnetSigner).deploy();
//   }
//   mainnetTestToken = await new TestToken__factory(mdcOwner).deploy();
//   process.env['MAINNET_TEST_TOKEN'] = mainnetTestToken.address;
//   process.env['ARBITRUM_TEST_TOKEN'] = arbitrumTestToken.address;
//   process.env['OPTIMISM_TEST_TOKEN'] = optimisimTestToken.address;
//   process.env['ERA_TEST_TOKEN'] = eraTestToken.address;
  
// }

export const testToken = {
  USDT_TOKEN: [] as string[],
  UDSC_TOKEN: [] as string[],
  MAINNET_TOKEN: [] as string[],
  ARBITRUM_TOKEN: [] as string[],
  OPTIMISM_TOKEN: [] as string[],
  ERA_TOKRN: [] as string[]
};

export function initTestToken(){
  if (process.env['MAINNET_TEST_USDT'] != undefined) {
    testToken.USDT_TOKEN.push(...process.env['MAINNET_TEST_USDT'].split(','));
    testToken.MAINNET_TOKEN.push(...process.env['MAINNET_TEST_USDT'].split(','));
  }
  if (process.env['ARBITRUM_TEST_USDT'] != undefined) {
    testToken.USDT_TOKEN.push(...process.env['ARBITRUM_TEST_USDT'].split(','));
    testToken.ARBITRUM_TOKEN.push(...process.env['ARBITRUM_TEST_USDT'].split(','));
  }
  if (process.env['OPTIMISM_TEST_USDT'] != undefined) {
    testToken.USDT_TOKEN.push(...process.env['OPTIMISM_TEST_USDT'].split(','));
    testToken.OPTIMISM_TOKEN.push(...process.env['OPTIMISM_TEST_USDT'].split(','));
  }
  
  if (process.env['MAINNET_TEST_USDC'] != undefined) {
    testToken.UDSC_TOKEN.push(...process.env['MAINNET_TEST_USDC'].split(','));
    testToken.MAINNET_TOKEN.push(...process.env['MAINNET_TEST_USDC'].split(','));
  }
  if (process.env['ARBITRUM_TEST_USDC'] != undefined) {
    testToken.UDSC_TOKEN.push(...process.env['ARBITRUM_TEST_USDC'].split(','));
    testToken.ARBITRUM_TOKEN.push(...process.env['ARBITRUM_TEST_USDC'].split(','));
  }
  if (process.env['OPTIMISM_TEST_USDC'] != undefined) {
    testToken.UDSC_TOKEN.push(...process.env['OPTIMISM_TEST_USDC'].split(','));
    testToken.OPTIMISM_TOKEN.push(...process.env['OPTIMISM_TEST_USDC'].split(','));
  }
  
  console.log(testToken);
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
  type?: string
  ) {
  const mainnetToken = testToken.MAINNET_TOKEN.length > 0 ? lodash.sample(testToken.MAINNET_TOKEN)! : ethers.Wallet.createRandom().address;
  const arbitrumToken = testToken.ARBITRUM_TOKEN.length > 0 ? lodash.sample(testToken.ARBITRUM_TOKEN)! : ethers.Wallet.createRandom().address;
  const optimismToken = testToken.OPTIMISM_TOKEN.length > 0 ? lodash.sample(testToken.OPTIMISM_TOKEN)! : ethers.Wallet.createRandom().address;
  const eraToken = testToken.ERA_TOKRN.length > 0 ? lodash.sample(testToken.ERA_TOKRN)! : ethers.Wallet.createRandom().address;
  
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

export function getRulesSetting()
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

  chain0token = chainIDgetToken(chain0Id);
  chain1token = chainIDgetToken(chain1Id, checkTokensChainInfo(chain0token));

  const randomStatus1 = Math.floor(Math.random() * 2);
  const randomStatus2 = Math.floor(Math.random() * 2);

  return { 
    chain0Id, 
    chain1Id , 
    chain0token, 
    chain1token,
    randomStatus1,
    randomStatus2
  };
}


