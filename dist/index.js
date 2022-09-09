import { Wallet } from '@ethersproject/wallet';
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
    constructor(rpcProvider, nWallets = 100, seed = "") {
        this.wallets = [];
        this.initWallets(rpcProvider, nWallets, seed);
    }
    initWallets(rpcProvider, nWallets, seed) {
        this.wallets = [];
        for (let ii = 1; ii < nWallets + 1; ii++) {
            const pKey = "0x" + seed + ii.toString().padStart(64 - seed.length, "0");
            this.wallets.push(new HotNonceWallet(pKey, rpcProvider));
        }
    }
    async stress(stressFunc, nCalls, async, callDelayMs, roundDelayMs) {
        const promises = [];
        for (let callIdx = 0; callIdx < nCalls; callIdx++) {
            const walletIdx = callIdx % this.wallets.length;
            if (walletIdx == 0 && callIdx != 0)
                await sleep(roundDelayMs);
            const pp = stressFunc(this.wallets[walletIdx], callIdx, walletIdx);
            if (async) {
                promises.push(pp);
            }
            else {
                await pp;
            }
            await sleep(callDelayMs);
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
    output() { }
}
// [?] Can you extend multiple classes?
class ReportSelected extends BaseReport {
    constructor(name, selector = "") {
        super(name);
        this.selector = selector;
    }
    select(data) {
        return this.selector == "" ? data : data[this.selector];
    }
}
class ReportDataArray extends ReportSelected {
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
class ReportMaxMinMean extends ReportSelected {
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
    rpcProvider: undefined,
    nWallets: 1,
    walletGenSeed: "",
};
const defaultStressConfig = {
    nCalls: undefined,
    async: true,
    callDelayMs: 10,
    roundDelayMs: 0,
};
const defaultReports = [new ReportTime()];
const defaultInitFuncs = [];
async function runStressTest(paramsFunc, callFunc, metricsFunc, reports = defaultReports, initFuncs = defaultInitFuncs, stressoorConfig = defaultStressoorConfig, stressConfig = defaultStressConfig, testContext = {}) {
    stressoorConfig = { ...defaultStressoorConfig, ...stressoorConfig };
    stressConfig = { ...defaultStressConfig, ...stressConfig };
    const stressoor = new Stressoor(stressoorConfig.rpcProvider, stressoorConfig.nWallets, stressoorConfig.walletGenSeed);
    const stress = async (wallet, callIdx, walletIdx) => {
        const callContext = { wallet, callIdx, walletIdx };
        const params = await paramsFunc(callContext, testContext);
        const metrics = await metricsFunc(callFunc, params, callContext, testContext);
        for (let ii = 0; ii < reports.length; ii++) {
            reports[ii].newMetric(params, metrics, callContext, testContext);
        }
    };
    for (let ii = 0; ii < initFuncs.length; ii++) {
        await stressoor.stress(initFuncs[ii], stressoorConfig.nWallets, stressConfig.async, stressConfig.callDelayMs, stressConfig.roundDelayMs);
    }
    const startTime = new Date();
    for (let ii = 0; ii < reports.length; ii++) {
        reports[ii].startReport(startTime);
    }
    await stressoor.stress(stress, stressConfig.nCalls, stressConfig.async, stressConfig.callDelayMs, stressConfig.roundDelayMs);
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
    if (testContext.log === true || testContext[subject]) {
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

const initHotNonce = async (wallet, callIdx, walletIdx) => {
    await wallet.initHotNonce();
};

var Init = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initHotNonce: initHotNonce
});

const noMetric = async (callFunc, params, callContext, testContext) => {
    await callFunc(params, callContext, testContext);
    return {};
};
const noMetricNoWait = async (callFunc, params, callContext, testContext) => {
    callFunc(params, callContext, testContext);
    return {};
};
const timeIt = async (callFunc, params, callContext, testContext) => {
    const startTime = new Date();
    await callFunc(params, callContext, testContext);
    const endTime = new Date();
    return {
        milliseconds: endTime.getTime() - startTime.getTime(),
    };
};
const txInfo = async (callFunc, params, callContext, testContext) => {
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
};

var Metrics = /*#__PURE__*/Object.freeze({
    __proto__: null,
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

export { index as Prefabs, HotNonceWallet as Wallet, log, runStressTest };
//# sourceMappingURL=index.js.map
