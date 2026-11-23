// A category-by-category farm playbook for the token launch radar.
//
// The board ranks protocols that have not launched a token. A rank alone is not a plan: a reader
// needs to know what a position looks like, what it costs, what could go wrong and what would make
// them leave. This module turns the protocol's own category, chain, size and age into that plan.
// It never names one protocol as special: every row is served by the same table and the same rules.
//
// The output is intentionally small and plain. It is embedded in board.json and in the static
// dashboard's data.js, so every byte a reader sees is produced from this file and the snapshot.

import type { FarmStep, SnapshotProtocol } from './model.ts';

/** One category's farm template. Every field is written out: the dashboard shows most of them. */
export interface PlaybookTemplate {
  /** The category key this template answers. */
  key: string;
  /** A short label shown in the detail view. */
  label: string;
  /** The action that establishes a qualifying position. */
  entry: string;
  /** The small, repeatable action that keeps the position alive. */
  cadence: string;
  /** The risk a reader must understand before depositing. */
  risk: string;
  /** The on-chain signal that says the protocol is still healthy. */
  signal: string;
  /** The condition that ends the farm. */
  exit: string;
  /** The usual gas band for an action on this kind of protocol. */
  gas: string;
  /** A plain-language note on how long the position should be kept. */
  patience: string;
}

/** The template used when a category is absent or unknown. */
export const DEFAULT_PLAYBOOK: PlaybookTemplate = {
  key: 'default',
  label: 'General protocol',
  entry: 'Deposit a small amount of the chain\'s main stable asset through the protocol and keep the receipt or position token.',
  cadence: 'Return once a week to check the position, interact with the app and record what you did.',
  risk: 'A small protocol can change its contracts or lose its liquidity without warning; only deposit what you can lose.',
  signal: 'Volume, deposits and the protocol\'s own dashboard keep moving, and the team keeps publishing updates.',
  exit: 'Leave when the contracts change without notice, when withdrawals slow, or when the reward page stops working.',
  gas: 'about $3 to $10 for each transaction on a busy chain',
  patience: 'Give the position at least one full monthly snapshot before judging it.',
};

