import { Provider } from '@ethersproject/providers';
import { BigNumber, BigNumberish, BytesLike, Wallet, utils } from 'ethers';
import { Hexable } from 'ethers/lib/utils';
import { BaseTrie } from 'merkle-patricia-tree';
import { ethers } from 'hardhat';
import Pako from 'pako';
import lodash from 'lodash';
import { hexToBuffer } from '../utils.test';

// Mock some dealer address
export const dealersMock = [
  '0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678',
  '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
  '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
  '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
  '0x617F2E2fD72FD9D5503197092aC168c91465E7f2',
  '0x17F6AD8Ef982297579C203069C1DbfFE4348c372',
  '0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678',
  '0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7',
  '0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C',
  '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
  '0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC',
  '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c',
  '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C',
  '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB',
  '0x583031D1113aD414F02576BD6afaBfb302140225',
  '0xdD870fA1b7C4700F2BD7f44238821C26f7392148',
  '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC',
  '0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9',
];

export const chainIdsMock = [1, 42161, 10, 324];

export const ETHMockToken = [
  // chain id 1
  ethers.utils.getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'), // usdt
  ethers.utils.getAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'), // dai
  ethers.utils.getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), // usdc
];

export const ARBMockToken = [
  // chain id 42161
  ethers.utils.getAddress('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'), // usdt
  ethers.utils.getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'), // usdc
  ethers.utils.getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'), // dai
];

export const OPMockToken = [
  // chain id 10
  ethers.utils.getAddress('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'), // usdt
  ethers.utils.getAddress('0x7F5c764cBc14f9669B88837ca1490cCa17c31607'), // usdc
  ethers.utils.getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'), // dai
];

export const ERAMockToken = [
  // chain id 324
  ethers.utils.getAddress('0x000000000000000000000000000000000000800A'), //ETH
  ethers.utils.getAddress('0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'), //usdc
];

export const USDTMockToken = [
  ethers.utils.getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'), // usdt
  ethers.utils.getAddress('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'), // usdt
  ethers.utils.getAddress('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'), // usdt
];

export const USDCMockToken = [
  ethers.utils.getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), // usdc
  ethers.utils.getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'), // usdc
  ethers.utils.getAddress('0x7F5c764cBc14f9669B88837ca1490cCa17c31607'), // usdc
  ethers.utils.getAddress('0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'), // usdc
];

export const DAIMockToken = [
  ethers.utils.getAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'), // dai
  ethers.utils.getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'), // dai
];

export const ruleTypes = [
  'uint64', // chain0's id
  'uint64', // chain1's id
  'uint8', // chain0's status
  'uint8', // chain1's status
  'uint', // chain0's token
  'uint', // chain1's token
  'uint128', // chain0's minPrice
  'uint128', // chain1's minPrice
  'uint128', // chain0's maxPrice
  'uint128', // chain1's maxPrice
  'uint128', // chain0's withholdingFee
  'uint128', // chain1's withholdingFee
  'uint16', // chain0's tradeFee. 10,000 percent
  'uint16', // chain1's tradeFee
  'uint32', // chain0's response time
  'uint32', // chain1's response time
  'uint32', // chain0's compensation ratio
  'uint32', // chain1's compensation ratio
  'uint64', // enable timestamp
];

