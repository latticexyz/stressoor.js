import * as RPC from "../Rpc";
import * as Types from "../types";
export declare const noMetric: Types.MetricsFunc<unknown, unknown, {}>;
export declare const noMetricNoWait: Types.MetricsFunc<unknown, unknown, {}>;
export declare const timeIt: Types.MetricsFunc<unknown, unknown, {
    milliseconds: number;
}>;
export declare const txInfo: Types.MetricsFunc<unknown, RPC.TransactionReceipt, {
    [key: string]: number | string | boolean | undefined;
}>;
