import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {Abi, ContractPromise, CodePromise} from '@polkadot/api-contract';
import {ethers } from "hardhat";
import * as polkadotCryptoUtils from "@polkadot/util-crypto";
import * as fs from "fs";
import {callContract, deployContracts} from "./ink-lib";
import {getAlith, deploySolidityContracts, LogTxWeight} from "./solidity-lib";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import { expect } from "chai";

let arithmeticContract: ContractPromise;
let arithmeticContractSol: any
let alith: HardhatEthersSigner;

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

 alith = await getAlith(api, deployer);

arithmeticContract = await deployContracts(api, deployer);
await callContract(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(1000)' ,1000);

const { arithmeticContractSol, ArithmeticContractSolAddress}  = await deploySolidityContracts();


const tx = await arithmeticContractSol.connect(alith).performArithmetic(1000, {gasLimit: 3000000});
const receipt = await tx.wait();

await LogTxWeight(api, receipt, ArithmeticContractSolAddress, 'EVM | Arithmetic |  performArithmetic(1000) ');

}

main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});