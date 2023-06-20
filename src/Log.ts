import * as Types from "./types";

export function log(
  testContext: Types.TestContext,
  subject: string,
  ...message: string[]
) {
  if (testContext.log === true) {
    console.log(`${new Date().toISOString()} -- [${subject}]`, ...message);
  }
}
