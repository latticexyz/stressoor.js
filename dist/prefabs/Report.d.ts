import * as Types from "../types";
declare class BaseReport implements Types.Report {
    private name;
    constructor(name: string);
    getName(): string;
    startReport(startTime: Date): void;
    endReport(endTime: Date): void;
    newMetric(params: Types.ParamsType, metrics: Types.MetricsType, callContext: Types.CallContext, testContext: Types.TestContext): void;
    output(): Types.ReportOutput;
}
declare class ReportSelected extends BaseReport {
    selector: string;
    constructor(name: string, selector?: string);
    select<T>(data: Types.MetricsType): T;
}
export declare class ReportDataArray<T> extends ReportSelected {
    data: T[];
    newMetric(params: Types.ParamsType, metrics: Types.MetricsType, callContext: Types.CallContext, testContext: Types.TestContext): void;
    output(): Types.ReportOutput;
}
export declare class ReportTime extends BaseReport {
    startTime: number;
    endTime: number;
    constructor(name?: string);
    startReport(startDate: Date): void;
    endReport(endDate: Date): void;
    output(): Types.ReportOutput;
}
export declare class ReportTimeTemplatedString extends ReportTime {
    urlTemplate: string;
    constructor(name: string, urlTemplate: string);
    output(): Types.ReportOutput;
}
export declare class ReportMaxMinMean extends ReportSelected {
    max: number;
    min: number;
    mean: number;
    n: number;
    newMetric(params: Types.ParamsType, metrics: Types.MetricsType, callContext: Types.CallContext, testContext: Types.TestContext): void;
    output(): Types.ReportOutput;
}
export declare class ReportStats extends ReportDataArray<number> {
    percentileLabels: number[];
    getPercentiles(): {
        [name: number]: number;
    };
    output(): Types.ReportOutput;
}
export {};
