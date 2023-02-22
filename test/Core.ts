import { runStressTest, Prefabs } from "../src/index";
import { expect } from "chai";

const { rawMetric } = Prefabs.Metrics;

describe("Core test", () => {
  it("test", async () => {
    const output = await runStressTest<number, number, number>(
      async (callContext, testContext) => 1,
      async (params, callContext, testContext) => params,
      rawMetric<number, number, number>,
    );
  });
});
