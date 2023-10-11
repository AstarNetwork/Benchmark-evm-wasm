import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {Abi, ContractPromise, CodePromise} from '@polkadot/api-contract';
import * as fs from "fs";
import {callContract, deployContracts} from "./ink-lib";

let arithmeticContract: ContractPromise;

async function main(): Promise<void> {
const wsProvider = new WsProvider('ws://127.0.0.1:9944');
const api = await ApiPromise.create({ provider: wsProvider });
const keyring = new Keyring({ type: 'sr25519' });
const deployer = keyring.addFromUri('//Alice');
const maxGas = api.registry.createType(
    'WeightV2',
    {
        refTime: 300_000_000_000,
        proofSize: 3_000_000,
    });


arithmeticContract = await deployContracts(api, deployer);
await callContract(maxGas, deployer, arithmeticContract, 'performArithmetic', 1000);
}

main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});