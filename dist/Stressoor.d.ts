import * as RPC from "./Rpc";
import * as Types from "./types";
export declare class Stressoor {
    wallets: RPC.Wallet[];
    constructor(config: Types.StressoorConfig);
    initWallets(config: Types.StressoorConfig): void;
    stress(stressFunc: Types.StressFunc, config: Types.StressTestConfig): Promise<void>;
}
