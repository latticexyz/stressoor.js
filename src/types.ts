import * as RPC from "./Rpc";

// Stressoor

export type CallContext = {
  wallet: RPC.Wallet;
  callIdx: number;
  walletIdx: number;
};

export type StressTestConfig = {
  nCalls: number;
  async: boolean;
  callDelayMs: number;
  roundDelayMs: number;
};

export type StressoorConfig = {
  rpcProvider: RPC.JsonRpcProvider;
  nWallets: number;
  walletGenSeed: string;
};

export type StressFunc = (callContext: CallContext) => Promise<void>;

// Core

export type TestContext = {
  log: boolean;
};

export type StressTestOutput = { [name: string]: ReportOutput };

export type ParamsType = any;
export type MetricsType = any;

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

export type ReportOutput = { [name: string]: any };

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
  output(): ReportOutput;
}
