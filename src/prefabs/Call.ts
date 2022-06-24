import * as Types from "../types";

export const sendTransaction: Types.CallFunc = async (wallet, params) => {
  const hotNonce: number = wallet.getHotNonce();
  if (!isNaN(hotNonce)) {
    params.nonce = hotNonce;
  }
  const tx = await wallet.sendTransaction(params);
  return tx;
};

export const sendTransactionGetReceipt: Types.CallFunc = async (
  wallet,
  params
) => {
  const tx = await sendTransaction(wallet, params);
  const receipt = await tx.wait();
  return receipt;
};
