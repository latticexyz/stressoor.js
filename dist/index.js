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
class GatlingGun {
    constructor(rpcProvider, nAddr = 100, seed = "") {
        this.wallets = [];
        this.initAddr(rpcProvider, nAddr, seed);
    }
    initAddr(rpcProvider, nAddr, seed) {
        this.wallets = [];
        for (let ii = 1; ii < nAddr + 1; ii++) {
            const pKey = "0x" + seed + ii.toString().padStart(64 - seed.length, "0");
            this.wallets.push(new HotNonceWallet(pKey, rpcProvider));
        }
    }
    async shoot(shootFunc, nTx, async, txDelayMs, roundDelayMs) {
        const promises = [];
        for (let txIdx = 0; txIdx < nTx; txIdx++) {
            const addrIdx = txIdx % this.wallets.length;
            if (addrIdx == 0 && txIdx != 0)
                await sleep(roundDelayMs);
            const pp = shootFunc(this.wallets[addrIdx], txIdx, addrIdx);
            if (async) {
                promises.push(pp);
            }
            else {
                await pp;
            }
            await sleep(txDelayMs);
        }
        await Promise.all(promises);
    }
}

async function runStressTest(rpcProvider, paramsFunc, callFunc, metricsFunc, reports, initFuncs = [], async = true, nAddr = 100, nTx = 100, txDelayMs = 25, roundDelayMs = 0, addrGenSeed = "", testContext = {}) {
    const gun = new GatlingGun(rpcProvider, nAddr, addrGenSeed);
    const shoot = async (wallet, txIdx, addrIdx) => {
        const txContext = {
            wallet: wallet,
            txIdx: txIdx,
            addrIdx: addrIdx,
        };
        const params = paramsFunc(testContext, txContext);
        const metrics = await metricsFunc(callFunc, params, testContext, txContext);
        for (let ii = 0; ii < reports.length; ii++) {
            reports[ii].newMetric(params, metrics, testContext, txContext);
        }
    };
    for (let ii = 0; ii < initFuncs.length; ii++) {
        await gun.shoot(initFuncs[ii], nAddr, true, 5, 0);
    }
    const startTime = new Date();
    for (let ii = 0; ii < reports.length; ii++) {
        reports[ii].startReport(startTime);
    }
    await gun.shoot(shoot, nTx, async, txDelayMs, roundDelayMs);
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

const formatTx = (tx) => `${tx.from.toLowerCase()}:${tx.nonce}:${tx.hash.slice(0, 42)}`;
const sendTransaction = async (params, testContext, txContext) => {
    const hotNonce = txContext.wallet.getHotNonce();
    if (!isNaN(hotNonce)) {
        params.nonce = hotNonce;
    }
    const tx = await txContext.wallet.sendTransaction(params);
    log(testContext, "tx", "sent transaction", formatTx(tx));
    return tx;
};
const sendTransactionGetReceipt = async (params, testContext, txContext) => {
    const tx = await sendTransaction(params, testContext, txContext);
    const receipt = await tx.wait();
    log(testContext, "tx", "got receipt for transaction", formatTx(tx));
    return receipt;
};

var Call = /*#__PURE__*/Object.freeze({
    __proto__: null,
    sendTransaction: sendTransaction,
    sendTransactionGetReceipt: sendTransactionGetReceipt
});

const initHotNonce = async (wallet, txIdx, addrIdx) => {
    await wallet.initHotNonce();
};

var Init = /*#__PURE__*/Object.freeze({
    __proto__: null,
    initHotNonce: initHotNonce
});

const timeIt = async (callFunc, params, testContext, txContext) => {
    const startTime = new Date();
    await callFunc(params, testContext, txContext);
    const endTime = new Date();
    return {
        milliseconds: endTime.getTime() - startTime.getTime(),
    };
};
const txInfo = async (callFunc, params, testContext, txContext) => {
    const sentBlockNumber = await txContext.wallet.provider.getBlockNumber();
    const sentTime = new Date().getTime();
    const hotNonce = txContext.wallet.getHotNonce();
    let receipt;
    try {
        receipt = await callFunc(params, testContext, txContext);
    }
    catch (err) {
        return { error: err };
    }
    const receiptTime = new Date().getTime();
    const receiptBlockNumber = receipt.blockNumber;
    return {
        from: txContext.wallet.address,
        hotNonce: hotNonce,
        milliseconds: receiptTime - sentTime,
        sentTime: sentTime,
        receiptTime: receiptTime,
        blockNumberDelta: receiptBlockNumber - sentBlockNumber,
        status: receipt.status,
        blockNumber: receipt.status,
        sentBlockNumber: sentBlockNumber,
        receiptBlockNumber: receiptBlockNumber,
    };
};

var Metrics = /*#__PURE__*/Object.freeze({
    __proto__: null,
    timeIt: timeIt,
    txInfo: txInfo
});

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
    newMetric(params, metrics, testContext, txContext) { }
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
    newMetric(params, metrics, testContext, txContext) {
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
    newMetric(params, metrics, testContext, txContext) {
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
        return {
            stats: {
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

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Call: Call,
    Init: Init,
    Metrics: Metrics,
    Report: Report
});

export { index as Prefabs, HotNonceWallet as Wallet, log, runStressTest };
//# sourceMappingURL=index.js.map
