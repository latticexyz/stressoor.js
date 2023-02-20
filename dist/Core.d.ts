import * as Types from "./types";
export declare function runStressTest(paramsFunc: Types.ParamsFunc, callFunc: Types.CallFunc, metricsFunc: Types.MetricsFunc, reports?: Types.Report[], initFuncs?: Types.StressFunc[], _stressoorConfig?: Partial<Types.StressoorConfig>, _stressTestConfig?: Partial<Types.StressTestConfig>, testContext?: Types.TestContext): Promise<Types.StressTestOutput>;
