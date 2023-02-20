import { Stressoor } from "./Stressoor";
import { ReportTime } from "./prefabs/Report";
import * as RPC from "./Rpc";
import * as Types from "./types";

const defaultStressoorConfig: Types.StressoorConfig = {
  rpcProvider: new RPC.JsonRpcProvider(),
  nWallets: 1,
  walletGenSeed: "",
};

const defaultStressTestConfig: Types.StressTestConfig = {
  nCalls: 0,
  async: true,
  callDelayMs: 10,
  roundDelayMs: 0,
};

const defaultTestContext: Types.TestContext = {
  log: false,
};

const defaultReports: Types.Report[] = [new ReportTime()];
const defaultInitFuncs: Types.StressFunc[] = [];

export async function runStressTest(
  paramsFunc: Types.ParamsFunc,
  callFunc: Types.CallFunc,
  metricsFunc: Types.MetricsFunc,
  reports: Types.Report[] = defaultReports,
  initFuncs: Types.StressFunc[] = defaultInitFuncs,
  _stressoorConfig: Partial<Types.StressoorConfig> = defaultStressoorConfig,
  _stressTestConfig: Partial<Types.StressTestConfig> = defaultStressTestConfig,
  testContext: Types.TestContext = defaultTestContext
): Promise<Types.StressTestOutput> {
  const stressoorConfig: Types.StressoorConfig = {
    ...defaultStressoorConfig,
    ..._stressoorConfig,
  };
  const stressTestConfig: Types.StressTestConfig = {
    ...defaultStressTestConfig,
    ..._stressTestConfig,
  };

  const stressoor = new Stressoor(stressoorConfig);

  const stress: Types.StressFunc = async (callContext: Types.CallContext) => {
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
    const initConfig: Types.StressTestConfig = {
      ...stressTestConfig,
      nCalls: stressoor.wallets.length,
    };
    await stressoor.stress(initFuncs[ii], initConfig);
  }

  const startTime = new Date();

  for (let ii = 0; ii < reports.length; ii++) {
    reports[ii].startReport(startTime);
  }

  await stressoor.stress(stress, stressTestConfig);

  const endTime = new Date();

  const output: Types.StressTestOutput = {};

  for (let ii = 0; ii < reports.length; ii++) {
    const report = reports[ii];
    report.endReport(endTime);
    let name = report.getName();
    let jj = 0;
    while (name in output) {
      name = report.getName() + `(${jj})`;
      jj++;
    }
    output[name] = report.output();
  }

  return output;
}
