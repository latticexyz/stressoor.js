import * as RPC from "./Rpc";

import { GatlingGun } from "./Gatling";
import * as Types from "./types";

export async function runStressTest(
  rpcProvider: RPC.JsonRpcProvider,
  paramsFunc: Types.ParamsFunc,
  callFunc: Types.CallFunc,
  metricsFunc: Types.MetricsFunc,
  reports: Types.Report[],
  initFuncs: Types.ShootFunc[] = [],
  async: boolean = true,
  nAddr: number = 100,
  nTx: number = 100,
  txDelayMs: number = 25,
  roundDelayMs: number = 0,
  addrGenSeed: string = ""
): Promise<any> {
  const gun: GatlingGun = new GatlingGun(rpcProvider, nAddr, addrGenSeed);

  const shoot: Types.ShootFunc = async (
    wallet: RPC.Wallet,
    txIdx: number,
    addrIdx: number
  ) => {
    const params = paramsFunc(txIdx, addrIdx);
    const metrics = await metricsFunc(callFunc, wallet, params);
    for (let ii = 0; ii < reports.length; ii++) {
      reports[ii].newMetric(txIdx, addrIdx, params, metrics);
    }
  };

  for (let ii = 0; ii < initFuncs.length; ii++) {
    await gun.shoot(initFuncs[ii], nAddr, true, 5, 0);
  }

  const startTime: Date = new Date();

  for (let ii = 0; ii < reports.length; ii++) {
    reports[ii].startReport(startTime);
  }

  await gun.shoot(shoot, nTx, async, txDelayMs, roundDelayMs);

  const endTime: Date = new Date();

  const output: { [name: string]: any } = {};

  for (let ii = 0; ii < reports.length; ii++) {
    const report = reports[ii];
    report.endReport(endTime);
    let name: string = report.getName();
    let jj: number = 0;
    while (name in output) {
      name = report.getName() + `(${jj})`;
      jj++;
    }
    output[name] = report.output();
  }

  return output;
}
