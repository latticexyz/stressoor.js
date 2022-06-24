export declare class Statistics {
    private static ensureNotEmpty;
    static asc(a: number, b: number): number;
    static desc(a: number, b: number): number;
    static sort(arr: readonly number[], dir?: typeof Statistics.asc): number[];
    static min(arr: readonly number[]): number;
    static max(arr: readonly number[]): number;
    static range(arr: readonly number[]): number;
    static sum(arr: readonly number[]): number;
    static mean(arr: readonly number[]): number;
    static median(arr: readonly number[]): number;
    static variance(arr: readonly number[]): number;
    static stddev(arr: readonly number[]): number;
}
