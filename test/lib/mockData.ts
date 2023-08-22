import hre, { ethers } from 'hardhat';
import { BridgeLib } from '../../typechain-types/contracts/ORManager';
import { BigNumber, constants } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TestToken, TestToken__factory } from '../../typechain-types';
import lodash, { chain } from 'lodash';

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

export const dealersMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(0, 2).map(signer => signer.address);
};

// return signers
export const dealersSignersMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(0, 2);
};

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
  const chain0MinPrice = BigNumber.from(5).pow(parseInt(Math.random() * 18 + '')).add(BigNumber.from('50000000000000000'))
  const chain0MaxPrice = BigNumber.from(5).pow(parseInt(Math.random() * 19 + '')).add(BigNumber.from('70000000000000000'))
  const chain1MinPrice = BigNumber.from(5).pow(parseInt(Math.random() * 18 + '')).add(BigNumber.from('50000000000000000'))
  const chain1MaxPrice = BigNumber.from(5).pow(parseInt(Math.random() * 19 + '')).add(BigNumber.from('80000000000000000'))
  const chain0withholdingFee = BigNumber.from(5).pow(parseInt(Math.random() * 15 + '')).add(BigNumber.from('100000000000000'))
  const chain1withholdingFee = BigNumber.from(5).pow(parseInt(Math.random() * 15 + '')).add(BigNumber.from('100000000000000'))
  // console.log(
  //   `chain0MinPrice: ${chain0MinPrice}, chain0MaxPrice: ${chain0MaxPrice}, chain1MinPrice: ${chain1MinPrice}, chain1MaxPrice: ${chain1MaxPrice}, chain0withholdingFee: ${chain0withholdingFee}, chain1withholdingFee: ${chain1withholdingFee}`
  // )

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




