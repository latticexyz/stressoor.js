export class Statistics {
  private static ensureNotEmpty(arr: readonly number[]): void {
    if (arr.length === 0) {
      throw new Error("The array must not be empty.");
    }
  }

  static asc(a: number, b: number): number {
    return a - b;
  }

  static desc(a: number, b: number): number {
    return b - a;
  }

  static sort(arr: readonly number[], dir = Statistics.asc): number[] {
    return arr.slice().sort(dir);
  }

  static min(arr: readonly number[]): number {
    Statistics.ensureNotEmpty(arr);
    return Math.min(...arr);
  }

  static max(arr: readonly number[]): number {
    Statistics.ensureNotEmpty(arr);
    return Math.max(...arr);
  }

  static range(arr: readonly number[]): number {
    return Statistics.max(arr) - Statistics.min(arr);
  }

  static sum(arr: readonly number[]): number {
    return arr.reduce((x, y) => x + y, 0);
  }

  static mean(arr: readonly number[]): number {
    Statistics.ensureNotEmpty(arr);
    return Statistics.sum(arr) / arr.length;
  }

  static median(arr: readonly number[]): number {
    Statistics.ensureNotEmpty(arr);
    const center = Math.floor(arr.length / 2);
    return Statistics.sort(arr)[center];
  }

  static variance(arr: readonly number[]): number {
    const mean = Statistics.mean(arr);
    const squaredDiffs = arr.map((n) => Math.pow(n - mean, 2));

    return Statistics.mean(squaredDiffs);
  }

  static stddev(arr: readonly number[]): number {
    return Math.sqrt(Statistics.variance(arr));
  }
}
