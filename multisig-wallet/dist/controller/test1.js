"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBtcRequest = exports.createTaprootMultiSigWallet = exports.createMultiSigWallet = exports.createP2MSWallet_self = exports.createP2MSWallet = exports.createP2PKHwallet = void 0;
const bip371_1 = require("bitcoinjs-lib/src/psbt/bip371");
const psbt_service_1 = require("../service/psbt.service");
const function_1 = require("../utils/function");
const Multisig_1 = __importDefault(require("../model/Multisig"));
const config_1 = require("../config/config");
const TaprootModal_1 = __importDefault(require("../model/TaprootModal"));
const bitcoin = require("bitcoinjs-lib");
const schnorr = require("bip-schnorr");
const ECPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");
const fs = require("fs");
const { alice, bob, carol, dave } = require("./wallets.json");
const ECPair = ECPairFactory(ecc);
const network = config_1.TEST_MODE ? bitcoin.networks.testnet : bitcoin.networks.bitcoin; // Otherwise, bitcoin = mainnet and regnet = local
function createP2PKHwallet() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const field = ["alice", "bob", "carol", "dave"];
            const walletArr = {};
            for (let i = 0; i < 4; i++) {
                walletArr[field[i]] = [];
                for (let j = 0; j < 4; j++) {
                    const keyPair = ECPair.makeRandom({ network: network });
                    console.log("keyPair ==> ", keyPair);
                    console.log("keyPair.publicKey ==> ", keyPair.publicKey);
                    const { address } = bitcoin.payments.p2pkh({
                        pubkey: keyPair.publicKey,
                        network: network,
                    });
                    const privateKey = keyPair.toWIF();
                    const wallet = {
                        pubKey: keyPair.publicKey.toString("hex"),
                        address: address,
                        privateKey: privateKey,
                    };
                    walletArr[field[i]].push(wallet);
                }
            }
            const walletJSON = JSON.stringify(walletArr, null, 4);
            fs.writeFileSync("wallet.json", walletJSON);
            console.log("walletJSON ==> ", walletJSON);
            return walletArr;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.createP2PKHwallet = createP2PKHwallet;
