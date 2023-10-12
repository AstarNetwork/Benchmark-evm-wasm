import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {Abi, ContractPromise, CodePromise} from '@polkadot/api-contract';
import {ethers } from "hardhat";
import * as polkadotCryptoUtils from "@polkadot/util-crypto";
import * as fs from "fs";
import {callContract, deployContracts} from "./ink-lib";
import {transferNative} from "./solidity-lib";
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


arithmeticContract = await deployContracts(api, deployer);
await callContract(maxGas, deployer, arithmeticContract, 'performArithmetic', 1000);

const [alith] = await ethers.getSigners();
const alith32 = polkadotCryptoUtils.evmToAddress(
    alith.address , 5
);
await transferNative(api, alith32, deployer)


const ArithmeticContractSol = await ethers.getContractFactory("Arithmetic");
const arithmeticContractSol = await ArithmeticContractSol.deploy();

const ArithmeticContractSolAddress = await arithmeticContractSol.getAddress()
console.log(ArithmeticContractSolAddress)

const tx = await arithmeticContractSol.connect(alith).performArithmetic(1000, {gasLimit: 3000000});
const receipt = await tx.wait();
 const allRecords = await api.query.system.events();
 const blockHash = await api.rpc.chain.getBlockHash(receipt.blockNumber);
 const block = await api.rpc.chain.getBlock(blockHash);
 block.block.extrinsics.forEach((extrinsic, index) => {
  if (extrinsic.method.section === 'ethereum' && extrinsic.method.method === 'transact') {
   const { args } = extrinsic.method.toJSON();
   if (args.transaction.eip1559?.action?.call?.toLowerCase() === ArithmeticContractSolAddress.toLowerCase()) {
    const events = allRecords
        .filter(({ phase }) =>
            phase.isApplyExtrinsic &&
            phase.asApplyExtrinsic.eq(index)
        )
        .map(({ event }) => `${event}`);

    events.forEach(e => {
     const parsedObject = JSON.parse(e);

     if (parsedObject.data && parsedObject.data[0] && parsedObject.data[0].weight) {
      const weightObject = parsedObject.data[0].weight;
      const refTime = weightObject.refTime;
      const proofSize = weightObject.proofSize;

      const trimmedString = `"refTime":${refTime},"proofSize":${proofSize}`;
      console.log(trimmedString)
     }
    })
   }
  }
 });

}

main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});