/** The full table. Each entry is a different way of earning the same kind of on-chain history. */
export const PLAYBOOKS: Record<string, PlaybookTemplate> = {
  lending: {
    key: 'lending',
    label: 'Lending market',
    entry: 'Supply a small amount of USDC to the market and, if the app offers it, borrow a fraction against it.',
    cadence: 'Check the utilisation ratio each week and add or repay a little so the account stays active.',
    risk: 'A supply position can be liquidated if it is borrowed against, and a sudden utilisation spike can freeze withdrawals.',
    signal: 'Utilisation below the warning band, steady supplied balance and no unusual change to the market contracts.',
    exit: 'Leave if utilisation stays pinned near its ceiling or if the oracle price stops updating.',
    gas: 'about $3 to $8 to supply and a little more to borrow',
    patience: 'Interest and any points accrue by the block, so a longer, quiet position beats constant trading.',
  },
  cdp: {
    key: 'cdp',
    label: 'Collateralised debt',
    entry: 'Lock a small amount of the accepted collateral and mint the smallest amount of the protocol\'s stable asset.',
    cadence: 'Top up collateral or repay a little of the debt each week to keep the position healthy.',
    risk: 'The collateral can fall fast enough to trigger liquidation, and the peg can drift while you hold the debt.',
    signal: 'The mint and redeem functions both work, the peg holds and the collateral ratio stays comfortably above the floor.',
    exit: 'Leave when the collateral ratio approaches the liquidation band or when redemptions are paused.',
    gas: 'about $5 to $15 to open, plus gas for each top-up',
    patience: 'A debt position is a long game: keep it open across at least two snapshots.',
  },
  dex: {
    key: 'dex',
    label: 'Spot exchange',
    entry: 'Provide a small amount of two-sided liquidity in the busiest pool rather than swapping once and leaving.',
    cadence: 'Rebalance the range or the ratio weekly so the position keeps earning fees.',
    risk: 'Impermanent loss can exceed the fees earned, and a thin pool can move sharply against you.',
    signal: 'Daily volume and fee income remain steady and the pool depth does not collapse between checks.',
    exit: 'Leave if volume dries up, if the pool becomes one-sided, or if the interface stops quoting.',
    gas: 'about $4 to $12 to add liquidity and to rebalance',
    patience: 'Fee income is continuous; a few quiet weeks are more useful than a single busy day.',
  },
  'liquidity pool': {
    key: 'liquidity pool',
    label: 'Liquidity pool',
    entry: 'Join the largest pool with a matched pair of assets and keep the position token as proof of the deposit.',
    cadence: 'Collect rewards weekly and note whether the pool share is still growing.',
    risk: 'Pool rewards can fall faster than expected and the paired asset can lose value independently.',
    signal: 'Reward emissions continue, pool share stays stable and withdrawals process without a queue.',
    exit: 'Leave when emissions stop, when the pool share shrinks without trades, or when withdrawals stall.',
    gas: 'about $4 to $10 per deposit and claim',
    patience: 'Track the pool over a full emission cycle before deciding whether to stay.',
  },
  yield: {
    key: 'yield',
    label: 'Yield aggregator',
    entry: 'Deposit into the smallest sensible vault unit and record the share price at the moment of deposit.',
    cadence: 'Check the share price weekly and write down whether it is rising faster than the underlying asset.',
    risk: 'A high advertised yield can come from temporary incentives, and the strategy can take losses in a volatile market.',
    signal: 'Share price rises steadily, the vault publishes its holdings and withdrawals settle in the promised window.',
    exit: 'Leave when the share price stalls, when the strategy changes without notice, or when the withdrawal window lengthens.',
    gas: 'about $3 to $8 to enter and to leave',
    patience: 'Give the vault at least a month: weekly noise says little about a yield strategy.',
  },
  restaking: {
    key: 'restaking',
    label: 'Restaking',
    entry: 'Restake a small amount of the native asset through the protocol and keep the receipt token in the same wallet.',
    cadence: 'Check the operator set and the slashing notices once a week.',
    risk: 'Slashing can reduce the deposited principal, and compounded restaking multiplies that exposure.',
    signal: 'Operators stay online, slashing events are rare and the receipt token keeps its redeemability.',
    exit: 'Leave if an operator is repeatedly penalised or if unstaking takes longer than the published delay.',
    gas: 'about $3 to $12 depending on the chain and the queue',
    patience: 'Unbonding can take days, so plan the exit before you enter.',
  },
  staking: {
    key: 'staking',
    label: 'Staking',
    entry: 'Stake a small amount of the chain\'s native asset with the protocol and keep the staking receipt.',
    cadence: 'Confirm once a week that rewards are accruing and that the validator is online.',
    risk: 'Rewards vary with network conditions, and a long unbonding period locks funds during a price fall.',
    signal: 'Rewards arrive on schedule and the validator remains active in the network\'s own list.',
    exit: 'Leave when rewards stop, when the validator is slashed, or when the unbonding queue grows sharply.',
    gas: 'about $2 to $8 per stake or claim',
    patience: 'Staking is measured over weeks; daily reward changes are noise.',
  },
  bridge: {
    key: 'bridge',
    label: 'Bridge',
    entry: 'Bridge a small amount of USDC to one of the protocol\'s supported chains and use it in an app there.',
    cadence: 'Make one small return trip a week so both sides of the bridge see activity.',
    risk: 'Bridges are a frequent target for exploits, and a route can be paused while funds are in flight.',
    signal: 'Both sides settle quickly, the route stays open and the volume on the bridge does not vanish.',
    exit: 'Leave immediately if a route is paused for an unexplained reason or if settling times keep growing.',
    gas: 'about $5 to $20 including the destination chain cost',
    patience: 'Use small amounts and short holding times; a bridge is a tool, not a long-term position.',
  },
  perpetual: {
    key: 'perpetual',
    label: 'Perpetuals',
    entry: 'Deposit a small amount of margin and open one tiny, fully collateralised position that you can close at any time.',
    cadence: 'Check funding and margin once a week and close the position if funding turns against you.',
    risk: 'Leverage can liquidate the whole margin, and funding can quietly drain a position that looks flat.',
    signal: 'Funding stays near the market average, the order book is deep and liquidations are orderly.',
    exit: 'Leave if funding is extreme, if the book thins, or if the margin requirement changes without warning.',
    gas: 'about $4 to $15 for a round trip on a busy chain',
    patience: 'A perpetual is the shortest of these farms; do not roll it indefinitely.',
  },
  derivatives: {
    key: 'derivatives',
    label: 'Derivatives',
    entry: 'Use the smallest contract unit the app allows and keep it fully collateralised from the start.',
    cadence: 'Review the position weekly and record the funding or premium you paid.',
    risk: 'Contract design varies widely, and an unfamiliar settlement rule can cost more than the trade.',
    signal: 'Open interest is stable, settlement happens on time and the published oracle keeps updating.',
    exit: 'Leave when settlement slips, when open interest collapses, or when the contract terms change.',
    gas: 'about $5 to $18 for entry and exit',
    patience: 'Short windows are safer here; long holding adds funding risk without adding history.',
  },
  prediction: {
    key: 'prediction',
    label: 'Prediction market',
    entry: 'Fund the account and take one small position in a market you can explain in a sentence.',
    cadence: 'Check once a week that the market resolves on time and record the outcome.',
    risk: 'Resolution rules can be ambiguous and an unresolved market can trap funds for weeks.',
    signal: 'Markets resolve near their published dates and the oracle or resolver is clearly named.',
    exit: 'Leave if resolution is repeatedly delayed or if the rules are changed after you enter.',
    gas: 'about $2 to $8 per position',
    patience: 'One resolved market is worth more than ten open bets.',
  },
  curator: {
    key: 'curator',
    label: 'Vault curator',
    entry: 'Deposit into one of the curator\'s published vaults and keep the shares in the same wallet.',
    cadence: 'Read the weekly allocation note and confirm the vault still holds what it says.',
    risk: 'A curator can change allocations quickly, and a strategy that worked last month may not work next month.',
    signal: 'Allocations match the published mandate and the vault publishes performance net of fees.',
    exit: 'Leave if the mandate changes, if reporting stops, or if withdrawals are gated without notice.',
    gas: 'about $4 to $12 to enter or exit',
    patience: 'Curator strategies need a full reporting cycle before they mean anything.',
  },
  allocator: {
    key: 'allocator',
    label: 'Allocator',
    entry: 'Allocate a small amount to one strategy and record the expected risk band before you deposit.',
    cadence: 'Check the allocation weekly against the stated band and rebalance only if it drifts.',
    risk: 'Concentration in one strategy can turn a modest allocation into the whole risk of the account.',
    signal: 'The allocation stays inside its band and the protocol reports inflows and outflows clearly.',
    exit: 'Leave if the allocation drifts without explanation or if the reporting feed stops.',
    gas: 'about $4 to $12 per rebalance',
    patience: 'A few weeks of steady allocation is a better signal than a single large deposit.',
  },
  stable: {
    key: 'stable',
    label: 'Stablecoin',
    entry: 'Mint or deposit a small amount of the protocol\'s stable asset and hold it across at least one peg check.',
    cadence: 'Check the peg and the redemption path once a week.',
    risk: 'A stable asset can depeg under stress and redemption can be limited to large holders.',
    signal: 'The asset trades near its target and redemption works for ordinary holders.',
    exit: 'Leave if the peg breaks for more than a day or if redemption is restricted.',
    gas: 'about $3 to $10 to mint and to redeem',
    patience: 'Hold across a full market week so the peg test is meaningful.',
  },
  rwa: {
    key: 'rwa',
    label: 'Real-world assets',
    entry: 'Take the smallest available unit of the protocol\'s tokenised asset and hold it in a wallet you control.',
    cadence: 'Check the published attestations once a week and record any redemption notice.',
    risk: 'Off-chain custody, legal restrictions and settlement delays matter more here than gas fees.',
    signal: 'Attestations stay current, redemptions settle on time and the asset remains transferable.',
    exit: 'Leave if an attestation is missed or if transferability is paused without explanation.',
    gas: 'about $5 to $20, often with a separate verification step',
    patience: 'These positions are slow by design; measure them in weeks, not hours.',
  },
  insurance: {
    key: 'insurance',
    label: 'Insurance',
    entry: 'Buy the smallest cover period available for a protocol you already use, and keep the policy NFT.',
    cadence: 'Check once a week whether the cover still matches the protocol you use.',
    risk: 'A policy can exclude the very event you expect, and claims depend on an oracle or a committee.',
    signal: 'Capacity remains available and published claims are settled within the stated window.',
    exit: 'Let the policy expire if the covered protocol changes materially or if claims stop settling.',
    gas: 'about $3 to $10 plus the premium',
    patience: 'A short policy renewed on time is enough; there is no benefit in locking funds for a year.',
  },
  options: {
    key: 'options',
    label: 'Options',
    entry: 'Sell or buy one smallest-size option with a strike you can justify in a sentence.',
    cadence: 'Check the position\'s delta and expiry once a week and close before expiry unless you want assignment.',
    risk: 'Options expire, and an unattended position can lose its entire premium or be assigned.',
    signal: 'Open interest is healthy and the settlement oracle matches the underlying market.',
    exit: 'Close before expiry if the thesis no longer holds or if the book becomes too thin.',
    gas: 'about $5 to $18 per contract round trip',
    patience: 'Keep the holding period shorter than the option\'s life.',
  },
  gaming: {
    key: 'gaming',
    label: 'Gaming',
    entry: 'Create a player account, connect a fresh wallet and complete the first on-chain action the game asks for.',
    cadence: 'Play once a week so the wallet records more than one session.',
    risk: 'Game economies change quickly and in-game items may have no cash value outside the app.',
    signal: 'The game remains playable, withdrawals work and the community is still active.',
    exit: 'Leave if withdrawals are disabled or if the game stops publishing updates.',
    gas: 'about $2 to $8 per on-chain action',
    patience: 'A regular weekly session beats a single long grind.',
  },
  social: {
    key: 'social',
    label: 'Social',
    entry: 'Create a profile, link a fresh wallet and publish one piece of content through the app.',
    cadence: 'Post or interact once a week and keep the same wallet attached.',
    risk: 'Social apps can change their reward rules at any time and account data may not be portable.',
    signal: 'The app keeps publishing rule changes and payouts continue on schedule.',
    exit: 'Leave if payouts stop or if the reward rules change without an announcement.',
    gas: 'often no gas, sometimes $1 to $5 for a profile action',
    patience: 'Steady interaction over several weeks is the whole point of this farm.',
  },
  infrastructure: {
    key: 'infrastructure',
    label: 'Infrastructure',
    entry: 'Use the protocol once for its intended service and keep the transaction receipt and any issued credential.',
    cadence: 'Repeat the service once a week and record whether it completed without a retry.',
    risk: 'Infrastructure rewards are often speculative and the service can be discontinued entirely.',
    signal: 'The service is live, its status page is current and requests complete without manual help.',
    exit: 'Leave if the service is deprecated or if the published endpoint stops answering.',
    gas: 'about $1 to $6 per call on most chains',
    patience: 'Two or three successful weeks are enough to document the usage.',
  },
};

