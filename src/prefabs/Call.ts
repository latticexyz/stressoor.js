import * as Types from "../types";
import { log } from "../Log";

export const sendTransaction: Types.CallFunc = async (
  params,
  testContext,
  txContext
) => {
  const hotNonce: number = txContext.wallet.getHotNonce();
  if (!isNaN(hotNonce)) {
    params.nonce = hotNonce;
  }
  const tx = await txContext.wallet.sendTransaction(params);
  log(testContext, "tx", "sent transaction", JSON.stringify(params));
  return tx;
};

export const sendTransactionGetReceipt: Types.CallFunc = async (
  params,
  testContext,
  txContext
) => {
  const tx = await sendTransaction(params, testContext, txContext);
  const receipt = await tx.wait();
  log(testContext, "tx", "got receipt for transaction", JSON.stringify(params));
  return receipt;
};
