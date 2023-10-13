import {KeyringPair} from "@polkadot/keyring/types";
import {ApiPromise} from "@polkadot/api";
import {ethers} from "hardhat";
import * as polkadotCryptoUtils from "@polkadot/util-crypto";
import {formatNumberWithUnderscores} from "./helper";

export const DECIMALS = 1_000_000_000_000_000_000n;

export async function getAlith(api: ApiPromise, deployer: KeyringPair) {
    const [alith] = await ethers.getSigners();
    const alith32 = polkadotCryptoUtils.evmToAddress(
        alith.address, 5
    );
    await transferNative(api, alith32, deployer)
    return alith;
}

export async function deploySolidityContracts() {
    const ArithmeticContractSol = await ethers.getContractFactory("Arithmetic");
    const arithmeticContractSol = await ArithmeticContractSol.deploy();
    const ArithmeticContractSolAddress = await arithmeticContractSol.getAddress()

    const PowerContractSol = await ethers.getContractFactory("Power");
    const powerContractSol = await PowerContractSol.deploy();
    const PowerContractSolAddress = await powerContractSol.getAddress()

    return {arithmeticContractSol, ArithmeticContractSolAddress, powerContractSol, PowerContractSolAddress};
}

export async function LogTxWeight(api: ApiPromise, receipt, ArithmeticContractSolAddress: string, info: string) {
    const allRecords = await api.query.system.events();
    const blockHash = await api.rpc.chain.getBlockHash(receipt.blockNumber);
    const block = await api.rpc.chain.getBlock(blockHash);
    block.block.extrinsics.forEach((extrinsic, index) => {
        if (extrinsic.method.section === 'ethereum' && extrinsic.method.method === 'transact') {
            const {args} = extrinsic.method.toJSON();
            if (args.transaction.eip1559?.action?.call?.toLowerCase() === ArithmeticContractSolAddress.toLowerCase()) {
                const events = allRecords
                    .filter(({phase}) =>
                        phase.isApplyExtrinsic &&
                        phase.asApplyExtrinsic.eq(index)
                    )
                    .map(({event}) => `${event}`);

                events.forEach(e => {
                    const parsedObject = JSON.parse(e);
                    if (parsedObject.data && parsedObject.data[0] && parsedObject.data[0].weight) {
                        const weightObject = parsedObject.data[0].weight;
                        const refTime = weightObject.refTime;
                        const proofSize = weightObject.proofSize;

                        const trimmedString = `${info} | ref_time: ${formatNumberWithUnderscores(refTime)} | proof_size: ${formatNumberWithUnderscores(proofSize)}`;
                        console.log(trimmedString)
                    }
                })
            }
        }
    });
}

async function transferNative(api: ApiPromise, transfer_contract_account_id: any, alice: KeyringPair) {
    const unsub = await api.tx.balances.transferKeepAlive(transfer_contract_account_id, 1000n * DECIMALS)
        .signAndSend(alice, {nonce: -1}, ({status}) => {
            if (status.isFinalized) {
                unsub();
            }
        });
}

export async function LogTx(tx, api: ApiPromise, ArithmeticContractSolAddress: string, info: string) {
    const receipt = await tx.wait();

    await LogTxWeight(api, receipt, ArithmeticContractSolAddress, info);
}
