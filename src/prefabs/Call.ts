import * as Types from "../types";
import * as RPC from "../Rpc";
import { log } from "../Log";

const formatTx = (tx: RPC.TransactionResponse) =>
  `from: ${tx.from.slice(0, 8)} nonce: ${
    tx.nonce
  } hash: ${tx.hash.toLowerCase()}`;

export const sendTransaction: Types.CallFunc<
  RPC.TransactionRequest,
  RPC.TransactionResponse
> = async (params, callContext, testContext) => {
  const hotNonce: number = callContext.wallet.getHotNonce();
  if (!isNaN(hotNonce)) {
    params.nonce = hotNonce;
  }
  const tx = await callContext.wallet.sendTransaction(params);
  log(testContext, "tx", "sent transaction", formatTx(tx));
  return tx;
};

export const sendTransactionGetReceipt: Types.CallFunc<
  RPC.TransactionRequest,
  RPC.TransactionReceipt
> = async (params, callContext, testContext) => {
  const tx = await sendTransaction(params, callContext, testContext);
  const receipt = await tx.wait();
  log(testContext, "tx", "got receipt for transaction", formatTx(tx));
  return receipt;
};
