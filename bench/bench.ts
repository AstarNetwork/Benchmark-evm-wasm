import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {callContractAndLog, callContractNoLog, deployContracts} from "./ink-lib";
import {deploySolidityContracts, getAlith, LogTx} from "./solidity-lib";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import {formatNumberWithUnderscores} from "./helper";

let alith: HardhatEthersSigner;

async function main(): Promise<void> {
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({provider: wsProvider});
    const keyring = new Keyring({type: 'sr25519'});
    const deployer = keyring.addFromUri('//Alice');
    const maxGas = api.registry.createType(
        'WeightV2',
        {
            //"refT  224_417_168_051
            refTime: 300_000_000_000,
            // "proof  2_107_538
            proofSize: 3_000_000,
        });

    alith = await getAlith(api, deployer);

    const {arithmeticContract, powerContract, psp22Contract, callerContract} = await deployContracts(api, deployer);

    await callContractNoLog(maxGas, deployer, psp22Contract, 'psp22::transfer', '', callerContract.address, '10000000', '');

    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(1)', 1);
    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(100)', 100);
    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(1000)', 1000);
    await callContractAndLog(maxGas, deployer, arithmeticContract, 'performArithmetic', 'WASM | Arithmetic | perform_arithmetic(10000)', 10000);

    await callContractAndLog(maxGas, deployer, powerContract, 'power', 'WASM | Power | power(1)', 1);
    await callContractAndLog(maxGas, deployer, powerContract, 'power', 'WASM | Power | power(50)', 50);
    await callContractAndLog(maxGas, deployer, powerContract, 'power', 'WASM | Power | power(100)', 100);

    await callContractAndLog(maxGas, deployer, callerContract, 'ccall', 'WASM | CrossContract | ccall(1)', psp22Contract.address, deployer.address, 10, 1);
    await callContractAndLog(maxGas, deployer, callerContract, 'ccall', 'WASM | CrossContract | ccall(10)', psp22Contract.address, deployer.address, 10, 10);
    await callContractAndLog(maxGas, deployer, callerContract, 'ccall', 'WASM | CrossContract | ccall(100)', psp22Contract.address, deployer.address, 10, 100);

    const {
        arithmeticContractSol,
        ArithmeticContractSolAddress,
        powerContractSol,
        PowerContractSolAddress,
        erc20ContractSol,
        Erc20ContractSolAddress,
        callerContractSol,
        CallerContractSolAddress
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

    // transfer erc20 tokens to the contract so alith can call trasnfer in caller contract
    const tx7 = await erc20ContractSol.connect(alith).transfer(CallerContractSolAddress, "1000000" ,{gasLimit: 10000000});
    await tx7.wait();

    const tx8 = await callerContractSol.connect(alith).ccall(Erc20ContractSolAddress, alith, 10, 1, {gasLimit: 10000000});
    await LogTx(tx8, api, CallerContractSolAddress, 'EVM | CrossContract |  ccall(1) ');

    const tx9 = await callerContractSol.connect(alith).ccall(Erc20ContractSolAddress, alith, 10, 10, {gasLimit: 10000000});
    await LogTx(tx9, api, CallerContractSolAddress, 'EVM | CrossContract |  ccall(10) ');

    const tx10 = await callerContractSol.connect(alith).ccall(Erc20ContractSolAddress, alith, 10, 100, {gasLimit: 10000000});
    await LogTx(tx10, api, CallerContractSolAddress, 'EVM | CrossContract |  ccall(100) ');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});