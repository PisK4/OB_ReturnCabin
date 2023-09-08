import hre, { ethers } from 'hardhat';
import { BridgeLib } from '../../typechain-types/contracts/ORManager';
import { BigNumber, Bytes, constants, utils } from 'ethers';
import lodash from 'lodash';

export const chainNames = {
  5: 'goerli',
  420: 'optimisim goerli',
  421613: 'arbitrum goerli',
  280: 'zk-sync Era Testnet',
};

// mark the chain id that if we don't want to test
export const chainIdsMock = [
  // 1,
  // 42161,
  // 10,
  // 324,
  5, // goerli
  420, // optimisim goerli testnet
  421613, // arbitrum goerli testnet
  // 280,    // zk-sync Era testnet
];

export const chainIdsMockMainnetToken = [
  // 1,
  // 42161,
  // 10,
  // 324,
  '0x0000000000000000000000000000000000000000', // goerli
  '0x0000000000000000000000000000000000000000', // optimisim goerli testnet
  '0x0000000000000000000000000000000000000000', // arbitrum goerli testnet
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
  chainId: BigNumber;
  token: string;
  user: string;
}

interface SMTValue {
  token: string;
  chainId: BigNumber;
  amount: BigNumber;
  debt: BigNumber;
}

interface MergeValueSingle {
  value1: number;
  value2: Bytes;
  value3: Bytes;
}

export interface MergeValue {
  mergeType: number;
  mergeValue: MergeValueSingle;
}

// export interface SMTProof {
//   proofs: string[][];
//   siblings: string[];
//   smtLeaves: SMTLeaf[];
// }

/************************ Mock Data ***************************/

export const dealersMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(0, 2).map((signer) => signer.address);
};

export const submitterMock = async () => {
  const signers = await ethers.getSigners();
  return signers[0].address;
};

export const dealersSignersMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(0, 2);
};

export const spvMock = async () => {
  const signers = await ethers.getSigners();
  return signers.slice(5, 7).map((signer) => signer.address);
};

export const ebcMock = '0x9E6D2B0b3AdB391AB62146c1B14a94e8D840Ff82';

export const stateTransTreeRootMock = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('stateTransTreeRoot'),
);

export const SubmitInfoMock = async (): Promise<SubmitInfo> => {
  const submitInfo: SubmitInfo = {
    stratBlock: 0,
    endBlock: 2,
    profitRoot: profitRootMock,
    stateTransTreeRoot: stateTransTreeRootMock,
  };
  return submitInfo;
};

export const proofsMock: string[][] = [
  [ethers.utils.keccak256(ethers.utils.toUtf8Bytes('proofs'))],
];

export const mockKey: SMTKey = {
  chainId: BigNumber.from(5),
  token: '0xa0321efeb50c46c17a7d72a52024eea7221b215a',
  user: '0x15962f38e6998875F9F75acDF8c6Ddc743F11041',
};

export const mockValue: SMTValue = {
  token: '0xa0321efeb50c46c17a7d72a52024eea7221b215a',
  chainId: BigNumber.from(5),
  amount: BigNumber.from(200),
  debt: BigNumber.from(0),
};

export const smtLeavesMock: SMTLeaf = {
  key: {
    chainId: mockKey.chainId,
    token: mockKey.token,
    user: mockKey.user,
  },
  value: {
    token: mockValue.token,
    chainId: mockValue.chainId,
    amount: mockValue.amount,
    debt: mockValue.debt,
  },
};

export const profitRootMock =
  '0xfbfcd98ac0c411b5d62d56e8d37e1f79dde7de67fa17bdbb12a5f942703ac7ff';

export const bitmapMock: Bytes[] = [
  '0x00000000000000000000000000000000000000000000000000000000000003ff' as unknown as Bytes,
];

export const zeroBitsMock: Bytes[] = [
  '0x0bb3696cdbd7208860e9d53efd6c0f72a10597148be66b509d7659ff07f06c00' as unknown as Bytes,
];

