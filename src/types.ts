import * as RPC from "./Rpc";

export type TestContext = any;
export type CallContext = any;

export type ParamsType = any;
export type MetricsType = any;

export type StressConfig = any;
export type StressoorConfig = any;

export type ParamsFunc = (
  callContext: CallContext,
  testContext: TestContext
) => Promise<ParamsType>;

export type CallFunc = (
  params: ParamsType,
  callContext: CallContext,
  testContext: TestContext
) => Promise<any>;

export type MetricsFunc = (
  callFunc: CallFunc,
  params: ParamsType,
  callContext: CallContext,
  testContext: TestContext
) => Promise<MetricsType>;

export interface Report {
  getName(): string;
  startReport(startTime: Date): void;
  endReport(endTime: Date): void;
  newMetric(
    params: ParamsType,
    metrics: MetricsType,
    callContext: CallContext,
    testContext: TestContext
  ): void;
  output(): any;
}

export type StressFunc = (
  wallet: RPC.Wallet,
  callIdx: number,
  walletIdx: number
) => Promise<void>;
