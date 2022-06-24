import * as RPC from "./Rpc";
export declare type ParamsType = any;
export declare type MetricsType = any;
export declare type ParamsFunc = (txIdx: number, addrIdx: number) => ParamsType;
export declare type CallFunc = (wallet: RPC.Wallet, params: ParamsType) => Promise<any>;
export declare type MetricsFunc = (callFunc: CallFunc, wallet: RPC.Wallet, params: ParamsType) => Promise<MetricsType>;
export interface Report {
    getName(): string;
    startReport(startTime: Date): void;
    endReport(endTime: Date): void;
    newMetric(txIdx: number, addrIdx: number, params: ParamsType, metrics: MetricsType): void;
    output(): any;
}
export declare type ShootFunc = (wallet: RPC.Wallet, txIdx: number, addrIdx: number) => Promise<void>;