/** A short note on a few chains, used to make the cost field less generic. */
export const CHAIN_NOTES: Record<string, string> = {
  ethereum: 'Ethereum gas is the largest variable cost here, so batch actions where the app allows it.',
  arbitrum: 'Arbitrum keeps gas low; the main cost is the bridge in and out.',
  optimism: 'Optimism is cheap enough for weekly actions; watch the withdrawal delay when you leave.',
  base: 'Base is cheap enough for a small daily action; keep an eye on the bridge rather than the gas.',
  solana: 'Solana fees are tiny; the risk is a failed transaction during congestion, not the cost.',
  polygon: 'Polygon is inexpensive; check that the app still supports the sidechain you use.',
  avalanche: 'Avalanche fees are modest; confirm the subnet before you deposit.',
  bsc: 'BSC is cheap but bridge risk is higher; keep position sizes small.',
};

/** Turn a category string into a template key. The longest known phrase always wins. */
export function categoryKey(category: string | null): string {
  if (category === null || category.trim() === '') return DEFAULT_PLAYBOOK.key;
  const value = category.toLowerCase();
  const keys = Object.keys(PLAYBOOKS).filter((key) => key !== DEFAULT_PLAYBOOK.key);
  keys.sort((a, b) => b.length - a.length);
  for (const key of keys) if (value.includes(key)) return key;
  return DEFAULT_PLAYBOOK.key;
}

