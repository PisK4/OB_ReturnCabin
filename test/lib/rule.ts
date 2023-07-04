import { Provider } from '@ethersproject/providers';
import { BigNumber, BigNumberish, BytesLike, Wallet, utils } from 'ethers';
import { Hexable } from 'ethers/lib/utils';
import { BaseTrie } from 'merkle-patricia-tree';
import Pako from 'pako';
import { hexToBuffer } from '../utils.test';

export const ruleTypes = [
  'uint32', // chain0's id
  'uint32', // chain1's id
  'uint8', // chain0's status
  'uint8', // chain1's status
  'uint', // chain0's token
  'uint', // chain1's token
  'uint128', // minPrice
  'uint128', // maxPrice
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
  return [
    1,
    2,
    0,
    1,
    Wallet.createRandom().address,
    Wallet.createRandom().address,
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
      ['uint16', 'uint16', 'uint8', 'uint8'],
      rule.slice(0, 4),
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