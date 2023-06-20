import * as RPC from "./Rpc";
import * as Types from "./types";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Stressoor {
  public wallets: RPC.Wallet[] = [];

  constructor(config: Types.StressoorConfig) {
    this.initWallets(config);
  }

  initWallets(config: Types.StressoorConfig) {
    this.wallets = [];
    for (let ii = 1; ii < config.nWallets + 1; ii++) {
      const pKey: string =
        "0x" +
        config.walletGenSeed +
        ii.toString().padStart(64 - config.walletGenSeed.length, "0");
      this.wallets.push(new RPC.Wallet(pKey, config.rpcProvider));
    }
  }

  async stress(
    stressFunc: Types.StressFunc,
    config: Types.StressTestConfig
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let callIdx = 0; callIdx < config.nCalls; callIdx++) {
      const walletIdx = callIdx % this.wallets.length;
      if (walletIdx == 0 && callIdx != 0) await sleep(config.roundDelayMs);
      const pp: Promise<void> = stressFunc({
        wallet: this.wallets[walletIdx],
        callIdx,
        walletIdx,
      });
      if (config.async) {
        promises.push(pp);
      } else {
        await pp;
      }
      await sleep(config.callDelayMs);
    }
    await Promise.all(promises);
  }
}
