import * as RPC from "./Rpc";
import * as Types from "./types";
export declare class Stressoor {
    wallets: RPC.Wallet[];
    constructor(rpcProvider: RPC.JsonRpcProvider, nWallet?: number, seed?: string);
    initWallets(rpcProvider: RPC.JsonRpcProvider, nWallet: number, seed: string): void;
    stress(stressFunc: Types.StressFunc, nCalls: number, async: boolean, callDelayMs: number, roundDelayMs: number): Promise<void>;
}
