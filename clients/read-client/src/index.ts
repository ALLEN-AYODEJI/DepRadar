import {
  rpc,
  Contract,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  Account,
  Networks,
} from "@stellar/stellar-sdk";

export const DEFAULT_RPC_URL =
  process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";

export const DEFAULT_CONTRACT_ID =
  process.env.DEPRADAR_CONTRACT_ID ||
  "CBFLUY6NB3JOQDEUOF2JG5TL3UD7GCQ7APUJ6EHNNSUJLUELHSGIG675";

// A dummy account address used purely for transaction simulation (no fee or signature required for read-only simulations)
const SIMULATION_ACCOUNT_ID =
  "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H";

export interface Bounty {
  creator: string;
  issue_ref: string;
  amount: bigint;
  token: string;
  released: boolean;
}

export interface Claim {
  claimant: string;
  proof_ref: string;
}

export interface ReadClientConfig {
  rpcUrl?: string;
  contractId?: string;
  networkPassphrase?: string;
}

export class DepRadarReadClient {
  private server: rpc.Server;
  private contract: Contract;
  private networkPassphrase: string;
  private contractId: string;

  constructor(config: ReadClientConfig = {}) {
    const rpcUrl = config.rpcUrl || DEFAULT_RPC_URL;
    this.contractId = config.contractId || DEFAULT_CONTRACT_ID;
    this.networkPassphrase = config.networkPassphrase || Networks.TESTNET;

    const serverOptions: rpc.Server.Options = {
      allowHttp: rpcUrl.startsWith("http://"),
    };

    this.server = new rpc.Server(rpcUrl, serverOptions);
    this.contract = new Contract(this.contractId);
  }

  public getContractId(): string {
    return this.contractId;
  }

  /**
   * Fetches a single bounty by its ID from the DepRadar smart contract.
   * @param bountyId u64 identifier of the bounty
   * @returns Bounty object if found, or null
   */
  public async getBounty(bountyId: bigint | number): Promise<Bounty | null> {
    const u64Val = typeof bountyId === "number" ? BigInt(bountyId) : bountyId;
    const op = this.contract.call("get_bounty", nativeToScVal(u64Val, { type: "u64" }));

    const dummyAccount = new Account(SIMULATION_ACCOUNT_ID, "0");
    const tx = new TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    const simRes = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationSuccess(simRes) && simRes.result && simRes.result.retval) {
      const native = scValToNative(simRes.result.retval);
      if (native === null || native === undefined) {
        return null;
      }
      return {
        creator: String(native.creator),
        issue_ref: String(native.issue_ref),
        amount: BigInt(native.amount),
        token: String(native.token),
        released: Boolean(native.released),
      };
    }

    return null;
  }

  /**
   * Fetches a single claim for a bounty by its ID.
   * @param bountyId u64 identifier of the bounty
   * @returns Claim object if found, or null
   */
  public async getClaim(bountyId: bigint | number): Promise<Claim | null> {
    const u64Val = typeof bountyId === "number" ? BigInt(bountyId) : bountyId;
    const op = this.contract.call("get_claim", nativeToScVal(u64Val, { type: "u64" }));

    const dummyAccount = new Account(SIMULATION_ACCOUNT_ID, "0");
    const tx = new TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    const simRes = await this.server.simulateTransaction(tx);

    if (rpc.Api.isSimulationSuccess(simRes) && simRes.result && simRes.result.retval) {
      const native = scValToNative(simRes.result.retval);
      if (native === null || native === undefined) {
        return null;
      }
      return {
        claimant: String(native.claimant),
        proof_ref: String(native.proof_ref),
      };
    }

    return null;
  }
}

/**
 * Format stroops (1 XLM = 10^7 stroops) to formatted human string.
 */
function formatAmount(stroops: bigint): string {
  const divisor = 10_000_000n;
  const integerPart = stroops / divisor;
  const fractionalPart = (stroops % divisor).toString().padStart(7, "0").replace(/0+$/, "");
  return fractionalPart ? `${integerPart}.${fractionalPart}` : `${integerPart}`;
}

/**
 * CLI execution entrypoint
 */
async function main() {
  const args = process.argv.slice(2);
  const targetId = args[0] ? BigInt(args[0]) : 1n;

  console.log("================================================================");
  console.log(" DepRadar Testnet Read Client (Soroban)");
  console.log("================================================================");
  console.log(`📡 RPC Endpoint : ${DEFAULT_RPC_URL}`);
  console.log(`📜 Contract ID  : ${DEFAULT_CONTRACT_ID}`);
  console.log(`🎯 Query Target : Bounty ID #${targetId}`);
  console.log("----------------------------------------------------------------");

  const client = new DepRadarReadClient();

  try {
    console.log(`\n[1/2] Fetching Bounty #${targetId}...`);
    const bounty = await client.getBounty(targetId);

    if (bounty) {
      console.log("✅ Bounty found:");
      console.log(`   - Creator   : ${bounty.creator}`);
      console.log(`   - Issue Ref : ${bounty.issue_ref}`);
      console.log(`   - Amount    : ${bounty.amount} (${formatAmount(bounty.amount)} tokens)`);
      console.log(`   - Token     : ${bounty.token}`);
      console.log(`   - Status    : ${bounty.released ? "RELEASED (Paid out)" : "ACTIVE (Locked)"}`);
    } else {
      console.log(`⚠️  Bounty #${targetId} does not exist on-chain.`);
    }

    console.log(`\n[2/2] Fetching Claim for Bounty #${targetId}...`);
    const claim = await client.getClaim(targetId);

    if (claim) {
      console.log("✅ Claim found:");
      console.log(`   - Claimant  : ${claim.claimant}`);
      console.log(`   - Proof Ref : ${claim.proof_ref}`);
    } else {
      console.log(`ℹ️  No claim submitted yet for Bounty #${targetId}.`);
    }

    console.log("\n================================================================");
    console.log(" Read operations completed successfully!");
    console.log("================================================================\n");
  } catch (error) {
    console.error("❌ Error performing read client operations:", error);
    process.exit(1);
  }
}

export async function runCli(): Promise<void> {
  await main();
}

if (require.main === module) {
  main();
}