/** Look up the template for a protocol, falling back to the general one. */
export function templateFor(p: SnapshotProtocol): PlaybookTemplate {
  return PLAYBOOKS[categoryKey(p.category)] ?? DEFAULT_PLAYBOOK;
}

/** Choose a position size from the protocol's own TVL, never from its name or a tips. */
export function sizeFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  if (p.tvl_usd >= 10_000_000) return 75;
  return 50;
}

/** Choose a holding period from the protocol's age: young protocols need a longer observation. */
export function patienceFor(age: number | null): number {
  if (age === null) return 45;
  if (age < 180) return 60;
  if (age < 365) return 45;
  if (age < 730) return 30;
  return 21;
}

/** The first chain, or a neutral phrase when the snapshot has none. */
export function mainChain(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? (p.chains[0] as string) : 'its main chain';
}

/** A chain-specific cost note when one exists for this protocol's first chain. */
export function chainNote(p: SnapshotProtocol): string | null {
  const chain = mainChain(p).toLowerCase();
  for (const key of Object.keys(CHAIN_NOTES)) if (chain.includes(key)) return CHAIN_NOTES[key] ?? null;
  return null;
}

/** Build the entry action from the template and the chosen size. */
export function entryAction(p: SnapshotProtocol, template: PlaybookTemplate, size: number): string {
  const chain = mainChain(p);
  const base = template.entry.replace(/a small amount/g, `$${size} worth`).replace(/the smallest/g, `one small`);
  return `${base} on ${chain}, using ${p.name}'s own interface rather than a third-party wrapper.`;
}

