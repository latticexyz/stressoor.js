import * as Types from "../types";
import { log } from "../Log";

const formatTx = (tx: any) =>
  `${tx.from.toLowerCase()}:${tx.nonce}:${tx.hash.slice(0, 42)}`;

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
  log(testContext, "tx", "sent transaction", formatTx(tx));
  return tx;
};

export const sendTransactionGetReceipt: Types.CallFunc = async (
  params,
  testContext,
  txContext
) => {
  const tx = await sendTransaction(params, testContext, txContext);
  const receipt = await tx.wait();
  log(testContext, "tx", "got receipt for transaction", formatTx(tx));
  return receipt;
};
