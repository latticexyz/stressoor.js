import * as Types from "../types";
import { log } from "../Log";

const formatTx = (tx: any) =>
  `from: ${tx.from.slice(0, 8)} nonce: ${
    tx.nonce
  } hash: ${tx.hash.toLowerCase()}`;

export const sendTransaction: Types.CallFunc = async (
  params,
  callContext,
  testContext
) => {
  const hotNonce: number = callContext.wallet.getHotNonce();
  if (!isNaN(hotNonce)) {
    params.nonce = hotNonce;
  }
  const tx = await callContext.wallet.sendTransaction(params);
  log(testContext, "tx", "sent transaction", formatTx(tx));
  return tx;
};

export const sendTransactionGetReceipt: Types.CallFunc = async (
  params,
  callContext,
  testContext
) => {
  const tx = await sendTransaction(params, callContext, testContext);
  const receipt = await tx.wait();
  log(testContext, "tx", "got receipt for transaction", formatTx(tx));
  return receipt;
};
