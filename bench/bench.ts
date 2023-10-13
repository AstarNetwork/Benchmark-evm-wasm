import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {callContractAndLog, deployContracts} from "./ink-lib";
import {deploySolidityContracts, getAlith, LogTx} from "./solidity-lib";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";

let alith: HardhatEthersSigner;

async function main(): Promise<void> {
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({provider: wsProvider});
    const keyring = new Keyring({type: 'sr25519'});
    const deployer = keyring.addFromUri('//Alice');
    const maxGas = api.registry.createType(
        'WeightV2',
        {
            refTime: 300_000_000_000,
            proofSize: 3_000_000,
        });

    alith = await getAlith(api, deployer);

    const {arithmeticContract, powerContract} = await deployContracts(api, deployer);
    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(1)', 1);
    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(100)', 100);
    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(1000)', 1000);
    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(10000)', 10000);

    await callContractAndLog(maxGas, deployer, powerContract, 'power', 'WASM | Power | power(1)', 1);
    await callContractAndLog(maxGas, deployer, powerContract, 'power', 'WASM | Power | power(50)', 50);
    await callContractAndLog(maxGas, deployer, powerContract, 'power', 'WASM | Power | power(100)', 100);

    const {
        arithmeticContractSol,
        ArithmeticContractSolAddress,
        powerContractSol,
        PowerContractSolAddress
    } = await deploySolidityContracts();

    const tx0 = await arithmeticContractSol.connect(alith).performArithmetic(1, {gasLimit: 10000000});
    await LogTx(tx0, api, ArithmeticContractSolAddress, 'EVM | Arithmetic |  performArithmetic(1) ');

    const tx1 = await arithmeticContractSol.connect(alith).performArithmetic(100, {gasLimit: 10000000});
    await LogTx(tx1, api, ArithmeticContractSolAddress, 'EVM | Arithmetic |  performArithmetic(100) ');

    const tx2 = await arithmeticContractSol.connect(alith).performArithmetic(1000, {gasLimit: 10000000});
    await LogTx(tx2, api, ArithmeticContractSolAddress, 'EVM | Arithmetic |  performArithmetic(1000) ');

    const tx3 = await arithmeticContractSol.connect(alith).performArithmetic(10000, {gasLimit: 10000000});
    await LogTx(tx3, api, ArithmeticContractSolAddress, 'EVM | Arithmetic |  performArithmetic(10000) ');

    const tx4 = await powerContractSol.connect(alith).power(1, {gasLimit: 10000000});
    await LogTx(tx4, api, PowerContractSolAddress, 'EVM | Power |  power(1) ');

    const tx5 = await powerContractSol.connect(alith).power(50, {gasLimit: 10000000});
    await LogTx(tx5, api, PowerContractSolAddress, 'EVM | Power |  power(50) ');

    const tx6 = await powerContractSol.connect(alith).power(100, {gasLimit: 10000000});
    await LogTx(tx6, api, PowerContractSolAddress, 'EVM | Power |  power(100) ');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});