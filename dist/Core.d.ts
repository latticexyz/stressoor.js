import * as RPC from "./Rpc";
import * as Types from "./types";
export declare function runStressTest(paramsFunc: Types.ParamsFunc, callFunc: Types.CallFunc, metricsFunc: Types.MetricsFunc, reports: Types.Report[], initFuncs: Types.ShootFunc[] | undefined, nTx: number | undefined, async: boolean | undefined, txDelayMs: number | undefined, roundDelayMs: number | undefined, rpcProvider: RPC.JsonRpcProvider, nAddr?: number, addrGenSeed?: string, testContext?: any): Promise<any>;
