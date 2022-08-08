import * as RPC from "./Rpc";
import * as Types from "./types";
export declare class Stressoor {
    wallets: RPC.Wallet[];
    constructor(rpcProvider: RPC.JsonRpcProvider, nWallets?: number, seed?: string);
    initWallets(rpcProvider: RPC.JsonRpcProvider, nWallets: number, seed: string): void;
    stress(stressFunc: Types.StressFunc, nCalls: number, async: boolean, callDelayMs: number, roundDelayMs: number): Promise<void>;
}
