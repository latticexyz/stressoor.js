import * as Types from "../types";

export const initHotNonce: Types.ShootFunc = async (wallet, txIdx, addrIdx) => {
  await wallet.initHotNonce();
};
