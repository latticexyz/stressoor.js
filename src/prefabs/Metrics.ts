import * as Types from "../types";

export const timeIt: Types.MetricsFunc = async (
  callFunc,
  params,
  testContext,
  txContext
) => {
  const startTime: Date = new Date();
  await callFunc(params, testContext, txContext);
  const endTime: Date = new Date();
  return {
    milliseconds: endTime.getTime() - startTime.getTime(),
  };
};

export const txInfo: Types.MetricsFunc = async (
  callFunc,
  params,
  testContext,
  txContext
) => {
  const sentBlockNumber: number =
    await txContext.wallet.provider.getBlockNumber();
  const sentTime: number = new Date().getTime();
  const hotNonce: number = txContext.wallet.getHotNonce();
  let receipt;
  try {
    receipt = await callFunc(params, testContext, txContext);
  } catch (err) {
    return { error: err };
  }
  const receiptTime: number = new Date().getTime();
  const receiptBlockNumber: number = receipt.blockNumber;
  return {
    from: txContext.wallet.address,
    hotNonce: hotNonce,
    milliseconds: receiptTime - sentTime,
    sentTime: sentTime,
    receiptTime: receiptTime,
    blockNumberDelta: receiptBlockNumber - sentBlockNumber,
    status: receipt.status,
    blockNumber: receipt.status,
    sentBlockNumber: sentBlockNumber,
    receiptBlockNumber: receiptBlockNumber,
  };
};
