import * as Types from "./types";

export function log(
  testContext: Types.TestContext,
  subject: string,
  ...message: string[]
): void {
  if (testContext.log === true || testContext[subject]) {
    console.log(`${new Date().toISOString()} -- [${subject}]`, ...message);
  }
}
