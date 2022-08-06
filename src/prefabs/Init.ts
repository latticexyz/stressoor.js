import * as Types from "../types";

export const initHotNonce: Types.StressFunc = async (
  wallet,
  callIdx,
  walletIdx
) => {
  await wallet.initHotNonce();
};
