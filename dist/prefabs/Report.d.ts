import * as Types from "../types";
declare class BaseReport<P, M> implements Types.Report<P, M> {
    private name;
    constructor(name: string);
    getName(): string;
    startReport(startTime: Date): void;
    endReport(endTime: Date): void;
    newMetric(params: P, metrics: M, callContext: Types.CallContext, testContext: Types.TestContext): void;
    output(): Types.ReportOutput;
}
declare class _ReportSelected<P, M> extends BaseReport<P, M> {
    selector: string;
    constructor(name: string, selector?: string);
    select<T>(data: M): T;
}
export declare class ReportDataArray<T, P, M> extends _ReportSelected<P, M> {
    data: T[];
    newMetric(params: P, metrics: M, callContext: Types.CallContext, testContext: Types.TestContext): void;
    output(): Types.ReportOutput;
}
export declare class ReportTime<P, M> extends BaseReport<P, M> {
    startTime: number;
    endTime: number;
    constructor(name?: string);
    startReport(startDate: Date): void;
    endReport(endDate: Date): void;
    output(): Types.ReportOutput;
}
export declare class ReportTimeTemplatedString<P, M> extends ReportTime<P, M> {
    urlTemplate: string;
    constructor(name: string, urlTemplate: string);
    output(): Types.ReportOutput;
}
export declare class ReportMaxMinMean<P, M> extends _ReportSelected<P, M> {
    max: number;
    min: number;
    mean: number;
    n: number;
    newMetric(params: P, metrics: M, callContext: Types.CallContext, testContext: Types.TestContext): void;
    output(): Types.ReportOutput;
}
export declare class ReportStats<P, M> extends ReportDataArray<number, P, M> {
    percentileLabels: number[];
    getPercentiles(): {
        [name: number]: number;
    };
    output(): Types.ReportOutput;
}
export {};
