import * as RPC from "../Rpc";
import * as Types from "../types";

export const timeIt: Types.MetricsFunc = async (
  callFunc: Types.CallFunc,
  wallet: RPC.Wallet,
  params: Types.ParamsType
) => {
  const startTime: Date = new Date();
  await callFunc(wallet, params);
  const endTime: Date = new Date();
  return {
    milliseconds: endTime.getTime() - startTime.getTime(),
  };
};

export const txInfo: Types.MetricsFunc = async (
  callFunc: Types.CallFunc,
  wallet: RPC.Wallet,
  params: Types.ParamsType
) => {
  const sentBlockNumber: number = await wallet.provider.getBlockNumber();
  const sentTime: number = new Date().getTime();
  const hotNonce: number = wallet.getHotNonce();
  let receipt;
  try {
    receipt = await callFunc(wallet, params);
  } catch (err) {
    return { error: err };
  }
  const receiptTime: number = new Date().getTime();
  const receiptBlockNumber: number = receipt.blockNumber;
  return {
    from: wallet.address,
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
