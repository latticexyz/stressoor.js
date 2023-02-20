import * as Types from "../types";

export const initHotNonce: Types.StressFunc = async (
  callContext: Types.CallContext
) => {
  await callContext.wallet.initHotNonce();
};