export function createRandomRule() {
  const chain0Id = lodash.sample(chainIdsMock);
  const chain1Id = lodash.sample(chainIdsMock.filter((id) => id !== chain0Id));
  let chain0Token = ethers.utils.getAddress(
    '0x000000000000000000000000000000000000800A',
  );
  let chain1Token = ethers.utils.getAddress(
    '0x000000000000000000000000000000000000800A',
  );

  if (chain0Id == 1) {
    chain0Token = ethers.utils.getAddress(lodash.sample(ETHMockToken)!);
  }
  if (chain0Id == 42161) {
    chain0Token = lodash.sample(ARBMockToken)!;
  }
  if (chain0Id == 10) {
    chain0Token = lodash.sample(OPMockToken)!;
  }
  if (chain0Id == 324) {
    chain0Token = lodash.sample(ERAMockToken)!;
  }

  if (lodash.includes(USDTMockToken, chain0Token)) {
    chain1Token = ethers.utils.getAddress(USDTMockToken[0]);
  } else if (lodash.includes(USDCMockToken, chain0Token)) {
    chain1Token = ethers.utils.getAddress(USDCMockToken[0]);
  } else if (lodash.includes(DAIMockToken, chain0Token)) {
    chain1Token = ethers.utils.getAddress(DAIMockToken[0]);
  } else {
    if (chain1Id == 1) {
      chain1Token = ethers.utils.getAddress(lodash.sample(ETHMockToken)!);
    }
    if (chain1Id == 42161) {
      chain1Token = lodash.sample(ARBMockToken)!;
    }
    if (chain1Id == 10) {
      chain1Token = lodash.sample(OPMockToken)!;
    }
    if (chain1Id == 324) {
      chain1Token = lodash.sample(ERAMockToken)!;
    }
  }

  return [
    BigNumber.from(chain0Id),
    BigNumber.from(chain1Id),
    0,
    1,
    chain0Token,
    chain1Token,
    BigNumber.from(5).pow(parseInt(Math.random() * 20 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 22 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 15 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 17 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 30 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 31 + '') + 1),
    1,
    2,
    (2 ^ 32) - 1,
    (2 ^ 31) - 1,
    (2 ^ 30) - 1,
    (2 ^ 29) - 1,
    0,
  ];
}

export function calculateRuleKey(rule: BigNumberish[]) {
  return utils.keccak256(
    utils.solidityPack(
      ['uint16', 'uint16', 'uint', 'uint'],
      rule.slice(0, 2).concat(rule.slice(4, 6)),
    ),
  );
}

export async function getRulesRootUpdatedLogs(
  provider: Provider | undefined,
  mdc: string,
  implementation: string,
) {
  const logs = await provider?.getLogs({
    address: mdc,
    topics: [
      utils.id('RulesRootUpdated(address,address,(bytes32,uint32))'),
      utils.hexZeroPad(implementation.toLowerCase(), 32),
    ],
    fromBlock: 0,
    toBlock: 'latest',
  });

  const updateActions: {
    transactionHash: string;
    ebc: string;
    root: string;
    version: number;
  }[] = [];
  for (const log of logs || []) {
    const [ebc, [root, version]] = utils.defaultAbiCoder.decode(
      ['address', 'tuple(bytes32,uint32)'],
      log.data,
    );
    updateActions.push({
      transactionHash: log.transactionHash,
      ebc,
      root,
      version,
    });
  }
  updateActions.sort((a, b) => a.version - b.version);

  const rules: BigNumberish[][] = [];
  for (const item of updateActions) {
    const transaction = await provider?.getTransaction(item.transactionHash);
    if (!transaction) continue;

    const [_, _rules] = utils.defaultAbiCoder.decode(
      [
        'address',
        `tuple(${ruleTypes.join(',')})[]`,
        'tuple(bytes32,uint32)',
        'uint16[]',
        'uint[]',
      ],
      utils.hexDataSlice(transaction.data, 4),
    );

    for (const _rule of _rules) {
      const k = calculateRuleKey(_rule);
      const index = rules.findIndex((r) => calculateRuleKey(r) == k);

      if (index === -1) rules.push(_rule);
      else rules[index] = _rule;
    }
  }

  return rules;
}

export async function calculateRulesTree(rules: BigNumberish[][]) {
  const trie = new BaseTrie();
  for (const rule of rules) {
    const key = calculateRuleKey(rule);
    const value = utils.RLP.encode(
      rule.map((r) => utils.stripZeros(BigNumber.from(r).toHexString())),
    );

    await trie.put(hexToBuffer(key), hexToBuffer(value));
  }

  return trie;
}

export function gzipRules(rules: BigNumberish[][]) {
  const rsEncode = utils.defaultAbiCoder.encode(
    [`tuple(${ruleTypes.join(',')})[]`],
    [rules],
  );
  return utils.hexlify(Pako.gzip(utils.arrayify(rsEncode), { level: 9 }));
}

export function ungzipRules(rsc: BytesLike | Hexable | number) {
  const ungzipData = Pako.ungzip(utils.arrayify(rsc));

  const [rules] = utils.defaultAbiCoder.decode(
    [`tuple(${ruleTypes.join(',')})[]`],
    utils.hexlify(ungzipData),
  );

  return rules as BigNumberish[][];
}
