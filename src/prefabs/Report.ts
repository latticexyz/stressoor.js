import * as Types from "../types";
import { Statistics } from "./statistics";

class BaseReport<P, M> implements Types.Report<P, M> {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  startReport(startTime: Date) {}
  endReport(endTime: Date) {}
  newMetric(
    params: P,
    metrics: M,
    callContext: Types.CallContext,
    testContext: Types.TestContext
  ) {}
  output(): Types.ReportOutput {
    return {};
  }
}

class _ReportSelected<P, M> extends BaseReport<P, M> {
  public selector: string;

  constructor(name: string, selector: string = "") {
    super(name);
    this.selector = selector;
  }

  select<T>(data: M): T {
    return this.selector == "" ? data : (data as any)[this.selector];
  }
}

export class ReportDataArray<T, P, M> extends _ReportSelected<P, M> {
  public data: T[] = [];

  newMetric(
    params: P,
    metrics: M,
    callContext: Types.CallContext,
    testContext: Types.TestContext
  ) {
    this.data.push(this.select<T>(metrics));
  }

  output(): Types.ReportOutput {
    return {
      data: this.data,
    };
  }
}

export class ReportTime<P, M> extends BaseReport<P, M> {
  public startTime = NaN;
  public endTime = NaN;

  constructor(name: string = "time") {
    super(name);
  }

  startReport(startDate: Date) {
    this.startTime = startDate.getTime();
  }
  endReport(endDate: Date) {
    this.endTime = endDate.getTime();
  }
  output(): Types.ReportOutput {
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      milliseconds: this.endTime - this.startTime,
    };
  }
}

export class ReportTimeTemplatedString<P, M> extends ReportTime<P, M> {
  public urlTemplate: string;

  constructor(name: string, urlTemplate: string) {
    super(name);
    this.urlTemplate = urlTemplate;
  }

  output(): Types.ReportOutput {
    return {
      url: this.urlTemplate
        .replace("$startTime", this.startTime.toString())
        .replace("$endTime", this.endTime.toString()),
    };
  }
}

export class ReportMaxMinMean<P, M> extends _ReportSelected<P, M> {
  public max = NaN;
  public min = NaN;
  public mean = NaN;
  public n = 0;

  newMetric(
    params: P,
    metrics: M,
    callContext: Types.CallContext,
    testContext: Types.TestContext
  ) {
    this.n++;
    const value = this.select<number>(metrics);
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

  output(): Types.ReportOutput {
    return {
      n: this.n,
      max: this.max,
      min: this.min,
      mean: this.mean,
    };
  }
}

export class ReportStats<P, M> extends ReportDataArray<number, P, M> {
  public percentileLabels = [1, 5, 10, 25, 50, 75, 90, 95, 99];

  getPercentiles(): { [name: number]: number } {
    const sortedData = Statistics.sort(this.data);
    const percentiles: { [name: number]: number } = {};
    for (let ii = 0; ii < this.percentileLabels.length; ii++) {
      const label = this.percentileLabels[ii];
      percentiles[label] =
        sortedData[Math.floor((label / 100) * sortedData.length)];
    }
    return percentiles;
  }

  output(): Types.ReportOutput {
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