function createP2MSWallet() {
    return __awaiter(this, void 0, void 0, function* () {
        const sendAmount = 300000;
        const p2ms = bitcoin.payments.p2ms({
            m: 2,
            pubkeys: [
                Buffer.from(alice[1].pubKey, "hex"),
                Buffer.from(bob[1].pubKey, "hex"),
                Buffer.from(carol[1].pubKey, "hex"),
                Buffer.from(dave[1].pubKey, "hex"),
            ],
            network,
        });
        console.log("Redeem script:");
        console.log(p2ms.output.toString("hex"));
        const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network });
        console.log("P2SH address");
        console.log(p2sh);
        console.log("P2SH address");
        console.log(p2sh.address);
        const psbt = new bitcoin.Psbt({ network });
        const usedUtxoIds = [];
        let total = 0;
        const utxos = yield (0, function_1.getUTXOByAddress)(p2sh.address);
        if (utxos.length == 0) {
            return "There is no UTXO in this address";
        }
        for (const element of utxos) {
            if (total < sendAmount + 40000 && element.value > 1000) {
                const utxo = utxos[0];
                usedUtxoIds.push(utxo.txid);
                total += utxo.value;
                const utxoHex = yield (0, function_1.getTxHexById)(utxo.txid);
                console.log("selected utxoHex ==> ", utxoHex);
                console.log("addInput ==> ", {
                    hash: utxo.txid,
                    index: utxo.vout,
                    redeemScript: p2sh.redeem.output,
                    nonWitnessUtxo: Buffer.from(utxoHex, "hex"),
                });
                yield psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    redeemScript: p2sh.redeem.output,
                    nonWitnessUtxo: Buffer.from(utxoHex, "hex"),
                });
            }
        }
        psbt.addOutput({
            address: "2N233U1vV9ybRDVyghxNWRxiFvens4M1ZTL",
            value: sendAmount,
        });
        const feeRate = 500;
        const fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
        console.log("fee ==> ", fee);
        psbt.addOutput({
            address: p2sh.address,
            value: total - fee - sendAmount,
        });
        console.log("output ==> ", {
            total,
            fee,
            sendAmount,
        });
        console.log("bitcoin.ECPair ==> ", ECPair);
        console.log("alice[1].wif ==> ", alice[1].wif);
        console.log("bitcoin.ECPair ==> ", ECPair);
        console.log("bob[1].wif ==> ", bob[1].wif);
        const keyPairAlice1 = ECPair.fromWIF(alice[1].wif, network);
        const keyPairBob1 = ECPair.fromWIF(bob[1].wif, network);
        console.log("keyPairAlice1 ==> ", keyPairAlice1);
        console.log("keyPairBob1 ==> ", keyPairBob1);
        yield psbt.signInput(0, keyPairAlice1);
        // await psbt.signInput(0, keyPairBob1)
        console.log("psbt ==> ", psbt);
        console.log("here ==> ");
        yield psbt.finalizeAllInputs();
        console.log("finalizeAllInputs ==> ");
        const rawTxHex = psbt.extractTransaction().toHex();
        console.log("Transaction hexadecimal:");
        console.log(rawTxHex);
        const txId = yield (0, psbt_service_1.pushRawTx)(rawTxHex);
        return txId;
    });
}
exports.createP2MSWallet = createP2MSWallet;
function createP2MSWallet_self() {
    return __awaiter(this, void 0, void 0, function* () {
        //  2NAjnUkVxAv34bnfpC1edhW5qstF2QHSUk5
        // 2N233U1vV9ybRDVyghxNWRxiFvens4M1ZTL
        const sendAmount = 2000;
        const p2ms = bitcoin.payments.p2ms({
            m: 2,
            pubkeys: [
                Buffer.from("03481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a86", "hex"),
                Buffer.from("03abb1b44f6526130e5b8b580b5f87f6a9668d6652ee336b282cb725be645aab6a", "hex"),
                Buffer.from("0332362069574f88b2960e6c9c3491521b01ef32d913ec0f8ce6940eb89b7f7ec2", "hex"),
            ],
            network,
        });
        console.log("Redeem script:");
        console.log(p2ms.output.toString("hex"));
        const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network });
        console.log("P2SH address");
        console.log(p2sh);
        console.log("P2SH address");
        console.log(p2sh.address);
        const psbt = new bitcoin.Psbt({ network });
        const usedUtxoIds = [];
        let total = 0;
        const utxos = yield (0, function_1.getUTXOByAddress)(p2sh.address);
        if (utxos.length == 0) {
            return "There is no UTXO in this address";
        }
        for (const element of utxos) {
            if (total < sendAmount + 25000 && element.value > 1000) {
                const utxo = utxos[0];
                usedUtxoIds.push(utxo.txid);
                total += utxo.value;
                const utxoHex = yield (0, function_1.getTxHexById)(utxo.txid);
                console.log("selected utxoHex ==> ", utxoHex);
                console.log("addInput ==> ", {
                    hash: utxo.txid,
                    index: utxo.vout,
                    redeemScript: p2sh.redeem.output,
                    nonWitnessUtxo: Buffer.from(utxoHex, "hex"),
                });
                yield psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    redeemScript: p2sh.redeem.output,
                    nonWitnessUtxo: Buffer.from(utxoHex, "hex"),
                });
            }
        }
        psbt.addOutput({
            address: "2N6XB5to1wSnxNnyDvDXd5KAPZkdJQqtQrF",
            value: sendAmount,
        });
        const feeRate = yield (0, psbt_service_1.getFeeRate)();
        const fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
        console.log("fee ==> ", fee);
        psbt.addOutput({
            address: p2sh.address,
            value: total - fee - sendAmount,
        });
        console.log("output ==> ", {
            total,
            fee,
            sendAmount,
        });
        return psbt.toHex();
        // const keyPairAlice1 = ECPair.fromWIF("cPfH4h3TTryoBA5gmXKBrf3Jkea4mg512fvTwHSwgS4zDGZDZD6h", network)
        // const keyPairBob1 = ECPair.fromWIF("cTKLTaJ9czvb4AgN7UxTY4uBrZu4wRpiDQyTEbmv7J9vgsQucL3p", network)
        // await psbt
        //     .signInput(0, keyPairAlice1)
        // .signInput(0, keyPairBob1)
        // const txId = await combinePsbt("70736274ff01007302000000016ae7257f2225aa4d863ed6fdc075be7a8b5852dcc6022c9179b60f391d44185c0100000000ffffffff02d00700000000000017a914919dddf68788737d374f02da1f0d195091029287876fb802000000000017a914606b5b79055c98437dd9a82565bc94f28d23236d8700000000000100fd7201020000000113a97f83f020b26ff33d3a1bf3c92f764ca0ebad5975f88a6fa42ec264ab71cf01000000fdfd000047304402204951397607109eba6627546df1c98466affea63ee6b4a329a69d27e78745b3c4022034c14c45db1fbd8ed9773361e1913706f1f033bac70d6388f040d2d29601f58e01483045022100acbeac2063f74932632a28dc68a7334f50ffabbfa55455db0a7c8cb53fbc555e02201e3a8c4b3bace0e4ea67a43e9c5cf62d1758bcead550c4e55133d0df274b9fe0014c69522103481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a862103abb1b44f6526130e5b8b580b5f87f6a9668d6652ee336b282cb725be645aab6a210332362069574f88b2960e6c9c3491521b01ef32d913ec0f8ce6940eb89b7f7ec253aeffffffff02d00700000000000017a914919dddf68788737d374f02da1f0d19509102928787ea5603000000000017a914606b5b79055c98437dd9a82565bc94f28d23236d8700000000010469522103481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a862103abb1b44f6526130e5b8b580b5f87f6a9668d6652ee336b282cb725be645aab6a210332362069574f88b2960e6c9c3491521b01ef32d913ec0f8ce6940eb89b7f7ec253ae000000",
        // "70736274ff01007302000000016ae7257f2225aa4d863ed6fdc075be7a8b5852dcc6022c9179b60f391d44185c0100000000ffffffff02d00700000000000017a914919dddf68788737d374f02da1f0d195091029287876fb802000000000017a914606b5b79055c98437dd9a82565bc94f28d23236d8700000000000100fd7201020000000113a97f83f020b26ff33d3a1bf3c92f764ca0ebad5975f88a6fa42ec264ab71cf01000000fdfd000047304402204951397607109eba6627546df1c98466affea63ee6b4a329a69d27e78745b3c4022034c14c45db1fbd8ed9773361e1913706f1f033bac70d6388f040d2d29601f58e01483045022100acbeac2063f74932632a28dc68a7334f50ffabbfa55455db0a7c8cb53fbc555e02201e3a8c4b3bace0e4ea67a43e9c5cf62d1758bcead550c4e55133d0df274b9fe0014c69522103481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a862103abb1b44f6526130e5b8b580b5f87f6a9668d6652ee336b282cb725be645aab6a210332362069574f88b2960e6c9c3491521b01ef32d913ec0f8ce6940eb89b7f7ec253aeffffffff02d00700000000000017a914919dddf68788737d374f02da1f0d19509102928787ea5603000000000017a914606b5b79055c98437dd9a82565bc94f28d23236d8700000000220203481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a8647304402202cd097f591758aed5cfd7740a26d167b612616947e7327ceffbab277d9beb546022057c798348e083b86b643bbdf7507efc2c1241a09ef0f8e741527e09b35d9df3d01010469522103481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a862103abb1b44f6526130e5b8b580b5f87f6a9668d6652ee336b282cb725be645aab6a210332362069574f88b2960e6c9c3491521b01ef32d913ec0f8ce6940eb89b7f7ec253ae000000",
        // "70736274ff01007302000000016ae7257f2225aa4d863ed6fdc075be7a8b5852dcc6022c9179b60f391d44185c0100000000ffffffff02d00700000000000017a914919dddf68788737d374f02da1f0d195091029287876fb802000000000017a914606b5b79055c98437dd9a82565bc94f28d23236d8700000000000100fd7201020000000113a97f83f020b26ff33d3a1bf3c92f764ca0ebad5975f88a6fa42ec264ab71cf01000000fdfd000047304402204951397607109eba6627546df1c98466affea63ee6b4a329a69d27e78745b3c4022034c14c45db1fbd8ed9773361e1913706f1f033bac70d6388f040d2d29601f58e01483045022100acbeac2063f74932632a28dc68a7334f50ffabbfa55455db0a7c8cb53fbc555e02201e3a8c4b3bace0e4ea67a43e9c5cf62d1758bcead550c4e55133d0df274b9fe0014c69522103481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a862103abb1b44f6526130e5b8b580b5f87f6a9668d6652ee336b282cb725be645aab6a210332362069574f88b2960e6c9c3491521b01ef32d913ec0f8ce6940eb89b7f7ec253aeffffffff02d00700000000000017a914919dddf68788737d374f02da1f0d19509102928787ea5603000000000017a914606b5b79055c98437dd9a82565bc94f28d23236d87000000000107fc0047304402202cd097f591758aed5cfd7740a26d167b612616947e7327ceffbab277d9beb546022057c798348e083b86b643bbdf7507efc2c1241a09ef0f8e741527e09b35d9df3d01473044022021d865e46160311898841dc3e610f924524d9072334f06275ca5c07081b5e38302207a7e892b8e626580bb525e10d91a91f7e2ee95c441af4b19aa9471f5240a6c37014c69522103481dd46ed4bfa803d6408a8294a678251a2869f8d24f0a0935899404b7f35a862103abb1b44f6526130e5b8b580b5f87f6a9668d6652ee336b282cb725be645aab6a210332362069574f88b2960e6c9c3491521b01ef32d913ec0f8ce6940eb89b7f7ec253ae000000");
        // await psbt.finalizeAllInputs()
        // const rawTxHex = psbt.extractTransaction().toHex();
        // const txId = await pushRawTx(rawTxHex);
        // return txId;
    });
}
exports.createP2MSWallet_self = createP2MSWallet_self;
function createMultiSigWallet(pubKeyList, minSignCount) {
    return __awaiter(this, void 0, void 0, function* () {
        const pubkeys = pubKeyList.map((pubkey) => Buffer.from(pubkey, "hex"));
        const p2ms = bitcoin.payments.p2ms({
            m: minSignCount,
            pubkeys,
            network,
        });
        const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network });
        return p2wsh.address;
    });
}
exports.createMultiSigWallet = createMultiSigWallet;
function createTaprootMultiSigWallet(leafPubkeys, threshold, assets, network) {
    return __awaiter(this, void 0, void 0, function* () {
        const checkDB = yield Multisig_1.default.findOne({
            cosigner: leafPubkeys,
        });
        if (checkDB)
            return {
                success: false,
                message: "This public key list is already used before.",
                payload: null,
            };
        if (leafPubkeys.length < 1) {
            throw new Error("Incorrect number of leaf public keys");
        }
        if (threshold > leafPubkeys.length || threshold <= 0) {
            throw new Error("Incorrect threshold");
        }
        let leafScriptAsm = `${(0, bip371_1.toXOnly)(Buffer.from(leafPubkeys[0], "hex")).toString(
        // let leafScriptAsm = `${(Buffer.from(leafPubkeys[0], "hex")).slice(1, 33).toString(
        "hex")} OP_CHECKSIG`;
        if (leafPubkeys.length > 1) {
            leafPubkeys
                .slice(1)
                .forEach((p) => (leafScriptAsm += ` ${(Buffer.from(p, "hex")).slice(1, 33).toString("hex")} OP_CHECKSIGADD`));
            leafScriptAsm += ` OP_${threshold} OP_NUMEQUAL`;
        }
        const leafScript = bitcoin.script.fromASM(leafScriptAsm);
        const scriptTree = {
            output: leafScript,
        };
        const redeem = {
            output: leafScript,
            redeemVersion: 192,
        };
        const muSig = schnorr.muSig;
        const convert = schnorr.convert;
        const pubKeyHash = muSig.computeEll(
        // leafPubkeys.map((p) => (Buffer.from(p, "hex")).slice(1, 33))
        leafPubkeys.map((p) => (0, bip371_1.toXOnly)(Buffer.from(p, "hex"))));
        const pkCombined = muSig.pubKeyCombine(
        // leafPubkeys.map((p) => (Buffer.from(p, "hex")).slice(1, 33)),
        leafPubkeys.map((p) => (0, bip371_1.toXOnly)(Buffer.from(p, "hex"))), pubKeyHash);
        const initialPubkey = convert.intToBuffer(pkCombined.affineX);
        const { output, address, witness } = bitcoin.payments.p2tr({
            internalPubkey: initialPubkey,
            scriptTree,
            redeem,
            network: network,
        });
        //   const result = bitcoin.payments.p2tr({
        //     internalPubkey: initialPubkey,
        //     scriptTree,
        //     redeem,
        //     network: network,
        //   });
        //   const { output, address, witness } = result;
        //   console.log("result ==> ", result);
        const cosigner = JSON.parse(JSON.stringify(leafPubkeys));
        const hexOutput = output.toString("hex");
        const hexWitness = witness.map((wit) => wit.toString("hex"));
        const hexInternalPublicKey = initialPubkey.toString("hex");
        const hexRedeem = Object.assign(Object.assign({}, redeem), { output: redeem.output.toString("hex") });
        const newMultisig = new TaprootModal_1.default({
            cosigner: cosigner,
            witnessScript: hexWitness,
            p2msOutput: hexOutput,
            address,
            internalPublicKey: hexInternalPublicKey,
            redeem: hexRedeem,
            threshold,
            assets,
        });
        console.log("newMultisig ==> ", newMultisig);
        yield newMultisig.save();
        return {
            success: true,
            message: "Created successfully",
            payload: {
                output,
                address,
                witness,
                internalPublicKey: hexInternalPublicKey,
                redeem,
            },
        };
    });
}
exports.createTaprootMultiSigWallet = createTaprootMultiSigWallet;
// export async function sendBtcRequest(multisigWalletAddress: string, pubkey: string, targetAddress: string, sendAmount: number) {
//     try {
//         const selectedMuSig = await MultisigModal.findOne({
//             address: multisigWalletAddress
//         })
//         const redeemScript = selectedMuSig?.redeem?.output;
//         const hexOutput = selectedMuSig?.output;
//         const psbt = new bitcoin.Psbt({ network });
//         const usedUtxoIds = [];
//         let total = 0;
//         const utxos = await getUTXOByAddress(multisigWalletAddress);
//         if (utxos.length == 0) {
//             return {
//                 success: false,
//                 message: "There is no UTXO in this address",
//                 psbt: null
//             }
//         }
//         console.log("utxo ==> ", utxos);
//         console.log("redeem script ==> ", redeemScript);
//         for (const element of utxos) {
//             if (total < sendAmount + 25000 && element.value > 1000 && redeemScript) {
//                 const utxo = utxos[0];
//                 usedUtxoIds.push(utxo.txid);
//                 total += utxo.value;
//                 // const utxoHex = await getTxHexById(utxo.txid);
//                 // console.log('selected utxoHex ==> ', utxoHex);
//                 // console.log('addInput ==> ', {
//                 //     hash: utxo.txid,
//                 //     index: utxo.vout,
//                 //     witnessUtxo: {
//                 //         value: Math.round(utxo.value),
//                 //         script: Buffer.from(hexOutput as string, "hex"),
//                 //     },
//                 //     tapInternalKey: toXOnly(Buffer.from(pubkey, "hex")),
//                 // });
//                 await psbt.addInput({
//                     hash: utxo.txid,
//                     index: utxo.vout,
//                     // redeemScript: Buffer.from(redeemScript, "hex"),
//                     // nonWitnessUtxo: Buffer.from(utxoHex, 'hex'),
//                     witnessUtxo: {
//                         value: Math.round(utxo.value),
//                         script: Buffer.from(hexOutput as string, "hex"),
//                     }
//                 })
//             }
//         }
//         psbt.addOutput({
//             address: targetAddress,
//             value: sendAmount,
//         })
//         const feeRate = await getFeeRate();
//         let fee = calculateTxFee(psbt, feeRate);
//         console.log("target Address ==> ", targetAddress);
//         console.log("sendAmount ==> ", typeof sendAmount);
//         console.log("total ==> ", total);
//         console.log("fee ==> ", fee);
//         fee = calculateTxFee(psbt, feeRate);
//         console.log("fee ==> ", fee);
//         console.log("total - fee - sendAmount ==> ", total - fee - sendAmount);
//         psbt.addOutput({
//             address: multisigWalletAddress,
//             value: total - fee - sendAmount,
//         })
//         // const keyPairAlice1 = ECPair.fromWIF("cPfH4h3TTryoBA5gmXKBrf3Jkea4mg512fvTwHSwgS4zDGZDZD6h", network)
//         // const keyPairBob1 = ECPair.fromWIF("cTKLTaJ9czvb4AgN7UxTY4uBrZu4wRpiDQyTEbmv7J9vgsQucL3p", network)
//         // await psbt
//         //     .signInput(0, keyPairAlice1)
//         //     .signInput(0, keyPairBob1)
//         // await psbt.finalizeAllInputs()
//         // const rawTxHex = psbt.extractTransaction().toHex();
//         // const txId = await pushRawTx(rawTxHex);
//         // return txId;
//         console.log("PSBT ==>")
//         console.log(JSON.stringify(psbt));
//         console.log("output ==> ", {
//             total,
//             fee,
//             sendAmount
//         })
//         return {
//             success: true,
//             message: "PSBT is created successfully",
//             psbt,
//         }
//     } catch (error: any) {
//         console.log("Something error", error);
//         return {
//             success: false,
//             message: "Something error",
//             psbt: null
//         }
//     }
// }
// export async function createNativeSegwit(originPubkeys: string[], threshold: number, assets: IAssets, network: Network) {
//     // let sendAmount = 1000;
//     // let destinationAddress = '2N6XB5to1wSnxNnyDvDXd5KAPZkdJQqtQrF';
//     const existMusigWallet = await MultisigModal.findOne({
//         cosigner:
//     })
//     const hexedPubkeys = originPubkeys.map(pubkey => Buffer.from(pubkey, 'hex'));
//     const p2ms = bitcoin.payments.p2ms({
//         m: threshold, pubkeys: hexedPubkeys, network
//     });
//     console.log('Witness script:')
//     console.log(p2ms.output.toString('hex'))
//     console.log('Witness script SHA256:')
//     console.log(bitcoin.crypto.sha256(p2ms.output).toString('hex'))
//     const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network })
//     console.log('P2WSH address')
//     console.log(p2wsh.address)
//     const newMultisigWallet = new MultisigModal({
//         cosigner: originPubkeys,
//         witnessScript: (p2wsh.redeem.output).toString('hex'),
//         p2msOutput: '0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'),
//         address: p2wsh.address,
//         threshold,
//         assets
//     })
//     await newMultisigWallet.save();
//     return {
//         witnessScript: (p2wsh.redeem.output).toString('hex'),
//         p2msOutput: '0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'),
//         address: p2wsh.address
//     }
//     // const psbt = new bitcoin.Psbt({ network })
//     // const usedUtxoIds = [];
//     // let total = 0;
//     // const utxos = await getUTXOByAddress(p2wsh.address);
//     // if (utxos.length == 0) {
//     //     return "There is no UTXO in this address"
//     // }
//     // console.log("before the for loop ==> ");
//     // p2wsh.redeem.output
//     // p2ms.output
//     // for (const utxo of utxos) {
//     //     if (total < sendAmount + 25000 && utxo.value > 1000) {
//     //         usedUtxoIds.push(utxo.txid);
//     //         total += utxo.value;
//     //         const utxoHex = await getTxHexById(utxo.txid);
//     //         console.log('selected utxoHex ==> ', utxoHex);
//     //         console.log('addInput ==> ', {
//     //             hash: utxo.txid,
//     //             index: utxo.vout,
//     //             witnessScript: p2wsh.redeem.output,
//     //             witnessUtxo: {
//     //                 script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
//     //                 value: utxo.value,
//     //             }
//     //         });
//     //         await psbt.addInput({
//     //             hash: utxo.txid,
//     //             index: utxo.vout,
//     //             witnessScript: p2wsh.redeem.output,
//     //             witnessUtxo: {
//     //                 script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
//     //                 value: utxo.value,
//     //             }
//     //         })
//     //     }
//     // }
//     // psbt.addOutput({
//     //     address: destinationAddress,
//     //     value: sendAmount,
//     // })
//     // const feeRate = await getFeeRate();
//     // const fee = calculateTxFee(psbt, feeRate);
//     // console.log("feeRate ==> ", feeRate);
//     // console.log("fee ==> ", fee);
//     // psbt.addOutput({
//     //     address: p2wsh.address,
//     //     value: total - fee - sendAmount,
//     // })
//     // console.log("output ==> ", {
//     //     total,
//     //     fee,
//     //     sendAmount
//     // })
//     // console.log("psbt.toHex() ==> ", psbt.toHex());
//     // return psbt.toHex();
// }
// Verify
const sendBtcRequest = (multisigWalletAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedMuSig = yield TaprootModal_1.default.findOne({
        address: multisigWalletAddress,
    });
    if (!selectedMuSig)
        return {
            success: false,
            message: "There is no multisig wallet here",
            payload: null,
        };
    const witnessScript = selectedMuSig.witnessScript;
    const hexOutput = selectedMuSig.p2msOutput;
    const redeem = selectedMuSig.redeem;
    const internalPublicKey = selectedMuSig.internalPublicKey;
    if (!redeem)
        return {
            success: true,
            message: "Generate PSBT successfully",
            payload: null,
        };
    const utxos = yield (0, function_1.getUTXOByAddress)(multisigWalletAddress);
    if (utxos.length == 0) {
        return {
            success: false,
            message: "There is no UTXO in this address",
            psbt: null,
        };
    }
    console.log("internalPublicKey ==> ", internalPublicKey);
    const psbt = new bitcoin.Psbt({ network });
    psbt.addInput({
        hash: utxos[0].txid,
        index: utxos[0].vout,
        witnessUtxo: {
            value: utxos[0].value,
            script: Buffer.from(hexOutput, "hex"),
        },
        tapInternalKey: (0, bip371_1.toXOnly)(Buffer.from(internalPublicKey, "hex")),
        tapLeafScript: [
            {
                leafVersion: 192,
                script: Buffer.from(redeem.output, "hex"),
                controlBlock: Buffer.from(witnessScript[witnessScript.length - 1], "hex"), // extract control block from witness data
            },
        ],
    });
    psbt.addOutput({
        address: "tb1puda8c4zhmzrnmwz56zhsctdqgxksvsvhy24n6y9trjtkq3scquksvlld50",
        value: utxos[0].value - 4500,
    });
    return {
        success: true,
        message: "Generate PSBT successfully",
        payload: psbt.toHex(),
    };
});
exports.sendBtcRequest = sendBtcRequest;