/** Build the recurring action, making clear that it is a weekly habit, not a one-off trade. */
export function weeklyAction(template: PlaybookTemplate): string {
  return `${template.cadence} Keep the same wallet and the same position so the history is continuous.`;
}

/** Build the exit rule as a single readable sentence. */
export function exitRule(template: PlaybookTemplate): string {
  return `${template.exit} Record the reason in the farm log so the next position starts from what you learned.`;
}

/** Compose the full sequence of farm steps for one protocol. */
export function buildSteps(p: SnapshotProtocol, age: number | null): FarmStep[] {
  const template = templateFor(p);
  const size = sizeFor(p);
  const days = patienceFor(age);
  const note = chainNote(p);
  return [
    {
      text: `Open a dedicated wallet, fund it with only the $${size} you intend to farm, and store its recovery phrase offline.`,
      cost: 'under $3 for the first transaction',
      time: '5 minutes',
    },
    {
      text: entryAction(p, template, size),
      cost: `$${size} of capital plus ${template.gas}${note ? `; ${note}` : ''}`,
      time: '15 minutes to set up',
    },
    {
      text: weeklyAction(template),
      cost: 'about $2 of gas a week',
      time: '10 minutes a week',
    },
    {
      text: `Keep the position for at least ${days} days so it appears in more than one periodic snapshot of the protocol.`,
      cost: `the $${size} stays in the position`,
      time: `${days} days`,
    },
    {
      text: `Check the health signals: ${template.signal} If they fail, follow the exit rule before adding more.`,
      cost: 'no fee to check',
      time: '10 minutes a week',
    },
    {
      text: `Claim only from the link published on ${p.name}'s own site; never from a message or a private reply.`,
      cost: 'no payment is required to claim',
      time: '10 minutes',
    },
    {
      text: exitRule(template),
      cost: 'the gas needed to unwind',
      time: '15 minutes',
    },
  ];
}

/** Explain the farm in one paragraph for the detail view. */
export function rationaleFor(p: SnapshotProtocol, age: number | null): string {
  const template = templateFor(p);
  const days = patienceFor(age);
  return [
    `${p.name} is a ${template.label.toLowerCase()}.`,
    `The plan is to ${template.entry.charAt(0).toLowerCase()}${template.entry.slice(1)}`,
    `The main risk is that ${template.risk.charAt(0).toLowerCase()}${template.risk.slice(1)}`,
    `Hold for about ${days} days, watch ${template.signal.charAt(0).toLowerCase()}${template.signal.slice(1)}`,
    exitRule(template),
  ].join(' ');
}

/** One call that returns everything the board and the detail view need. */
export function buildPlaybook(p: SnapshotProtocol, age: number | null): {
  template: PlaybookTemplate;
  steps: FarmStep[];
  rationale: string;
  size: number;
  days: number;
} {
  const template = templateFor(p);
  return {
    template,
    steps: buildSteps(p, age),
    rationale: rationaleFor(p, age),
    size: sizeFor(p),
    days: patienceFor(age),
  };
}
