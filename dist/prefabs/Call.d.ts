import * as Types from "../types";
import * as RPC from "../Rpc";
export declare const sendTransaction: Types.CallFunc<RPC.TransactionRequest, RPC.TransactionResponse>;
export declare const sendTransactionGetReceipt: Types.CallFunc<RPC.TransactionRequest, RPC.TransactionReceipt>;
