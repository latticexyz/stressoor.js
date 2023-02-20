import * as RPC from "./Rpc";
export declare type CallContext = {
    wallet: RPC.Wallet;
    callIdx: number;
    walletIdx: number;
};
export declare type StressTestConfig = {
    nCalls: number;
    async: boolean;
    callDelayMs: number;
    roundDelayMs: number;
};
export declare type StressoorConfig = {
    rpcProvider: RPC.JsonRpcProvider;
    nWallets: number;
    walletGenSeed: string;
};
export declare type StressFunc = (callContext: CallContext) => Promise<void>;
export declare type TestContext = {
    log: boolean;
};
export declare type StressTestOutput = {
    [name: string]: ReportOutput;
};
export declare type ParamsType = any;
export declare type MetricsType = any;
export declare type ParamsFunc = (callContext: CallContext, testContext: TestContext) => Promise<ParamsType>;
export declare type CallFunc = (params: ParamsType, callContext: CallContext, testContext: TestContext) => Promise<any>;
export declare type MetricsFunc = (callFunc: CallFunc, params: ParamsType, callContext: CallContext, testContext: TestContext) => Promise<MetricsType>;
export declare type ReportOutput = {
    [name: string]: any;
};
export interface Report {
    getName(): string;
    startReport(startTime: Date): void;
    endReport(endTime: Date): void;
    newMetric(params: ParamsType, metrics: MetricsType, callContext: CallContext, testContext: TestContext): void;
    output(): ReportOutput;
}
