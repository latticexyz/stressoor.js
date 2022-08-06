# stressoor.js

`npm install @latticexyz/stressoor`

Stressoor.js makes it simple to write complete, rigorous blockchain stress-tests.

We implemented fundamental stressing, measuring, and reporting primitives so you don't have to code them up from scratch.

Stressoor.js is made to build on top of. If you just want to stress-test a chain or see an example of this library in use, check out [chain-stress-tests](https://github.com/latticexyz/chain-stress-tests).

## Stressoor 101 [WIP]

The `Stressoor` object initializes a set number of deterministically generated addresses. We call, `Stressoor.stress(stressFunc, nCalls, ...)` to cyclically iterate through them until the desired number of calls have been made.

The stressoor will call a `stressFunc` with each of those wallets.

You will generally be abstracted away from this by the `runStressTest()` function. It takes some functions and configurations objects as parameters and creates a `StressFunc` that looks something like this:

```javascript
async function stress(wallet, callIdx, walletIdx) => {
    // create the call context
    const callContext = { wallet, callIdx, walletIdx };
    // generate call parameters, paramsFunc can return any value
    const params = await paramsFunc(callContext, testContext);
    // call metricsFunc
    // among other things, meticsFunc will call callFunc with
    // (params, callContext, testContext)
    const metrics = await metricsFunc(callFunc, params, callContext, testContext);
    // pass the new data to every report object
    for (let ii = 0; ii < reports.length; ii++) {
      reports[ii].newMetric(params, metrics, callContext, testContext);
    }
  };
```

See the actual code for `runStressTest` [here](/src/Core.ts).

The wallets the stressoor initializes are instances of an [ethers.js](https://github.com/ethers-io/ethers.js) `Wallet` wrapped to optionally keep track of its nonce internally (so they can send multiple transactions in the same block).
