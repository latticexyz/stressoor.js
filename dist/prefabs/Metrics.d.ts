import * as RPC from "../Rpc";
import * as Types from "../types";
export declare function rawMetric<P, C>(callFunc: Types.CallFunc<P, C>, params: P, callContext: Types.CallContext, testContext: Types.TestContext): Promise<C>;
export declare function noMetric<P, C>(callFunc: Types.CallFunc<P, C>, params: P, callContext: Types.CallContext, testContext: Types.TestContext): Promise<{}>;
export declare function noMetricNoWait<P, C>(callFunc: Types.CallFunc<P, C>, params: P, callContext: Types.CallContext, testContext: Types.TestContext): Promise<{}>;
export declare function timeIt<P, C>(callFunc: Types.CallFunc<P, C>, params: P, callContext: Types.CallContext, testContext: Types.TestContext): Promise<{
    milliseconds: number;
}>;
export declare function txInfo<P>(callFunc: Types.CallFunc<P, RPC.TransactionReceipt>, params: P, callContext: Types.CallContext, testContext: Types.TestContext): Promise<{
    [key: string]: number | string | boolean | undefined;
}>;