export const mergeValueMock: MergeValue[] = [
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0xd01d78e416f465601c781101318c55fb5e152f67cb577466214699a56efd601a' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 1,
    mergeValue: {
      value1: 247,
      value2:
        '0xb689a06a09b91a18de59fadc7cca5c7184c53ae1a66f387b779c8667bb5d2a7b' as unknown as Bytes,
      value3:
        '0xfe3cc51e7d9c295e18aaf17f3797a513975dea955dd36d153693b3218e111000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0x3e5e9bfbc87aa4266c0715dc94594e0330b2833738290c209471050738a543c1' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0x7b3ad91d21a584cfaafda5c04c849f1fada93ccfa156a8d0720c301c49140292' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0xd11b18c99f447881b09f71a0e58a6fb7d82922016edc1db9fbc27aa98543d997' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0xbc7c4f1f03f4fdaa1262aa59848242fe4c51c3212c2ce2d1af763f520c668e49' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0x1414e7a1cedd79f29a1097e284e59782d05dd15fa82e32564d6f6cd3e367d7b1' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0x937cdb71a7a8ca9e6317423c8af41147f7112fc6e5a20b3e758aa928c9729712' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0x30659a1e41f23a9dcda6335bd66455707532d15b5f00b1f7e77d69635e63c8f5' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
  {
    mergeType: 0,
    mergeValue: {
      value1: 0,
      value2:
        '0xc1a7860320fdfaded0b6d9081e7379b32004b5c6094dd658d49391663808ea60' as unknown as Bytes,
      value3:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as unknown as Bytes,
    },
  },
];

export const siblingHashesMock: string[] = [
  '0xfeb88050122b8b29452c711954d89cfb08c41b4bb59ff23e64550ff690de1d38',
  '0x7f7ad78356188e55a8008aa31a869fa52cffd6d16080808429597269006c5b61',
  '0xc6659fbbf925aeb2bf68f766ddca17bd264df89ce7fcd9c1841e7a3c04acd068',
  '0x487c7ae678a58e61950a0f559db410a748858b175286ada094715001e7364f76',
  '0x93991f18c409de8bcf12697d43a9d149cafc6de185b4c8bda444b43ff6faaada',
  '0x3b9de1657cf100425edd73d8c0950e1f795883ccfece78386b60fd00fd19f60c',
  '0xca0ec6f9f2fb43ea397fe655ad8b4b96a64ca55ea6fd43264421e0c23a49aae6',
  '0xa667ee71eed6f7007a72307ab7b6b210a7894f8116de4ba0bcdb85f4a5abe7f7',
  '0x6942ad62f3b333d9ed3814135bc7360301e21b6c403900a31122f4722fdf18ad',
  '0xfbfcd98ac0c411b5d62d56e8d37e1f79dde7de67fa17bdbb12a5f942703ac7ff',
];
// export const mockKey: SMTKey = {
//   chainId: BigNumber.from(100),
//   token: '0x0000000000000000000000000000000000000021',
//   user: '0x0000000000000000000000000000000000000022',
// };

// export const mockValue: SMTValue = {
//   token: '0x0000000000000000000000000000000000000021',
//   chainId: BigNumber.from(100),
//   amount: BigNumber.from(100),
//   debt: BigNumber.from(80),
// };

// export const profitRootMock =
//   '0x7079a474f9bec927bf070f5e1b9b21da95facd7bdbd43d52c2505b26473b5de3';

// export const bitmapMock: string[] = [
//   '0x0000000000000000000000000000000000000000000000000000000000000007',
// ];

// export const mergeValueMock: MergeValue[] = [
//   {
//     mergeType: 1,
//     mergeValue: {
//       value1: 253,
//       value2:
//         '0xa4366628111703a3b0bb5cec1fceab50f570e0dd51d56dd6eb7a2a54bab3849b' as unknown as Bytes,
//       value3:
//         '0x1fd30ea2d276c20bec69f8ea60934f416cf0fed1dd41d1bf14bce37dbea5ab60' as unknown as Bytes,
//     },
//   },
//   {
//     mergeType: 1,
//     mergeValue: {
//       value1: 254,
//       value2:
//         '0x2a05c298a79e5e065d6ed28d4e3740bbd6ecee14cd6321be5d5039ed2db785ba' as unknown as Bytes,
//       value3:
//         '0xda95503be5e50362f74ec227db12634ff5ddb055409910557ec6d12735b410b4' as unknown as Bytes,
//     },
//   },
//   {
//     mergeType: 1,
//     mergeValue: {
//       value1: 255,
//       value2:
//         '0x086f5ccd56d9fe6db616a7420c05d3192c2374f6d0405f6d463464a6aca7952f' as unknown as Bytes,
//       value3:
//         '0x6436bc10c965a82e3ced8b386e05b84c8a3d7193701a4019a46237abd5d31afa' as unknown as Bytes,
//     },
//   },
// ];

/************************ Mock Data ************************** */

export const defaultChainInfoArray: BridgeLib.ChainInfoStruct[] =
  chainIdsMock.map((chainId) => {
    return {
      id: BigNumber.from(chainId),
      batchLimit: BigNumber.from(1000),
      minVerifyChallengeSourceTxSecond: BigNumber.from(100),
      maxVerifyChallengeSourceTxSecond: BigNumber.from(200),
      minVerifyChallengeDestTxSecond: BigNumber.from(100),
      maxVerifyChallengeDestTxSecond: BigNumber.from(200),
      nativeToken: BigNumber.from(
        chainIdsMockMainnetToken[chainIdsMock.indexOf(chainId)],
      ),
      spvs: [constants.AddressZero],
    };
  });

export function getRandomPadding() {
  return Math.floor(Math.random() * 500) + 1;
}

export let testToken = {
  USDT_TOKEN: [] as string[],
  UDSC_TOKEN: [] as string[],
  DAI_TOKEN: [] as string[],
  MAINNET_TOKEN: [] as string[],
  ARBITRUM_TOKEN: [] as string[],
  OPTIMISM_TOKEN: [] as string[],
  ERA_TOKRN: [] as string[],
};

export function initTestToken() {
  const usdtTokens = new Set<string>();
  const usdcTokens = new Set<string>();
  const daiTokens = new Set<string>();
  const mainnetTokens = new Set<string>();
  const arbitrumTokens = new Set<string>();
  const optimismTokens = new Set<string>();
  const eraTokens = new Set<string>();

  if (process.env['MAINNET_NATIVE_TOKEN'] != undefined) {
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
    process.env['MAINNET_TEST_USDT'].split(',').forEach((token) => {
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

  if (process.env['MAINNET_TEST_DAI'] != undefined) {
    process.env['MAINNET_TEST_DAI'].split(',').forEach((token) => {
      daiTokens.add(token);
    });
    process.env['MAINNET_TEST_DAI'].split(',').forEach((token) => {
      mainnetTokens.add(token);
    });
  }

  if (process.env['ARBITRUM_TEST_DAI'] != undefined) {
    process.env['ARBITRUM_TEST_DAI'].split(',').forEach((token) => {
      daiTokens.add(token);
    });
    process.env['ARBITRUM_TEST_DAI'].split(',').forEach((token) => {
      arbitrumTokens.add(token);
    });
  }

  if (process.env['OPTIMISM_TEST_DAI'] != undefined) {
    process.env['OPTIMISM_TEST_DAI'].split(',').forEach((token) => {
      daiTokens.add(token);
    });
    process.env['OPTIMISM_TEST_DAI'].split(',').forEach((token) => {
      optimismTokens.add(token);
    });
  }

  testToken = {
    USDT_TOKEN: Array.from(usdtTokens),
    UDSC_TOKEN: Array.from(usdcTokens),
    DAI_TOKEN: Array.from(daiTokens),
    MAINNET_TOKEN: Array.from(new Set([...mainnetTokens])),
    ARBITRUM_TOKEN: Array.from(new Set([...arbitrumTokens])),
    OPTIMISM_TOKEN: Array.from(new Set([...optimismTokens])),
    ERA_TOKRN: [],
  };

  // console.log(testToken);
}

export function calculateMainnetToken(
  chainId: number,
  L2token: string,
): string {
  switch (chainId) {
    case 421613: {
      if (testToken.ARBITRUM_TOKEN.indexOf(L2token) != -1) {
        return testToken.MAINNET_TOKEN[
          testToken.ARBITRUM_TOKEN.indexOf(L2token)
        ];
      }
    }
    case 420: {
      if (testToken.OPTIMISM_TOKEN.indexOf(L2token) != -1) {
        return testToken.MAINNET_TOKEN[
          testToken.OPTIMISM_TOKEN.indexOf(L2token)
        ];
      }
    }
    case 5: {
      return L2token;
    }
    default:
      return constants.AddressZero;
  }
}

export function chainIDgetTokenSequence(chainId: number, idx: number) {
  switch (chainId) {
    case 5: {
      if (idx < testToken.MAINNET_TOKEN.length) {
        return testToken.MAINNET_TOKEN[idx];
      } else {
        return ethers.constants.AddressZero;
      }
    }
    case 421613: {
      if (idx < testToken.ARBITRUM_TOKEN.length) {
        return testToken.ARBITRUM_TOKEN[idx];
      } else {
        return ethers.constants.AddressZero;
      }
    }
    case 420: {
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
  if (!isNative) {
    mainnetToken =
      testToken.MAINNET_TOKEN.length > 0
        ? lodash.sample(testToken.MAINNET_TOKEN.slice(1))!
        : ethers.Wallet.createRandom().address;
    arbitrumToken =
      testToken.ARBITRUM_TOKEN.length > 0
        ? lodash.sample(testToken.ARBITRUM_TOKEN.slice(1))!
        : ethers.Wallet.createRandom().address;
    optimismToken =
      testToken.OPTIMISM_TOKEN.length > 0
        ? lodash.sample(testToken.OPTIMISM_TOKEN.slice(1))!
        : ethers.Wallet.createRandom().address;
    eraToken =
      testToken.ERA_TOKRN.length > 0
        ? lodash.sample(testToken.ERA_TOKRN.slice(1))!
        : ethers.Wallet.createRandom().address;
  }

  switch (chainId) {
    case 1:
      return mainnetToken;
    case 42161:
      return arbitrumToken;
    case 10:
      return optimismToken;
    case 5: {
      if (type == 'USDT') {
        const goerliUSDT =
          process.env['MAINNET_TEST_USDT'] != undefined
            ? process.env['MAINNET_TEST_USDT']
            : ethers.constants.AddressZero;
        return goerliUSDT;
      } else if (type == 'USDC') {
        const goerliUSDC =
          process.env['MAINNET_TEST_USDC'] != undefined
            ? process.env['MAINNET_TEST_USDC']
            : ethers.constants.AddressZero;
        return goerliUSDC;
      } else if (type == 'DAI') {
        const goerliDAI =
          process.env['MAINNET_TEST_DAI'] != undefined
            ? process.env['MAINNET_TEST_DAI']
            : ethers.constants.AddressZero;
        return goerliDAI;
      } else {
        return mainnetToken;
      }
    }
    case 420: {
      if (type == 'USDT') {
        const optimismUSDT =
          process.env['OPTIMISM_TEST_USDT'] != undefined
            ? process.env['OPTIMISM_TEST_USDT']
            : ethers.constants.AddressZero;
        return optimismUSDT;
      } else if (type == 'USDC') {
        const optimismUSDC =
          process.env['OPTIMISM_TEST_USDC'] != undefined
            ? process.env['OPTIMISM_TEST_USDC']
            : ethers.constants.AddressZero;
        return optimismUSDC;
      } else if (type == 'DAI') {
        const optimismDAI =
          process.env['OPTIMISM_TEST_DAI'] != undefined
            ? process.env['OPTIMISM_TEST_DAI']
            : ethers.constants.AddressZero;
        return optimismDAI;
      } else {
        return optimismToken;
      }
    }
    case 421613: {
      if (type == 'USDT') {
        const arbitrumUSDT =
          process.env['ARBITRUM_TEST_USDT'] != undefined
            ? process.env['ARBITRUM_TEST_USDT']
            : ethers.constants.AddressZero;
        return arbitrumUSDT;
      } else if (type == 'USDC') {
        const arbitrumUSDC =
          process.env['ARBITRUM_TEST_USDC'] != undefined
            ? process.env['ARBITRUM_TEST_USDC']
            : ethers.constants.AddressZero;
        return arbitrumUSDC;
      } else if (type == 'DAI') {
        const arbitrumDAI =
          process.env['ARBITRUM_TEST_DAI'] != undefined
            ? process.env['ARBITRUM_TEST_DAI']
            : ethers.constants.AddressZero;
        return arbitrumDAI;
      } else {
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
  } else if (testToken.UDSC_TOKEN.includes(token)) {
    return 'USDC';
  } else if (testToken.DAI_TOKEN.includes(token)) {
    return 'DAI';
  } else {
    return 'UNKNOWN';
  }
}

export function getRulesSetting(getNative: boolean) {
  let chain0Id: keyof typeof chainNames = 0 as keyof typeof chainNames;
  let chain1Id: keyof typeof chainNames = 0 as keyof typeof chainNames;
  let chain0token: string;
  let chain1token: string;
  chain0Id = lodash.sample(chainIdsMock)! as keyof typeof chainNames;
  chain1Id = lodash.sample(
    chainIdsMock.filter((id) => id !== chain0Id),
  )! as keyof typeof chainNames;

  if (chain0Id > chain1Id) {
    [chain0Id, chain1Id] = [chain1Id, chain0Id];
  }

  chain0token = chainIDgetToken(chain0Id, getNative);
  chain1token = chainIDgetToken(
    chain1Id,
    getNative,
    checkTokensChainInfo(chain0token),
  );

  let randomStatus1 = Math.floor(Math.random() * 2);
  let randomStatus2 = Math.floor(Math.random() * 2);
  let paddingString = '0';
  if (checkTokensChainInfo(chain0token) != 'DAI') {
    paddingString = '0000000000';
  }
  let chain0MinPrice = BigNumber.from(5)
    .pow(parseInt(Math.random() * 6 + ''))
    .add(BigNumber.from('50000' + paddingString));
  let chain0MaxPrice = BigNumber.from(5)
    .pow(parseInt(Math.random() * 9 + ''))
    .add(BigNumber.from('70000' + paddingString));
  let chain1MinPrice = BigNumber.from(5)
    .pow(parseInt(Math.random() * 6 + ''))
    .add(BigNumber.from('50000' + paddingString));
  let chain1MaxPrice = BigNumber.from(5)
    .pow(parseInt(Math.random() * 9 + ''))
    .add(BigNumber.from('80000' + paddingString));
  const chain0withholdingFee = BigNumber.from(560000).add(
    BigNumber.from('10000' + paddingString),
  );
  const chain1withholdingFee = BigNumber.from(780000).add(
    BigNumber.from('10000' + paddingString),
  );

  if (chain0MinPrice > chain0MaxPrice) {
    [chain0MinPrice, chain0MaxPrice] = [chain0MaxPrice, chain0MinPrice];
  }
  if (chain1MinPrice > chain1MaxPrice) {
    [chain1MinPrice, chain1MaxPrice] = [chain1MaxPrice, chain1MinPrice];
  }

  randomStatus1 = 1;
  randomStatus2 = 1;

  return {
    chain0Id,
    chain1Id,
    chain0token,
    chain1token,
    randomStatus1,
    randomStatus2,
    chain0MinPrice,
    chain0MaxPrice,
    chain1MinPrice,
    chain1MaxPrice,
    chain0withholdingFee,
    chain1withholdingFee,
  };
}

export async function verifyContract(address: string, args: any[]) {
  if ((await ethers.provider.getNetwork()).chainId != 31337) {
    try {
      return await hre.run('verify:verify', {
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

export async function mineXMinutes(minutes: number) {
  const seconds = minutes * 60;
  const currentTime = await getCurrentTime();
  await ethers.provider.send('evm_increaseTime', [currentTime]);
  await ethers.provider.send('evm_mine', [currentTime + seconds]);
  console.log(
    `mine ${minutes} minutes, current time: ${await getCurrentTime()}`,
  );
}

export function callDataCost(data: string): number {
  return ethers.utils
    .arrayify(data)
    .map((x) => (x === 0 ? 4 : 16))
    .reduce((sum, x) => sum + x);
}

export function bytesToNumber(bytes: Bytes): number {
  const hexString = utils.hexlify(bytes);
  return parseInt(hexString.slice(2), 16);
}
