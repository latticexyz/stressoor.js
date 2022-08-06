import { Stressoor } from "./Stressoor";
import { ReportTime } from "./prefabs/Report";
import * as Types from "./types";

const defaultStressoorConfig: Types.StressoorConfig = {
  rpcProvider: undefined,
  nWallet: 1,
  walletGenSeed: "",
};

const defaultStressConfig: Types.StressConfig = {
  nCalls: undefined,
  async: true,
  callDelayMs: 10,
  roundDelayMs: 0,
};

const defaultReports: Types.Report[] = [new ReportTime()];
const defaultInitFuncs: Types.StressFunc[] = [];

export async function runStressTest(
  paramsFunc: Types.ParamsFunc,
  callFunc: Types.CallFunc,
  metricsFunc: Types.MetricsFunc,
  reports: Types.Report[] = defaultReports,
  initFuncs: Types.StressFunc[] = defaultInitFuncs,
  stressoorConfig: Types.StressoorConfig = defaultStressoorConfig,
  stressConfig: Types.StressConfig = defaultStressConfig,
  testContext: Types.TestContext = {}
): Promise<any> {
  stressoorConfig = { ...defaultStressoorConfig, ...stressoorConfig };
  stressConfig = { ...defaultStressConfig, ...stressConfig };

  const stressoor: Stressoor = new Stressoor(
    stressoorConfig.rpcProvider,
    stressoorConfig.nWallet,
    stressoorConfig.walletGenSeed
  );

  const stress: Types.StressFunc = async (wallet, callIdx, walletIdx) => {
    const callContext = { wallet, callIdx, walletIdx };
    const params = await paramsFunc(callContext, testContext);
    const metrics = await metricsFunc(
      callFunc,
      params,
      callContext,
      testContext
    );
    for (let ii = 0; ii < reports.length; ii++) {
      reports[ii].newMetric(params, metrics, callContext, testContext);
    }
  };

  for (let ii = 0; ii < initFuncs.length; ii++) {
    await stressoor.stress(
      initFuncs[ii],
      stressoorConfig.nWallet,
      stressConfig.async,
      stressConfig.callDelayMs,
      stressConfig.roundDelayMs
    );
  }

  const startTime: Date = new Date();

  for (let ii = 0; ii < reports.length; ii++) {
    reports[ii].startReport(startTime);
  }

  await stressoor.stress(
    stress,
    stressConfig.nCalls,
    stressConfig.async,
    stressConfig.callDelayMs,
    stressConfig.roundDelayMs
  );

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
