import * as Types from "../types";
declare class BaseReport implements Types.Report {
    private name;
    constructor(name: string);
    getName(): string;
    startReport(startTime: Date): void;
    endReport(endTime: Date): void;
    newMetric(params: Types.ParamsType, metrics: Types.MetricsType, testContext: Types.TestContext, txContext: Types.TxContext): void;
    output(): any;
}
declare class ReportSelected extends BaseReport {
    selector: string;
    constructor(name: string, selector?: string);
    select(data: any): any;
}
export declare class ReportDataArray extends ReportSelected {
    data: any[];
    newMetric(txIdx: number, addrIdx: number, params: Types.ParamsType, metrics: Types.MetricsType): void;
    output(): any;
}
export declare class ReportTime extends BaseReport {
    startTime: number;
    endTime: number;
    constructor(name?: string);
    startReport(startDate: Date): void;
    endReport(endDate: Date): void;
    output(): any;
}
export declare class ReportTimeTemplatedString extends ReportTime {
    urlTemplate: string;
    constructor(name: string, urlTemplate: string);
    output(): any;
}
export declare class ReportMaxMinMean extends ReportSelected {
    max: number;
    min: number;
    mean: number;
    n: number;
    newMetric(txIdx: number, addrIdx: number, params: Types.ParamsType, metrics: Types.MetricsType): void;
    output(): any;
}
export declare class ReportStats extends ReportDataArray {
    percentileLabels: number[];
    getPercentiles(): any;
    output(): any;
}
export {};
