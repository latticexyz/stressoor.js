import * as RPC from "./Rpc";
export declare type TestContext = any;
export declare type CallContext = any;
export declare type ParamsType = any;
export declare type MetricsType = any;
export declare type StressConfig = any;
export declare type StressoorConfig = any;
export declare type ParamsFunc = (callContext: CallContext, testContext: TestContext) => Promise<ParamsType>;
export declare type CallFunc = (params: ParamsType, callContext: CallContext, testContext: TestContext) => Promise<any>;
export declare type MetricsFunc = (callFunc: CallFunc, params: ParamsType, callContext: CallContext, testContext: TestContext) => Promise<MetricsType>;
export interface Report {
    getName(): string;
    startReport(startTime: Date): void;
    endReport(endTime: Date): void;
    newMetric(params: ParamsType, metrics: MetricsType, callContext: CallContext, testContext: TestContext): void;
    output(): any;
}
export declare type StressFunc = (wallet: RPC.Wallet, callIdx: number, walletIdx: number) => Promise<void>;
