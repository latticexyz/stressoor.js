import { Wallet } from '@ethersproject/wallet';
import { JsonRpcProvider } from '@ethersproject/providers';
export { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers';

class HookedWallet extends Wallet {
    hook_sendTransaction() { }
    async sendTransaction(transaction) {
        this.hook_sendTransaction();
        return super.sendTransaction(transaction);
    }
}
class HotNonceWallet extends HookedWallet {
    constructor() {
        super(...arguments);
        this.hotNonce = NaN;
    }
    getHotNonce() {
        return this.hotNonce;
    }
    incHotNonce() {
        this.hotNonce++;
    }
    hook_sendTransaction() {
        this.incHotNonce();
    }
    async initHotNonce() {
        this.hotNonce = await this.getTransactionCount();
    }
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
class Stressoor {
    constructor(config) {
        this.wallets = [];
        this.initWallets(config);
    }
    initWallets(config) {
        this.wallets = [];
        for (let ii = 1; ii < config.nWallets + 1; ii++) {
            const pKey = "0x" +
                config.walletGenSeed +
                ii.toString().padStart(64 - config.walletGenSeed.length, "0");
            this.wallets.push(new HotNonceWallet(pKey, config.rpcProvider));
        }
    }
    async stress(stressFunc, config) {
        const promises = [];
        for (let callIdx = 0; callIdx < config.nCalls; callIdx++) {
            const walletIdx = callIdx % this.wallets.length;
            if (walletIdx == 0 && callIdx != 0)
                await sleep(config.roundDelayMs);
            const pp = stressFunc({
                wallet: this.wallets[walletIdx],
                callIdx,
                walletIdx,
            });
            if (config.async) {
                promises.push(pp);
            }
            else {
                await pp;
            }
            await sleep(config.callDelayMs);
        }
        await Promise.all(promises);
    }
}

class Statistics {
    static ensureNotEmpty(arr) {
        if (arr.length === 0) {
            throw new Error("The array must not be empty.");
        }
    }
    static asc(a, b) {
        return a - b;
    }
    static desc(a, b) {
        return b - a;
    }
    static sort(arr, dir = Statistics.asc) {
        return arr.slice().sort(dir);
    }
    static min(arr) {
        Statistics.ensureNotEmpty(arr);
        return Math.min(...arr);
    }
    static max(arr) {
        Statistics.ensureNotEmpty(arr);
        return Math.max(...arr);
    }
    static range(arr) {
        return Statistics.max(arr) - Statistics.min(arr);
    }
    static sum(arr) {
        return arr.reduce((x, y) => x + y, 0);
    }
    static mean(arr) {
        Statistics.ensureNotEmpty(arr);
        return Statistics.sum(arr) / arr.length;
    }
    static median(arr) {
        Statistics.ensureNotEmpty(arr);
        const center = Math.floor(arr.length / 2);
        return Statistics.sort(arr)[center];
    }
    static variance(arr) {
        const mean = Statistics.mean(arr);
        const squaredDiffs = arr.map((n) => Math.pow(n - mean, 2));
        return Statistics.mean(squaredDiffs);
    }
    static stddev(arr) {
        return Math.sqrt(Statistics.variance(arr));
    }
}

class BaseReport {
    constructor(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
    startReport(startTime) { }
    endReport(endTime) { }
    newMetric(params, metrics, callContext, testContext) { }
    output() {
        return {};
    }
}
class _ReportSelected extends BaseReport {
    constructor(name, selector = "") {
        super(name);
        this.selector = selector;
    }
    select(data) {
        return this.selector == "" ? data : data[this.selector];
    }
}
class ReportDataArray extends _ReportSelected {
    constructor() {
        super(...arguments);
        this.data = [];
    }
    newMetric(params, metrics, callContext, testContext) {
        this.data.push(this.select(metrics));
    }
    output() {
        return {
            data: this.data,
        };
    }
}
class ReportTime extends BaseReport {
    constructor(name = "time") {
        super(name);
        this.startTime = NaN;
        this.endTime = NaN;
    }
    startReport(startDate) {
        this.startTime = startDate.getTime();
    }
    endReport(endDate) {
        this.endTime = endDate.getTime();
    }
    output() {
        return {
            startTime: this.startTime,
            endTime: this.endTime,
            milliseconds: this.endTime - this.startTime,
        };
    }
}
class ReportTimeTemplatedString extends ReportTime {
    constructor(name, urlTemplate) {
        super(name);
        this.urlTemplate = urlTemplate;
    }
    output() {
        return {
            url: this.urlTemplate
                .replace("$startTime", this.startTime.toString())
                .replace("$endTime", this.endTime.toString()),
        };
    }
}
class ReportMaxMinMean extends _ReportSelected {
    constructor() {
        super(...arguments);
        this.max = NaN;
        this.min = NaN;
        this.mean = NaN;
        this.n = 0;
    }
    newMetric(params, metrics, callContext, testContext) {
        this.n++;
        const value = this.select(metrics);
        if (Number.isNaN(this.max)) {
            this.max = value;
            this.min = value;
            this.mean = value;
            return;
        }
        this.max = Math.max(this.max, value);
        this.min = Math.min(this.min, value);
        this.mean = (this.mean * (this.n - 1) + value) / this.n;
    }
    output() {
        return {
            n: this.n,
            max: this.max,
            min: this.min,
            mean: this.mean,
        };
    }
}
class ReportStats extends ReportDataArray {
    constructor() {
        super(...arguments);
        this.percentileLabels = [1, 5, 10, 25, 50, 75, 90, 95, 99];
    }
    getPercentiles() {
        const sortedData = Statistics.sort(this.data);
        const percentiles = {};
        for (let ii = 0; ii < this.percentileLabels.length; ii++) {
            const label = this.percentileLabels[ii];
            percentiles[label] =
                sortedData[Math.floor((label / 100) * sortedData.length)];
        }
        return percentiles;
    }
    output() {
        if (this.data.length === 0) {
            return {
                n: 0,
                min: null,
                max: null,
                range: null,
                mean: null,
                median: null,
                variance: null,
                stddev: null,
                percentiles: null,
            };
        }
        return {
            stats: {
                n: this.data.length,
                min: Statistics.min(this.data),
                max: Statistics.max(this.data),
                range: Statistics.range(this.data),
                mean: Statistics.mean(this.data),
                median: Statistics.median(this.data),
                variance: Statistics.variance(this.data),
                stddev: Statistics.stddev(this.data),
                percentiles: this.getPercentiles(),
            },
        };
    }
}

var Report = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ReportDataArray: ReportDataArray,
    ReportTime: ReportTime,
    ReportTimeTemplatedString: ReportTimeTemplatedString,
    ReportMaxMinMean: ReportMaxMinMean,
    ReportStats: ReportStats
});

const defaultStressoorConfig = {
    rpcProvider: new JsonRpcProvider(),
    nWallets: 1,
    walletGenSeed: "",
};
const defaultStressTestConfig = {
    nCalls: 0,
    async: true,
    callDelayMs: 10,
    roundDelayMs: 0,
};
const defaultTestContext = {
    log: false,
};
const defaultReports = [new ReportTime()];
const defaultInitFuncs = [];
async function runStressTest(paramsFunc, callFunc, metricsFunc, reports = defaultReports, initFuncs = defaultInitFuncs, _stressoorConfig = defaultStressoorConfig, _stressTestConfig = defaultStressTestConfig, testContext = defaultTestContext) {
    const stressoorConfig = {
        ...defaultStressoorConfig,
        ..._stressoorConfig,
    };
    const stressTestConfig = {
        ...defaultStressTestConfig,
        ..._stressTestConfig,
    };
    const stressoor = new Stressoor(stressoorConfig);
    const stress = async (callContext) => {
        const params = await paramsFunc(callContext, testContext);
        const metrics = await metricsFunc(callFunc, params, callContext, testContext);
        for (let ii = 0; ii < reports.length; ii++) {
            reports[ii].newMetric(params, metrics, callContext, testContext);
        }
    };
    for (let ii = 0; ii < initFuncs.length; ii++) {
        const initConfig = {
            ...stressTestConfig,
            nCalls: stressoor.wallets.length,
        };
        await stressoor.stress(initFuncs[ii], initConfig);
    }
    const startTime = new Date();
    for (let ii = 0; ii < reports.length; ii++) {
        reports[ii].startReport(startTime);
    }
    await stressoor.stress(stress, stressTestConfig);
    const endTime = new Date();
    const output = {};
    for (let ii = 0; ii < reports.length; ii++) {
        const report = reports[ii];
        report.endReport(endTime);
        let name = report.getName();
        let jj = 0;
        while (name in output) {
            name = report.getName() + `(${jj})`;
            jj++;
        }
        output[name] = report.output();
    }
    return output;
}

function log(testContext, subject, ...message) {
    if (testContext.log === true) {
        console.log(`${new Date().toISOString()} -- [${subject}]`, ...message);
    }
}

const formatTx = (tx) => `from: ${tx.from.slice(0, 8)} nonce: ${tx.nonce} hash: ${tx.hash.toLowerCase()}`;
const sendTransaction = async (params, callContext, testContext) => {
    const hotNonce = callContext.wallet.getHotNonce();
    if (!isNaN(hotNonce)) {
        params.nonce = hotNonce;
    }
    const tx = await callContext.wallet.sendTransaction(params);
    log(testContext, "tx", "sent transaction", formatTx(tx));
    return tx;
};
const sendTransactionGetReceipt = async (params, callContext, testContext) => {
    const tx = await sendTransaction(params, callContext, testContext);
    const receipt = await tx.wait();
    log(testContext, "tx", "got receipt for transaction", formatTx(tx));
    return receipt;
};

var Call = /*#__PURE__*/Object.freeze({
    __proto__: null,
    sendTransaction: sendTransaction,
    sendTransactionGetReceipt: sendTransactionGetReceipt
});

const initHotNonce = async (callContext) => {
    await callContext.wallet.initHotNonce();
};

var Init = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initHotNonce: initHotNonce
});

