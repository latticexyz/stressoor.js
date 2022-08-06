import * as Types from "./types";
export declare function runStressTest(paramsFunc: Types.ParamsFunc, callFunc: Types.CallFunc, metricsFunc: Types.MetricsFunc, reports?: Types.Report[], initFuncs?: Types.StressFunc[], stressoorConfig?: Types.StressoorConfig, stressConfig?: Types.StressConfig, testContext?: Types.TestContext): Promise<any>;
