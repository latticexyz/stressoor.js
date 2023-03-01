import {
  runStressTest,
  Prefabs,
  ParamsFunc,
  CallFunc,
  StressTestConfig,
} from "../src/index";

const { rawMetric } = Prefabs.Metrics;
const { ReportDataArray } = Prefabs.Report;

async function main() {
  type P = number;
  type C = P;
  type M = C;

  const paramsFunc: ParamsFunc<number> = async (callContext, testContext) => {
    return callContext.callIdx;
  };
  const callFunc: CallFunc<P, C> = async (params, callContext, testContext) => {
    return params;
  };

  const reports = [new ReportDataArray<number, P, M>("test")];
  const _stressTestConfig: Partial<StressTestConfig> = {
    nCalls: 10,
  };
  const output = await runStressTest<P, C, M>(
    paramsFunc,
    callFunc,
    rawMetric,
    reports,
    [],
    {},
    _stressTestConfig,
    {
      log: false,
    }
  );

  console.log(output);
}

main().then(() => process.exit());
