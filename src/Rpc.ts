import { Wallet as EthersWallet } from "@ethersproject/wallet";
import {
  JsonRpcProvider,
  WebSocketProvider,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/providers";
import { Deferrable } from "@ethersproject/properties";
export { JsonRpcProvider, WebSocketProvider };

class HookedWallet extends EthersWallet {
  hook_sendTransaction(): void {}

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    this.hook_sendTransaction();
    return super.sendTransaction(transaction);
  }
}

class HotNonceWallet extends HookedWallet {
  private hotNonce: number = NaN;

  getHotNonce(): number {
    return this.hotNonce;
  }

  incHotNonce(): void {
    this.hotNonce++;
  }

  hook_sendTransaction(): void {
    this.incHotNonce();
  }

  async initHotNonce(): Promise<void> {
    this.hotNonce = await this.getTransactionCount();
  }
}

export { HotNonceWallet as Wallet };
