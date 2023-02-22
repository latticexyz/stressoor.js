import * as RPC from "../Rpc";
import * as Types from "../types";

export const rawMetric: Types.MetricsFunc<unknown, unknown, unknown> = async (
  callFunc,
  params,
  callContext,
  testContext
) => {
  return await callFunc(params, callContext, testContext);
};

export const noMetric: Types.MetricsFunc<unknown, unknown, {}> = async (
  callFunc,
  params,
  callContext,
  testContext
) => {
  await callFunc(params, callContext, testContext);
  return {};
};

export const noMetricNoWait: Types.MetricsFunc<unknown, unknown, {}> = async (
  callFunc,
  params,
  callContext,
  testContext
) => {
  callFunc(params, callContext, testContext);
  return {};
};

export const timeIt: Types.MetricsFunc<
  unknown,
  unknown,
  { milliseconds: number }
> = async (callFunc, params, callContext, testContext) => {
  const startTime: Date = new Date();
  await callFunc(params, callContext, testContext);
  const endTime: Date = new Date();
  return {
    milliseconds: endTime.getTime() - startTime.getTime(),
  };
};

export const txInfo: Types.MetricsFunc<
  unknown,
  RPC.TransactionReceipt,
  { [key: string]: number | string | boolean | undefined }
> = async (callFunc, params, callContext, testContext) => {
  const sentBlockNumber: number =
    await callContext.wallet.provider.getBlockNumber();
  const sentTime: number = new Date().getTime();
  const hotNonce: number = callContext.wallet.getHotNonce();
  let receipt = await callFunc(params, callContext, testContext);
  const receiptTime: number = new Date().getTime();
  const receiptBlockNumber: number = receipt.blockNumber;
  return {
    from: callContext.wallet.address,
    hotNonce: hotNonce,
    milliseconds: receiptTime - sentTime,
    sentTime: sentTime,
    receiptTime: receiptTime,
    blockNumberDelta: receiptBlockNumber - sentBlockNumber,
    status: receipt.status,
    blockNumber: receipt.status,
    sentBlockNumber: sentBlockNumber,
    receiptBlockNumber: receiptBlockNumber,
    gasUsed: receipt.gasUsed.toNumber(),
    nEvents: receipt.logs.length,
  };
};
