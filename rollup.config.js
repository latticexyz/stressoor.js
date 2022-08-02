import typescript from "@rollup/plugin-typescript";

import { defineConfig } from "rollup";

export default defineConfig({
    input: "./src/index.ts",
    treeshake: true,
    output: {
        dir: "dist",
        sourcemap: true,
    },
    plugins: [typescript()],
    external: [
        "@ethersproject/properties",
        "@ethersproject/providers",
        "@ethersproject/wallet"
    ]
});
