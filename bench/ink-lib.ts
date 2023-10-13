import {ApiPromise } from "@polkadot/api";
import {KeyringPair} from "@polkadot/keyring/types";
import fs from "fs";
import {Abi, CodePromise, ContractPromise} from "@polkadot/api-contract";
import type { Codec } from '@polkadot/types-codec/types';
import {formatNumberWithUnderscores} from "./helper";

const ARITHMETIC_CONTRACT = `/../target/ink/arithmetic/arithmetic.contract`

export async function waitFor(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function deployContracts(api: ApiPromise, deployer: KeyringPair) {
    const arithmeticContract: ContractPromise = await deployContract(api, deployer, ARITHMETIC_CONTRACT);
    return arithmeticContract;
}

export async function deployContract(api: ApiPromise, deployer: KeyringPair, path: string) {
    const contractRaw = JSON.parse(
        fs.readFileSync(__dirname + path, 'utf8'),
    );

    const contractAbi = new Abi(contractRaw);
    const estimatedGas = api.registry.createType(
        'WeightV2',
        {
            refTime: 300_000_000_000,
            proofSize: 3_000_000,
        });

    const code = new CodePromise(api, contractAbi, contractAbi.info.source.wasm);
    const tx = code.tx.new({gasLimit: estimatedGas})
    let address;
    let promise: ContractPromise;
    const unsub = await tx.signAndSend(deployer, {nonce: -1}, ({contract, status,}) => {
        if (status.isFinalized) {
            address = contract.address.toString();
            promise = new ContractPromise(api, contractAbi, address);
            unsub();
        }
    });

    while (promise == undefined) {
        // need to wait for contract to deploy
        await waitFor(1000);
    }
    return promise;
}

export async function callContract(maxGas: Codec, deployer: KeyringPair, contract: ContractPromise, fn: string, info: string, ...args) {
    await contract.tx[fn](
            {
                gasLimit: maxGas,
            }, args)
        .signAndSend(deployer, {nonce: -1}, result => {
            if (result.status.isInBlock) {
                // to log blockHacsh & txHash:
                // console.log(`${info} |  ${formatWithUnderscore(result.dispatchInfo?.weight.refTime.toString())} Blockhash: ${result.status.asInBlock.toHuman()} -- txHash: ${result.txHash.toHuman()}`)
                console.log(`${info} | ref_time: ${formatNumberWithUnderscores(result.dispatchInfo?.weight.refTime.toNumber())} | proof_size: ${formatNumberWithUnderscores(result.dispatchInfo?.weight.proofSize.toNumber())}`)
            }
        });
}