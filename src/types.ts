import * as RPC from "./Rpc";

export type TestContext = any;
export type TxContext = any;

export type ParamsType = any;
export type MetricsType = any;

export type ParamsFunc = (
  testContext: TestContext,
  txContext: TxContext
) => ParamsType;

export type CallFunc = (
  params: ParamsType,
  testContext: TestContext,
  txContext: TxContext
) => Promise<any>;

export type MetricsFunc = (
  callFunc: CallFunc,
  params: ParamsType,
  testContext: TestContext,
  txContext: TxContext
) => Promise<MetricsType>;

export interface Report {
  getName(): string;
  startReport(startTime: Date): void;
  endReport(endTime: Date): void;
  newMetric(
    params: ParamsType,
    metrics: MetricsType,
    testContext: TestContext,
    txContext: TxContext
  ): void;
  output(): any;
}

export type ShootFunc = (
  wallet: RPC.Wallet,
  txIdx: number,
  addrIdx: number
) => Promise<void>;
