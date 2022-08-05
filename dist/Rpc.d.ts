import { Wallet as EthersWallet } from "@ethersproject/wallet";
import { Provider, JsonRpcProvider, WebSocketProvider, TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { Deferrable } from "@ethersproject/properties";
export { Provider, JsonRpcProvider, WebSocketProvider };
declare class HookedWallet extends EthersWallet {
    hook_sendTransaction(): void;
    sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse>;
}
declare class HotNonceWallet extends HookedWallet {
    private hotNonce;
    getHotNonce(): number;
    incHotNonce(): void;
    hook_sendTransaction(): void;
    initHotNonce(): Promise<void>;
}
export { HotNonceWallet as Wallet };
