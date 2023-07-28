import { Provider } from '@ethersproject/providers';
import { BigNumber, BigNumberish, BytesLike, Wallet, utils } from 'ethers';
import { Hexable } from 'ethers/lib/utils';
import { BaseTrie } from 'merkle-patricia-tree';
import Pako from 'pako';
import { hexToBuffer } from '../utils.test';
import lodash from 'lodash';
import { Address } from 'cluster';
import { ethers } from 'ethers';

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
];

export function createRandomRule() {
  const chainIds = [1, 42161, 10, 324];

  const ETH = [
    // chain id 1
    ethers.utils.getAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
    ethers.utils.getAddress('0x6B175474E89094C44Da98b954EedeAC495271d0F'),
    ethers.utils.getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  ];

  const ARB = [
    // chain id 42161
    ethers.utils.getAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
    ethers.utils.getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'),
    ethers.utils.getAddress('0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'),
  ];

  const OP = [
    // chain id 10
    ethers.utils.getAddress('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'),
    ethers.utils.getAddress('0x7F5c764cBc14f9669B88837ca1490cCa17c31607'),
    ethers.utils.getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'),
  ];

  const ERA = [
    // chain id 324
    ethers.utils.getAddress('0x000000000000000000000000000000000000800A'),
    ethers.utils.getAddress('0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'),
  ];

  const chain0Id = lodash.sample(chainIds);
  const chain1Id = lodash.sample(chainIds.filter((id) => id !== chain0Id));
  let chain0Token = ethers.utils.getAddress(
    '0x000000000000000000000000000000000000800A',
  );
  let chain1Token = ethers.utils.getAddress(
    '0x000000000000000000000000000000000000800A',
  );

  if (chain0Id == 1) {
    chain0Token = ethers.utils.getAddress(lodash.sample(ETH)!);
  }
  if (chain0Id == 42161) {
    chain0Token = lodash.sample(ARB)!;
  }
  if (chain0Id == 10) {
    chain0Token = lodash.sample(OP)!;
  }
  if (chain0Id == 324) {
    chain0Token = lodash.sample(ERA)!;
  }

  if (chain1Id == 1) {
    chain1Token = ethers.utils.getAddress(lodash.sample(ETH)!);
  }
  if (chain1Id == 42161) {
    chain1Token = lodash.sample(ARB)!;
  }
  if (chain1Id == 10) {
    chain1Token = lodash.sample(OP)!;
  }
  if (chain1Id == 324) {
    chain1Token = lodash.sample(ERA)!;
  }

  return [
    BigNumber.from(chain0Id),
    BigNumber.from(chain1Id),
    0,
    1,
    chain0Token,
    chain1Token,
    BigNumber.from(5).pow(parseInt(Math.random() * 40 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 40 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 40 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 40 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 40 + '') + 1),
    BigNumber.from(5).pow(parseInt(Math.random() * 40 + '') + 1),
    1,
    2,
    (2 ^ 32) - 1,
    (2 ^ 31) - 1,
    (2 ^ 30) - 1,
    (2 ^ 29) - 1,
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

    const [_, rsc] = utils.defaultAbiCoder.decode(
      ['address', 'bytes', 'tuple(bytes32,uint32)', 'uint16[]', 'uint[]'],
      utils.hexDataSlice(transaction.data, 4),
    );

    const _rules = ungzipRules(rsc);

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
  // return utils.hexlify(Pako.gzip(utils.arrayify(rsEncode), { level: 9 }));
  // console.log('rsEncode:', `tuple(${ruleTypes.join(',')})[]`);
  // console.log('utils.arrayify(rsEncode):', utils.arrayify(rsEncode));
  return utils.hexlify(utils.arrayify(rsEncode));
}

export function ungzipRules(rsc: BytesLike | Hexable | number) {
  // const ungzipData = Pako.ungzip(utils.arrayify(rsc));
  const ungzipData = rsc;

  const [rules] = utils.defaultAbiCoder.decode(
    [`tuple(${ruleTypes.join(',')})[]`],
    utils.hexlify(ungzipData),
  );

  return rules as BigNumberish[][];
}
