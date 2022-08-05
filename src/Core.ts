import { TxSender } from "./Sender";
import { ReportTime } from "./prefabs/Report";
import * as Types from "./types";

const defaultTxSenderConfig: Types.TxSenderConfig = {
  rpcProvider: undefined,
  nAddr: 1,
  addrGenSeed: "",
};

const defaultStressConfig: Types.StressConfig = {
  nTx: undefined,
  async: true,
  txDelayMs: 10,
  roundDelayMs: 0,
};

const defaultReports: Types.Report[] = [new ReportTime()];
const defaultInitFuncs: Types.ShootFunc[] = [];

export async function runStressTest(
  paramsFunc: Types.ParamsFunc,
  callFunc: Types.CallFunc,
  metricsFunc: Types.MetricsFunc,
  reports: Types.Report[] = defaultReports,
  initFuncs: Types.ShootFunc[] = defaultInitFuncs,
  txSenderConfig: Types.TxSenderConfig = defaultTxSenderConfig,
  stressConfig: Types.StressConfig = defaultStressConfig,
  testContext: Types.TestContext = {}
): Promise<any> {
  txSenderConfig = { ...defaultTxSenderConfig, ...txSenderConfig };
  stressConfig = { ...defaultStressConfig, ...stressConfig };

  const gun: TxSender = new TxSender(
    txSenderConfig.rpcProvider,
    txSenderConfig.nAddr,
    txSenderConfig.addrGenSeed
  );

  const shoot: Types.ShootFunc = async (wallet, txIdx, addrIdx) => {
    const txContext = {
      wallet: wallet,
      txIdx: txIdx,
      addrIdx: addrIdx,
    };
    const params = await paramsFunc(testContext, txContext);
    const metrics = await metricsFunc(callFunc, params, testContext, txContext);
    for (let ii = 0; ii < reports.length; ii++) {
      reports[ii].newMetric(params, metrics, testContext, txContext);
    }
  };

  for (let ii = 0; ii < initFuncs.length; ii++) {
    await gun.shoot(
      initFuncs[ii],
      txSenderConfig.nAddr,
      stressConfig.async,
      stressConfig.txDelayMs,
      stressConfig.roundDelayMs
    );
  }

  const startTime: Date = new Date();

  for (let ii = 0; ii < reports.length; ii++) {
    reports[ii].startReport(startTime);
  }

  await gun.shoot(
    shoot,
    stressConfig.nTx,
    stressConfig.async,
    stressConfig.txDelayMs,
    stressConfig.roundDelayMs
  );

  const endTime: Date = new Date();

  const output: { [name: string]: any } = {};

  for (let ii = 0; ii < reports.length; ii++) {
    const report = reports[ii];
    report.endReport(endTime);
    let name: string = report.getName();
    let jj: number = 0;
    while (name in output) {
      name = report.getName() + `(${jj})`;
      jj++;
    }
    output[name] = report.output();
  }

  return output;
}
