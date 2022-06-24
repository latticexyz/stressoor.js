import * as RPC from "./Rpc";

export type ParamsType = any;
export type MetricsType = any;

export type ParamsFunc = (txIdx: number, addrIdx: number) => ParamsType;
export type CallFunc = (wallet: RPC.Wallet, params: ParamsType) => Promise<any>;
export type MetricsFunc = (
  callFunc: CallFunc,
  wallet: RPC.Wallet,
  params: ParamsType
) => Promise<MetricsType>;

export interface Report {
  getName(): string;
  startReport(startTime: Date): void;
  endReport(endTime: Date): void;
  newMetric(
    txIdx: number,
    addrIdx: number,
    params: ParamsType,
    metrics: MetricsType
  ): void;
  output(): any;
}

export type ShootFunc = (
  wallet: RPC.Wallet,
  txIdx: number,
  addrIdx: number
) => Promise<void>;
