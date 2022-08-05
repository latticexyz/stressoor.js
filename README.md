# stressoor.js

Stressoor.js makes it simple to write complete, rigorous blockchain stress-tests.

We implemented fundamental stressing, measuring, and reporting primitives so you don't have to code them up from scratch.

Stressoor.js is made to build on top of. If you just want to stress-test a chain or see an example of this library in use, check out [chain-stress-tests](https://github.com/latticexyz/chain-stress-tests).

## Stressoor 101

`RPC.Wallet` is a wrapped [ethers.js](https://github.com/ethers-io/ethers.js) that can, optionally, keep track of it's transaction count aka nonce internally. This allows us to easily send multiple transactions from the same address in the same block.

`Gatling.GatlingGun`

[WIP]
