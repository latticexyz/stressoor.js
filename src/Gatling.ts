import * as RPC from "./Rpc";
import * as Types from "./types";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GatlingGun {
  public wallets: RPC.Wallet[] = [];

  constructor(
    rpcProvider: RPC.JsonRpcProvider,
    nAddr: number = 100,
    seed: string = ""
  ) {
    this.initAddr(rpcProvider, nAddr, seed);
  }

  initAddr(
    rpcProvider: RPC.JsonRpcProvider,
    nAddr: number,
    seed: string
  ): void {
    this.wallets = [];
    for (let ii = 1; ii < nAddr + 1; ii++) {
      const pKey: string =
        "0x" + seed + ii.toString().padStart(64 - seed.length, "0");
      this.wallets.push(new RPC.Wallet(pKey, rpcProvider));
    }
  }

  async shoot(
    shootFunc: Types.ShootFunc,
    nTx: number,
    async: boolean,
    txDelayMs: number,
    roundDelayMs: number
  ): Promise<void> {
    const promises: Promise<unknown>[] = [];
    for (let txIdx = 0; txIdx < nTx; txIdx++) {
      const addrIdx = txIdx % this.wallets.length;
      if (addrIdx == 0 && txIdx != 0) await sleep(roundDelayMs);
      const pp: Promise<unknown> = shootFunc(
        this.wallets[addrIdx],
        txIdx,
        addrIdx
      );
      if (async) {
        promises.push(pp);
      } else {
        await pp;
      }
      await sleep(txDelayMs);
    }
    await Promise.all(promises);
  }
}
