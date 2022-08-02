import * as RPC from "./Rpc";
export declare type TestContext = any;
export declare type TxContext = any;
export declare type ParamsType = any;
export declare type MetricsType = any;
export declare type ParamsFunc = (testContext: TestContext, txContext: TxContext) => Promise<ParamsType>;
export declare type CallFunc = (params: ParamsType, testContext: TestContext, txContext: TxContext) => Promise<any>;
export declare type MetricsFunc = (callFunc: CallFunc, params: ParamsType, testContext: TestContext, txContext: TxContext) => Promise<MetricsType>;
export interface Report {
    getName(): string;
    startReport(startTime: Date): void;
    endReport(endTime: Date): void;
    newMetric(params: ParamsType, metrics: MetricsType, testContext: TestContext, txContext: TxContext): void;
    output(): any;
}
export declare type ShootFunc = (wallet: RPC.Wallet, txIdx: number, addrIdx: number) => Promise<void>;
