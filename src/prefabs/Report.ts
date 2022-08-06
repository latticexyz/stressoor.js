import * as Types from "../types";
import { Statistics } from "./statistics";

class BaseReport implements Types.Report {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  startReport(startTime: Date): void {}
  endReport(endTime: Date): void {}
  newMetric(
    params: Types.ParamsType,
    metrics: Types.MetricsType,
    callContext: Types.CallContext,
    testContext: Types.TestContext
  ): void {}
  output(): any {}
}

// [?] Can you extend multiple classes?
class ReportSelected extends BaseReport {
  public selector: string;

  constructor(name: string, selector: string = "") {
    super(name);
    this.selector = selector;
  }

  select(data: any): any {
    return this.selector == "" ? data : data[this.selector];
  }
}

export class ReportDataArray extends ReportSelected {
  public data: any[] = [];

  newMetric(
    params: Types.ParamsType,
    metrics: Types.MetricsType,
    callContext: Types.CallContext,
    testContext: Types.TestContext
  ): void {
    this.data.push(this.select(metrics));
  }

  output(): any {
    return {
      data: this.data,
    };
  }
}

export class ReportTime extends BaseReport {
  public startTime: number = NaN;
  public endTime: number = NaN;

  constructor(name: string = "time") {
    super(name);
  }

  startReport(startDate: Date): void {
    this.startTime = startDate.getTime();
  }
  endReport(endDate: Date): void {
    this.endTime = endDate.getTime();
  }
  output(): any {
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      milliseconds: this.endTime - this.startTime,
    };
  }
}

export class ReportTimeTemplatedString extends ReportTime {
  public urlTemplate: string;

  constructor(name: string, urlTemplate: string) {
    super(name);
    this.urlTemplate = urlTemplate;
  }

  output(): any {
    return {
      url: this.urlTemplate
        .replace("$startTime", this.startTime.toString())
        .replace("$endTime", this.endTime.toString()),
    };
  }
}

export class ReportMaxMinMean extends ReportSelected {
  public max: number = NaN;
  public min: number = NaN;
  public mean: number = NaN;
  public n: number = 0;

  newMetric(
    params: Types.ParamsType,
    metrics: Types.MetricsType,
    callContext: Types.CallContext,
    testContext: Types.TestContext
  ): void {
    this.n++;
    const value: number = this.select(metrics);
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

  output(): any {
    return {
      n: this.n,
      max: this.max,
      min: this.min,
      mean: this.mean,
    };
  }
}

export class ReportStats extends ReportDataArray {
  public percentileLabels: number[] = [1, 5, 10, 25, 50, 75, 90, 95, 99];

  getPercentiles(): any {
    const sortedData = Statistics.sort(this.data);
    const percentiles: { [name: number]: number } = {};
    for (let ii = 0; ii < this.percentileLabels.length; ii++) {
      const label: number = this.percentileLabels[ii];
      percentiles[label] =
        sortedData[Math.floor((label / 100) * sortedData.length)];
    }
    return percentiles;
  }

  output(): any {
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
