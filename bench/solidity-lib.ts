import {KeyringPair} from "@polkadot/keyring/types";
import { ApiPromise } from "@polkadot/api";

export const DECIMALS = 1_000_000_000_000_000_000n;

export async function transferNative(api: ApiPromise, transfer_contract_account_id: any, alice: KeyringPair) {
    const unsub = await api.tx.balances.transferKeepAlive(transfer_contract_account_id, 1000n * DECIMALS)
        .signAndSend(alice, {nonce: -1}, ({status}) => {
            if (status.isFinalized) {
                unsub();
            }
        });
}