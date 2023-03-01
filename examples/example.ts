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

  // A params function that returns the call index
  const paramsFunc: ParamsFunc<number> = async (callContext, testContext) => {
    return callContext.callIdx;
  };
  // A call function that returns the raw param without any action
  // Usually, this would be a call to an RPC endpoint
  const callFunc: CallFunc<P, C> = async (params, callContext, testContext) => {
    return params;
  };

  // Report the raw metrics (which will be the params, which will be the call index) as an array
  const reports = [new ReportDataArray<number, P, M>("example")];
  
  // Run the stress test with 10 calls
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
  // Output will be an array of 10 numbers, each number being the call index
  console.log(output);
}

main().then(() => process.exit());
