import * as RPC from "./Rpc";
import * as Types from "./types";
export declare function runStressTest(rpcProvider: RPC.JsonRpcProvider, paramsFunc: Types.ParamsFunc, callFunc: Types.CallFunc, metricsFunc: Types.MetricsFunc, reports: Types.Report[], initFuncs?: Types.ShootFunc[], async?: boolean, nAddr?: number, nTx?: number, txDelayMs?: number, roundDelayMs?: number, addrGenSeed?: string, testContext?: any): Promise<any>;
