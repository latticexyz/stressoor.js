import * as RPC from "./Rpc";
import * as Types from "./types";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Stressoor {
  public wallets: RPC.Wallet[] = [];

  constructor(
    rpcProvider: RPC.JsonRpcProvider,
    nWallets: number = 100,
    seed: string = ""
  ) {
    this.initWallets(rpcProvider, nWallets, seed);
  }

  initWallets(
    rpcProvider: RPC.JsonRpcProvider,
    nWallets: number,
    seed: string
  ): void {
    this.wallets = [];
    for (let ii = 1; ii < nWallets + 1; ii++) {
      const pKey: string =
        "0x" + seed + ii.toString().padStart(64 - seed.length, "0");
      this.wallets.push(new RPC.Wallet(pKey, rpcProvider));
    }
  }

  async stress(
    stressFunc: Types.StressFunc,
    nCalls: number,
    async: boolean,
    callDelayMs: number,
    roundDelayMs: number
  ): Promise<void> {
    const promises: Promise<unknown>[] = [];
    for (let callIdx = 0; callIdx < nCalls; callIdx++) {
      const walletIdx = callIdx % this.wallets.length;
      if (walletIdx == 0 && callIdx != 0) await sleep(roundDelayMs);
      const pp: Promise<unknown> = stressFunc(
        this.wallets[walletIdx],
        callIdx,
        walletIdx
      );
      if (async) {
        promises.push(pp);
      } else {
        await pp;
      }
      await sleep(callDelayMs);
    }
    await Promise.all(promises);
  }
}
