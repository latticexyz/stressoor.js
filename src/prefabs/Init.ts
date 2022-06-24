import * as RPC from "../Rpc";
import * as Types from "../types";

export const initHotNonce: Types.ShootFunc = async (
  wallet: RPC.Wallet,
  txIdx: number,
  addrIdx: number
) => {
  await wallet.initHotNonce();
};
