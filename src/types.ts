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

export type StressTestOutput = { [key: string]: ReportOutput };

export type ParamsFunc<P> = (
  callContext: CallContext,
  testContext: TestContext
) => Promise<P>;

export type CallFunc<P, C> = (
  params: P,
  callContext: CallContext,
  testContext: TestContext
) => Promise<C>;

export type MetricsFunc<P, C, M> = (
  callFunc: CallFunc<P, C>,
  params: P,
  callContext: CallContext,
  testContext: TestContext
) => Promise<M>;

export type ReportOutput = { [key: string]: any };

export interface Report<P, M> {
  getName(): string;
  startReport(startTime: Date): void;
  endReport(endTime: Date): void;
  newMetric(
    params: P,
    metrics: M,
    callContext: CallContext,
    testContext: TestContext
  ): void;
  output(): ReportOutput;
}
