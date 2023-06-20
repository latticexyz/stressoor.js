import * as RPC from "../Rpc";
import * as Types from "../types";

export async function rawMetric<P, C>(
  callFunc: Types.CallFunc<P, C>,
  params: P,
  callContext: Types.CallContext,
  testContext: Types.TestContext
): Promise<C> {
  return await callFunc(params, callContext, testContext);
}

export async function noMetric<P, C>(
  callFunc: Types.CallFunc<P, C>,
  params: P,
  callContext: Types.CallContext,
  testContext: Types.TestContext
): Promise<{}> {
  await callFunc(params, callContext, testContext);
  return {};
}

export async function noMetricNoWait<P, C>(
  callFunc: Types.CallFunc<P, C>,
  params: P,
  callContext: Types.CallContext,
  testContext: Types.TestContext
): Promise<{}> {
  callFunc(params, callContext, testContext);
  return {};
}

export async function timeIt<P, C>(
  callFunc: Types.CallFunc<P, C>,
  params: P,
  callContext: Types.CallContext,
  testContext: Types.TestContext
): Promise<{ milliseconds: number }> {
  const startTime: Date = new Date();
  await callFunc(params, callContext, testContext);
  const endTime: Date = new Date();
  return {
    milliseconds: endTime.getTime() - startTime.getTime(),
  };
}

export async function txInfo<P>(
  callFunc: Types.CallFunc<P, RPC.TransactionReceipt>,
  params: P,
  callContext: Types.CallContext,
  testContext: Types.TestContext
): Promise<{ [key: string]: number | string | boolean | undefined }> {
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
}
