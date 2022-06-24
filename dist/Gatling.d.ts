import * as RPC from "./Rpc";
import * as Types from "./types";
export declare class GatlingGun {
    wallets: RPC.Wallet[];
    constructor(rpcProvider: RPC.JsonRpcProvider, nAddr?: number, seed?: string);
    initAddr(rpcProvider: RPC.JsonRpcProvider, nAddr: number, seed: string): void;
    shoot(shootFunc: Types.ShootFunc, nTx: number, async: boolean, txDelayMs: number, roundDelayMs: number): Promise<void>;
}
