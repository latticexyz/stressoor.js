import * as Types from "./types";
export declare function runStressTest<P, C, M>(paramsFunc: Types.ParamsFunc<P>, callFunc: Types.CallFunc<P, C>, metricsFunc: Types.MetricsFunc<P, C, M>, reports?: Types.Report<P, M>[], initFuncs?: Types.StressFunc[], _stressoorConfig?: Partial<Types.StressoorConfig>, _stressTestConfig?: Partial<Types.StressTestConfig>, testContext?: Types.TestContext): Promise<Types.StressTestOutput>;