async function rawMetric(callFunc, params, callContext, testContext) {
    return await callFunc(params, callContext, testContext);
}
async function noMetric(callFunc, params, callContext, testContext) {
    await callFunc(params, callContext, testContext);
    return {};
}
async function noMetricNoWait(callFunc, params, callContext, testContext) {
    callFunc(params, callContext, testContext);
    return {};
}
async function timeIt(callFunc, params, callContext, testContext) {
    const startTime = new Date();
    await callFunc(params, callContext, testContext);
    const endTime = new Date();
    return {
        milliseconds: endTime.getTime() - startTime.getTime(),
    };
}
async function txInfo(callFunc, params, callContext, testContext) {
    const sentBlockNumber = await callContext.wallet.provider.getBlockNumber();
    const sentTime = new Date().getTime();
    const hotNonce = callContext.wallet.getHotNonce();
    let receipt = await callFunc(params, callContext, testContext);
    const receiptTime = new Date().getTime();
    const receiptBlockNumber = receipt.blockNumber;
    return {
        from: callContext.wallet.address,
        hotNonce: hotNonce,
        milliseconds: receiptTime - sentTime,
        sentTime: sentTime,
        receiptTime: receiptTime,
        blockNumberDelta: receiptBlockNumber - sentBlockNumber,
        status: receipt.status,
        blockNumber: receipt.status,
        sentBlockNumber: sentBlockNumber,
        receiptBlockNumber: receiptBlockNumber,
        gasUsed: receipt.gasUsed.toNumber(),
        nEvents: receipt.logs.length,
    };
}

var Metrics = /*#__PURE__*/Object.freeze({
    __proto__: null,
    rawMetric: rawMetric,
    noMetric: noMetric,
    noMetricNoWait: noMetricNoWait,
    timeIt: timeIt,
    txInfo: txInfo
});

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Call: Call,
    Init: Init,
    Metrics: Metrics,
    Report: Report
});

export { index as Prefabs, Stressoor, HotNonceWallet as Wallet, log, runStressTest };
//# sourceMappingURL=index.js.map
