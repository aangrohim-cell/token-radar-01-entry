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
  'basis trading': {
    key: 'basis trading',
    label: 'Basis trade',
    entry: 'Open a small spot position and an offsetting perpetual position so the two legs largely cancel.',
    cadence: 'Check the funding rate and the size of both legs weekly and rebalance if they drift apart.',
    risk: 'The two legs can settle at different times, and a funding swing can cost more than the basis earned.',
    signal: 'Funding stays near its average and both venues keep quoting around the clock.',
    exit: 'Close both legs together if one venue pauses withdrawals or if the spread inverts sharply.',
    gas: 'about $8 to $25 because the plan has two legs',
    patience: 'A basis position is short-lived by design; a few weeks is enough.',
  },
  'liquidity manager': {
    key: 'liquidity manager',
    label: 'Liquidity manager',
    entry: 'Deposit into one of the manager\'s published ranges and keep the position receipt.',
    cadence: 'Check weekly whether the range still covers the current price and whether fees are being earned.',
    risk: 'A range that falls out of the market stops earning fees and can be mostly one asset when you leave.',
    signal: 'The range tracks price, fees accrue and the manager publishes its rebalance history.',
    exit: 'Exit if the range stays out of the market for two checks or if rebalances stop being reported.',
    gas: 'about $6 to $18 for each rebalance',
    patience: 'Judge the manager over at least two full rebalance cycles.',
  },
  'leveraged farming': {
    key: 'leveraged farming',
    label: 'Leveraged farm',
    entry: 'Use the smallest leverage the app offers and keep enough collateral to absorb a sharp move.',
    cadence: 'Check the health factor weekly and repay a little if it falls toward the warning band.',
    risk: 'Leverage amplifies both the farm rewards and the loss; a single bad hour can liquidate the position.',
    signal: 'The health factor stays well above liquidation and borrow rates remain stable.',
    exit: 'Unwind immediately if the health factor approaches the liquidation band or if borrow rates spike.',
    gas: 'about $8 to $20 for entry, adjustments and exit',
    patience: 'Keep this farm short; leverage and long holding periods are a poor combination.',
  },
  index: {
    key: 'index',
    label: 'Index product',
    entry: 'Buy the smallest unit of the index and keep the receipt token in the farm wallet.',
    cadence: 'Check the index composition weekly and note any rebalance that changed your exposure.',
    risk: 'An index hides its weakest component, and rebalancing can realise losses you did not choose.',
    signal: 'The composition is published, rebalances happen on schedule and the price tracks its components.',
    exit: 'Leave if the composition is no longer published or if tracking error grows without explanation.',
    gas: 'about $3 to $10 per buy or sell',
    patience: 'Index exposure is measured in weeks; ignore single-day tracking noise.',
  },
  farm: {
    key: 'farm',
    label: 'Yield farm',
    entry: 'Stake a small amount of the farm\'s required token pair and keep the staking receipt.',
    cadence: 'Harvest once a week and record whether the reward amount is falling.',
    risk: 'Farm rewards usually fall over time, and the staked pair can lose value while you wait.',
    signal: 'Emissions continue on schedule and the farm contract still accepts deposits and withdrawals.',
    exit: 'Leave when emissions drop sharply or when the reward token can no longer be sold.',
    gas: 'about $4 to $12 for stake, harvest and exit',
    patience: 'A full emission week is the smallest useful observation window.',
  },
  launchpad: {
    key: 'launchpad',
    label: 'Launchpad',
    entry: 'Complete the smallest allowed participation and keep the confirmation the app issues.',
    cadence: 'Check once a week whether the project has published its next milestone.',
    risk: 'Early projects can disappear after a sale, and an allocation can carry a long lock.',
    signal: 'The team publishes progress and the allocation contract is verified on the chain.',
    exit: 'Leave if milestones stop appearing or if the vesting schedule changes without notice.',
    gas: 'about $3 to $12 per participation',
    patience: 'Track a launch over several weeks; a single sale day says very little.',
  },
  privacy: {
    key: 'privacy',
    label: 'Privacy protocol',
    entry: 'Make one small private transfer and keep the note or receipt the protocol gives you.',
    cadence: 'Repeat a small transfer weekly so the wallet shows sustained, valid use.',
    risk: 'Privacy tooling attracts scrutiny, and a lost note cannot be recovered by anyone.',
    signal: 'The pool keeps growing, withdrawals work and the circuit or contract is unchanged.',
    exit: 'Leave if withdrawals are censored or if the implementation is replaced without an announcement.',
    gas: 'about $5 to $20 depending on the chain and the pool',
    patience: 'Small, regular use is safer than one large deposit.',
  },
  synthetics: {
    key: 'synthetics',
    label: 'Synthetic asset',
    entry: 'Mint the smallest amount of the synthetic asset and hold it alongside the collateral.',
    cadence: 'Check the collateral ratio and the asset price weekly.',
    risk: 'A synthetic can depeg when collateral falls, and liquidation can take the whole position.',
    signal: 'The price stays near its target and mint and redeem both work without a queue.',
    exit: 'Leave if the peg breaks or if redemptions are paused for an unexplained reason.',
    gas: 'about $5 to $15 to mint and to redeem',
    patience: 'Hold across a normal market week to see whether the peg is real.',
  },
  payments: {
    key: 'payments',
    label: 'Payments',
    entry: 'Send one small payment through the app and keep the transaction reference it issues.',
    cadence: 'Make one more payment each week to the same recipient so the activity is repeatable.',
    risk: 'Payment apps can hold funds during review, and a failed transfer may need manual support.',
    signal: 'Transfers settle quickly, fees match the published schedule and support responds.',
    exit: 'Leave if settlement times grow or if the fee schedule changes without notice.',
    gas: 'about $1 to $5 per payment on most chains',
    patience: 'A few regular payments are enough to document real use.',
  },
  'governance incentives': {
    key: 'governance incentives',
    label: 'Governance',
    entry: 'Lock a small amount of the governance asset and cast one vote on a live proposal.',
    cadence: 'Check proposals weekly and vote on the ones you have read.',
    risk: 'Locked governance tokens can stay illiquid for months and a bad vote cannot be undone.',
    signal: 'Proposals reach a quorum and their outcomes are executed as written.',
    exit: 'Leave if voting stops or if outcomes are not implemented after a quorum.',
    gas: 'about $2 to $10 per vote or lock',
    patience: 'Governance is slow; participation over a season matters more than one vote.',
  },
  'nft marketplace': {
    key: 'nft marketplace',
    label: 'NFT marketplace',
    entry: 'Buy the cheapest listed item you genuinely like and keep it in the farm wallet.',
    cadence: 'Check the listing once a week and note whether similar items are still trading.',
    risk: 'NFT prices are thin and an item can be impossible to sell at the price you paid.',
    signal: 'Volume continues, royalties are honoured and withdrawals are instant.',
    exit: 'Exit if trading stops or if the marketplace changes custody of listed items.',
    gas: 'about $4 to $15 per trade',
    patience: 'Do not count on a quick resale; treat the cost as the price of the history.',
  },
  'ai agents': {
    key: 'ai agents',
    label: 'AI agent',
    entry: 'Fund the agent with the minimum amount and give it one clearly bounded task.',
    cadence: 'Review its published decisions weekly and revoke access if they leave the stated task.',
    risk: 'An agent can spend or trade beyond your intent, and its model or rules can change silently.',
    signal: 'Its actions match the published mandate and its spending stays inside the allowance.',
    exit: 'Revoke access at once if it acts outside the mandate or if the allowance changes.',
    gas: 'about $2 to $8 per on-chain agent action',
    patience: 'One bounded task observed over two weeks is enough.',
  },
  'otc marketplace': {
    key: 'otc marketplace',
    label: 'OTC desk',
    entry: 'Request a quote for a small amount and complete one trade only if the settlement is atomic.',
    cadence: 'Check quote quality weekly against a public reference price.',
    risk: 'An OTC trade can settle hours after the quote, and counterparty risk sits with you until then.',
    signal: 'Quotes are close to the market and settlement uses a verified escrow contract.',
    exit: 'Leave if settlement ever requires sending funds first to an unverified address.',
    gas: 'about $5 to $20 per settled trade',
    patience: 'One clean settlement is worth more than a dozen quotes.',
  },
  'stablecoin issuer': {
    key: 'stablecoin issuer',
    label: 'Stablecoin issuer',
    entry: 'Mint and redeem the smallest allowed amount so both paths are recorded from your wallet.',
    cadence: 'Check the published reserve report and the peg once a week.',
    risk: 'Reserve quality and banking hours matter more than the smart contract when you redeem.',
    signal: 'Reserve reports are current and redemption works for small holders.',
    exit: 'Leave if a reserve report is missed or if redemptions are limited to large accounts.',
    gas: 'about $3 to $12 per mint and redeem cycle',
    patience: 'Hold through one reserve reporting period before judging it.',
  },
  'anchor btc': {
    key: 'anchor btc',
    label: 'Anchored BTC',
    entry: 'Mint the smallest unit of the anchored asset against Bitcoin and keep the position open.',
    cadence: 'Check the peg and the backing address weekly.',
    risk: 'The bridge or custodian behind the asset is the real risk, not the token contract.',
    signal: 'Backing is published, redemptions work and the price tracks Bitcoin.',
    exit: 'Leave if backing stops being published or if redemption needs an unexplained delay.',
    gas: 'about $5 to $20 per mint or redeem',
    patience: 'A full week of peg checks is the minimum useful sample.',
  },
  'stablecoin wrapper': {
    key: 'stablecoin wrapper',
    label: 'Stable wrapper',
    entry: 'Wrap a small amount of a major stablecoin and use the wrapped token once in the app.',
    cadence: 'Check weekly that the wrapper still redeems one for one.',
    risk: 'A wrapper is only as good as the asset it wraps, and an extra contract is an extra failure point.',
    signal: 'Wrap and unwrap both work and the price stays at par.',
    exit: 'Leave if unwrap fails or if the underlying asset changes without notice.',
    gas: 'about $2 to $8 per wrap and unwrap',
    patience: 'A short, repeated cycle is enough to document the use.',
  },
  'token locker': {
    key: 'token locker',
    label: 'Token locker',
    entry: 'Lock a small amount for the shortest available term and keep the lock receipt.',
    cadence: 'Check once a week that the unlock date has not moved.',
    risk: 'A lock cannot be reversed, and the token can fall sharply while it is locked.',
    signal: 'The lock contract is verified and the published unlock date matches the on-chain one.',
    exit: 'There is no early exit; plan the amount so that waiting is acceptable.',
    gas: 'about $3 to $10 to lock and to withdraw',
    patience: 'Choose a term you are happy to hold to its end.',
  },
  'reserve currency': {
    key: 'reserve currency',
    label: 'Reserve asset',
    entry: 'Mint the smallest amount of the reserve asset and hold it through one rebase or report.',
    cadence: 'Check the published backing and the supply change each week.',
    risk: 'A reserve asset depends on the assets behind it and on the rules that issue new supply.',
    signal: 'Backing is published on time and supply changes follow the stated rule.',
    exit: 'Leave if backing reports stop or if supply changes without a stated rule.',
    gas: 'about $3 to $12 per mint or redeem',
    patience: 'Observe at least one full reporting period.',
  },
  'canonical bridge': {
    key: 'canonical bridge',
    label: 'Canonical bridge',
    entry: 'Move a small amount through the official bridge of the chain and keep both side receipts.',
    cadence: 'Return a small amount weekly so the round trip is recorded more than once.',
    risk: 'A canonical bridge can still be paused, and the waiting period on the far side can be long.',
    signal: 'Both directions settle, the contracts are the ones named in the chain\'s own docs and volume continues.',
    exit: 'Leave if an official notice pauses the bridge or if a deposit stays unconfirmed past the published window.',
    gas: 'about $5 to $18 including gas on both chains',
    patience: 'Small round trips over two weeks are enough.',
  },
  'liquid staking': {
    key: 'liquid staking',
    label: 'Liquid staking',
    entry: 'Stake a small amount of the native asset and keep the liquid receipt token unspent.',
    cadence: 'Check the exchange rate against the underlying asset once a week.',
    risk: 'The receipt token can trade below the underlying during stress, and unbonding can take days.',
    signal: 'The exchange rate only rises, withdrawals process and the operator set stays healthy.',
    exit: 'Leave if the receipt discounts sharply for more than a week or if withdrawals are paused.',
    gas: 'about $3 to $10 per stake or unstake',
    patience: 'Give the position a full month; daily rate changes are too small to judge.',
  },
  'staking pool': {
    key: 'staking pool',
    label: 'Staking pool',
    entry: 'Join the pool with a small amount and keep the pool token that records your share.',
    cadence: 'Check the pool balance and the reward rate once a week.',
    risk: 'Pool rewards can be spread thin as the pool grows, and the operator takes a fee.',
    signal: 'Reward rate stays near the published range and the pool balance does not suddenly fall.',
    exit: 'Leave if the reward rate collapses or if the operator stops publishing pool balances.',
    gas: 'about $2 to $8 to join or leave',
    patience: 'A few weekly checks give a fair view of a pool.',
  },
  'cross chain bridge': {
    key: 'cross chain bridge',
    label: 'Cross-chain bridge',
    entry: 'Send a small test amount across the bridge and verify that it arrives in the destination wallet.',
    cadence: 'Repeat with a small amount each week and record the settlement time.',
    risk: 'Cross-chain routes depend on relayers and liquidity on both sides, either of which can fail.',
    signal: 'Settlement stays inside the advertised time and the route keeps its liquidity.',
    exit: 'Leave a route if two consecutive transfers are late or if liquidity dries up.',
    gas: 'about $5 to $20 across both chains',
    patience: 'Short, repeated transfers are safer than one large move.',
  },
  'collateral management': {
    key: 'collateral management',
    label: 'Collateral manager',
    entry: 'Deposit a small amount into one vault and record the target collateral ratio before you start.',
    cadence: 'Check the ratio weekly and top up if it drifts toward the lower band.',
    risk: 'Automated management can rebalance at the worst moment, and a sharp price move can outrun it.',
    signal: 'The vault keeps its ratio inside the published band and reports each rebalance.',
    exit: 'Leave if the ratio leaves the band or if rebalance reports stop.',
    gas: 'about $5 to $15 per deposit or adjustment',
    patience: 'Watch at least two rebalance cycles.',
  },
  'crypto card issuer': {
    key: 'crypto card issuer',
    label: 'Crypto card',
    entry: 'Complete the smallest allowed top-up and make one small payment with the card.',
    cadence: 'Check the statement weekly against the on-chain transfer.',
    risk: 'Card programmes depend on a payment partner, and funds can be held during a compliance review.',
    signal: 'Top-ups arrive, payments clear and the fees match the published schedule.',
    exit: 'Leave if top-ups stop arriving or if the fee schedule changes without notice.',
    gas: 'about $2 to $8 for the on-chain top-up',
    patience: 'One clean monthly statement is a useful record.',
  },
  'decentralized btc': {
    key: 'decentralized btc',
    label: 'Decentralised BTC',
    entry: 'Mint the smallest unit of the wrapped Bitcoin asset and keep the mint receipt.',
    cadence: 'Check the backing and the peg once a week.',
    risk: 'The backing mechanism is the whole risk; a failure there breaks the peg regardless of the token code.',
    signal: 'Backing is verifiable, mint and redeem work and the price follows Bitcoin.',
    exit: 'Leave if backing cannot be verified or if redemption is halted.',
    gas: 'about $5 to $20 per mint or redeem',
    patience: 'Hold through one full week of peg checks.',
  },
  'restaked btc': {
    key: 'restaked btc',
    label: 'Restaked BTC',
    entry: 'Restake the smallest amount of the anchored Bitcoin asset and keep the receipt token.',
    cadence: 'Check the anchor peg and the restaking operator weekly.',
    risk: 'Two layers of risk stack here: the anchor can depeg and the operator can be penalised.',
    signal: 'The anchor holds its peg and the operator stays online without repeated penalties.',
    exit: 'Leave if either layer fails, and never add to a position that has already broken one.',
    gas: 'about $8 to $25 for entry and exit',
    patience: 'Use a short window and small size; this is the highest-risk template in the table.',
  },
  defi: {
    key: 'defi',
    label: 'CeFi / DeFi hybrid',
    entry: 'Use the smallest on-chain deposit the app allows and keep the custodial terms it published.',
    cadence: 'Check the published proof of reserves and your balance once a week.',
    risk: 'Part of the position may be held off-chain, so the on-chain receipt alone does not prove your claim.',
    signal: 'Reserve reports are current, withdrawals settle and the on-chain balance matches your account.',
    exit: 'Leave if a reserve report is missed or if withdrawals are delayed without explanation.',
    gas: 'about $3 to $12 per on-chain action',
    patience: 'One reserve reporting cycle is the minimum useful observation.',
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
