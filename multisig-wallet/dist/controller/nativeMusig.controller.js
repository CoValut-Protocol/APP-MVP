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
exports.sendRuneController = exports.sendBtcController = exports.getBtcAndRuneByAddressController = exports.transferAllAssets = exports.transferAllAssets_temp = exports.reCreateNativeSegwit = exports.makeRequest = exports.loadOneMusigWallets = exports.loadAllMusigWallets = exports.createNativeSegwit = void 0;
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const psbt_service_1 = require("../service/psbt.service");
const function_1 = require("../utils/function");
const Multisig_1 = __importDefault(require("../model/Multisig"));
const RequestModal_1 = __importDefault(require("../model/RequestModal"));
const runelib_1 = require("runelib");
const TempMultisig_1 = __importDefault(require("../model/TempMultisig"));
const config_1 = require("../config/config");
const axios_1 = __importDefault(require("axios"));
const ecpair_1 = require("ecpair");
const TaprootMultisig_1 = __importDefault(require("../model/TaprootMultisig"));
const bitcoin = require("bitcoinjs-lib");
const schnorr = require("bip-schnorr");
const ECPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");
const ECPair = ECPairFactory(ecc);
const network = config_1.TEST_MODE ? bitcoin.networks.testnet : bitcoin.networks.bitcoin; // Otherwise, bitcoin = mainnet and regnet = local
function createNativeSegwit(originPubkeys, threshold, assets, network, imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existMusigWallet = yield Multisig_1.default.findOne({
                cosigner: originPubkeys,
            });
            if (existMusigWallet)
                return {
                    success: false,
                    message: "These public key pair is already existed.",
                    payload: null,
                };
            const hexedPubkeys = originPubkeys.map((pubkey) => Buffer.from(pubkey, "hex"));
            const p2ms = bitcoin.payments.p2ms({
                m: parseInt(threshold.toString()),
                pubkeys: hexedPubkeys,
                network,
            });
            const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network });
            const newMultisigWallet = new Multisig_1.default({
                cosigner: originPubkeys,
                witnessScript: p2wsh.redeem.output.toString("hex"),
                p2msOutput: "0020" + bitcoin.crypto.sha256(p2ms.output).toString("hex"),
                address: p2wsh.address,
                threshold,
                assets,
                imageUrl,
            });
            yield newMultisigWallet.save();
            console.log("created newMultisigWallet ==> ", newMultisigWallet._id.toString());
            return {
                success: true,
                message: "Create Musig Wallet successfully.",
                payload: {
                    DBID: newMultisigWallet._id.toString(),
                    address: p2wsh.address,
                },
            };
        }
        catch (error) {
            console.log("error in creating segwit address ==> ", error);
            return {
                success: false,
                message: "There is something error",
                payload: null,
            };
        }
    });
}
exports.createNativeSegwit = createNativeSegwit;
function loadAllMusigWallets() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allMuwallets = yield Multisig_1.default.find();
            let message = "";
            if (!allMuwallets.length)
                message = "There is no multisig wallet.";
            else
                message = "Fetch all multisig wallet successfully";
            return {
                success: true,
                message,
                payload: allMuwallets,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error,
                payload: null,
            };
        }
    });
}
exports.loadAllMusigWallets = loadAllMusigWallets;
function loadOneMusigWallets(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const oneMuwallets = yield Multisig_1.default.findById(id);
            if (oneMuwallets)
                return {
                    success: true,
                    message: "Native Segwit Vault is fetched successfully.",
                    payload: oneMuwallets,
                };
            const oneTaprootVault = yield TaprootMultisig_1.default.findById(id);
            if (oneTaprootVault)
                return {
                    success: true,
                    message: "Taproot Vault is fetched successfully.",
                    payload: oneTaprootVault,
                };
            return {
                success: false,
                message: "Not Found.",
                payload: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error,
                payload: null,
            };
        }
    });
}
exports.loadOneMusigWallets = loadOneMusigWallets;
function makeRequest(id, transferAmount, destinationAddress, ordinalAddress, pubKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const MusigWallet = yield Multisig_1.default.findById(id);
        if (!MusigWallet)
            return {
                success: false,
                message: "Not Found Multisig wallet.",
            };
        const { witnessScript, p2msOutput, address, threshold, cosigner, assets } = MusigWallet;
        const pubkeyAllowed = cosigner.findIndex((key) => key == pubKey);
        if (pubkeyAllowed < 0)
            return {
                success: false,
                message: "Not allowed pubkey.",
            };
        if (!assets)
            return {
                success: false,
                message: "Not Found Multisig Assets.",
            };
        if (!assets.runeName && !assets.runeAmount)
            return {
                success: false,
                message: "Not Found Multisig Assets.",
            };
        const assetsAllowed = yield (0, function_1.checkingAssets)(ordinalAddress, assets.runeName, parseInt(assets.runeAmount));
        if (!assetsAllowed)
            return {
                success: false,
                message: "Not have enough assets in this address",
            };
        const psbt = new bitcoin.Psbt({ network });
        const usedUtxoIds = [];
        let total = 0;
        const utxos = yield (0, function_1.getUTXOByAddress)(address);
        if (utxos.length == 0) {
            return "There is no UTXO in this address";
        }
        for (const utxo of utxos) {
            if (total < transferAmount + 25000 && utxo.value > 1000) {
                usedUtxoIds.push(utxo.txid);
                total += utxo.value;
                const utxoHex = yield (0, function_1.getTxHexById)(utxo.txid);
                console.log("selected utxoHex ==> ", utxoHex);
                console.log("addInput ==> ", {
                    hash: utxo.txid,
                    index: utxo.vout,
                    witnessScript: Buffer.from(witnessScript, "hex"),
                    witnessUtxo: {
                        script: Buffer.from(p2msOutput, "hex"),
                        value: utxo.value,
                    },
                });
                yield psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    witnessScript: Buffer.from(witnessScript, "hex"),
                    witnessUtxo: {
                        script: Buffer.from(p2msOutput, "hex"),
                        value: utxo.value,
                    },
                });
            }
        }
        psbt.addOutput({
            address: destinationAddress,
            value: transferAmount,
        });
        // const feeRate = await getFeeRate();
        const feeRate = 300;
        const fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
        console.log("feeRate ==> ", feeRate);
        console.log("fee ==> ", fee);
        psbt.addOutput({
            address: address,
            value: total - fee - transferAmount,
        });
        const newRequest = new RequestModal_1.default({
            musigId: MusigWallet._id,
            type: "Tranfer" /* RequestType.Tranfer */,
            transferAmount,
            destinationAddress,
            creator: ordinalAddress,
            cosigner,
            signedCosigner: [],
            psbt: [psbt.toHex()],
            threshold,
            assets,
            pending: "",
        });
        yield newRequest.save();
        console.log("psbt.toHex() ==> ", psbt.toHex());
        return psbt.toHex();
    });
}
exports.makeRequest = makeRequest;
// export async function makeBtcRequest(
//   psbt: string,
//   signedPsbt: string,
//   vaultId: string,
//   ticker: string,
//   transferAmount: number,
//   destinationAddress: string,
//   creator: string,
//   paymentPublicKey: string
// ) {
//   const MusigWallet = await MultisigModal.findById(vaultId);
//   if (!MusigWallet)
//     return {
//       success: false,
//       message: "Not Found Multisig wallet.",
//     };
//   const { witnessScript, p2msOutput, address, threshold, cosigner, assets } =
//     MusigWallet;
//   const pubkeyAllowed = cosigner.findIndex((key: string) => key == paymentPublicKey);
//   if (pubkeyAllowed < 0)
//     return {
//       success: false,
//       message: "Not allowed paymentPublicKey.",
//     };
//   if (!assets)
//     return {
//       success: false,
//       message: "Not Found Multisig Assets.",
//     };
//   if (!assets.runeName && !assets.runeAmount)
//     return {
//       success: false,
//       message: "Not Found Multisig Assets.",
//     };
//   const newRequest = new RequestModal({
//     musigId: vaultId,
//     type: RequestType.Tranfer,
//     transferAmount,
//     destinationAddress,
//     creator,
//     cosigner,
//     signedCosigner: [],
//     psbt: [psbt.toHex()],
//     threshold,
//     assets: {
//       tokenName: assets.runeName,
//       tokenAmount: assets.runeAmount,
//     },
//     pending: "",
//   });
//   await newRequest.save();
//   console.log("psbt.toHex() ==> ", psbt.toHex());
//   return psbt.toHex();
// }
function reCreateNativeSegwit(originPubkeys, threshold, assets, network, vaultId, imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("reCreateNativeSegwit ==> ");
            const existMusigWallet = yield Multisig_1.default.findOne({
                cosigner: originPubkeys,
            });
            console.log("existMusigWallet ==> ", existMusigWallet);
            console.log("existMusigWallet ==> ", existMusigWallet === null || existMusigWallet === void 0 ? void 0 : existMusigWallet._id);
            console.log("vaultId ==> ", vaultId);
            if (existMusigWallet && existMusigWallet._id != vaultId) {
                console.log("These public key pair is already existed in other wallets.");
                return {
                    success: false,
                    message: "These public key pair is already existed in other wallets.",
                    payload: null,
                };
            }
            console.log("vaultId ==> ", vaultId);
            const hexedPubkeys = originPubkeys.map((pubkey) => Buffer.from(pubkey, "hex"));
            const p2ms = bitcoin.payments.p2ms({
                m: parseInt(threshold.toString()),
                pubkeys: hexedPubkeys,
                network,
            });
            const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network });
            console.log("p2wsh ==> ", p2wsh);
            const newMultisigWallet = new TempMultisig_1.default({
                cosigner: originPubkeys,
                witnessScript: p2wsh.redeem.output.toString("hex"),
                p2msOutput: "0020" + bitcoin.crypto.sha256(p2ms.output).toString("hex"),
                address: p2wsh.address,
                threshold,
                assets,
                imageUrl,
            });
            yield newMultisigWallet.save();
            return {
                success: true,
                message: "Create Musig Wallet temporary.",
                payload: newMultisigWallet,
            };
            // Make the request
        }
        catch (error) {
            console.log("When create the Musig wallet ==> ", error);
            return {
                success: false,
                message: "There is something error",
                payload: null,
            };
        }
    });
}
exports.reCreateNativeSegwit = reCreateNativeSegwit;
function transferAllAssets_temp(oldAddress, destinationAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(oldAddress, destinationAddress);
            const btcUtxos = yield (0, psbt_service_1.getBtcUtxoByAddress)(oldAddress);
            const runeIdList = yield (0, psbt_service_1.getAllRuneIdList)(oldAddress);
            const psbt = new bitcoinjs_lib_1.Psbt({ network });
            // Rune utxo input
            for (const runeId of runeIdList) {
                // console.log("BTCUtxos ==>", btcUtxos);
                const runeUtxos = yield (0, psbt_service_1.getRuneUtxoByAddress)(oldAddress, runeId);
                console.log("runeUtxos ======>", runeUtxos.runeUtxos);
                const runeBlockNumber = parseInt(runeId.split(":")[0]);
                const runeTxout = parseInt(runeId.split(":")[1]);
                const edicts = [];
                let tokenSum = 0;
                // create rune utxo input && edict
                for (const runeutxo of runeUtxos.runeUtxos) {
                    psbt.addInput({
                        hash: runeutxo.txid,
                        index: runeutxo.vout,
                        // tapInternalKey: Buffer.from(pubkey, "hex").slice(1, 33),
                        witnessUtxo: {
                            value: runeutxo.value,
                            script: Buffer.from(runeutxo.scriptpubkey, "hex"),
                        },
                    });
                    tokenSum += runeutxo.amount * Math.pow(10, runeutxo.divisibility);
                }
                console.log("Typeof runeBlockNumber ==> ", typeof runeBlockNumber);
                console.log("Typeof runeTxout ==> ", typeof runeTxout);
                console.log("tokenSum ==> ", tokenSum);
                edicts.push({
                    id: new runelib_1.RuneId(runeBlockNumber, runeTxout),
                    amount: parseInt(tokenSum.toString()),
                    output: 1,
                });
                console.log("tokenSum ==> ", tokenSum);
                console.log("transferAmount ==> ", edicts);
                const mintstone = new runelib_1.Runestone(edicts, (0, runelib_1.none)(), (0, runelib_1.none)(), (0, runelib_1.none)());
                psbt.addOutput({
                    script: mintstone.encipher(),
                    value: 0,
                });
                // add rune receiver address
                psbt.addOutput({
                    address: destinationAddress,
                    value: 546,
                });
            }
            // add btc utxo input
            let totalBtcAmount = 0;
            for (const btcutxo of btcUtxos) {
                if (btcutxo.value > 546) {
                    totalBtcAmount += btcutxo.value;
                    psbt.addInput({
                        hash: btcutxo.txid,
                        index: btcutxo.vout,
                        // tapInternalKey: Buffer.from(pubkey, "hex").slice(1, 33),
                        witnessUtxo: {
                            script: Buffer.from(btcutxo.scriptpubkey, "hex"),
                            value: btcutxo.value,
                        },
                    });
                }
            }
            const feeRate = yield (0, psbt_service_1.getFeeRate)();
            const fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate) * 1.2;
            console.log("Pay Fee =====================>", fee);
            if (totalBtcAmount < fee)
                throw "BTC balance is not enough for pay fee";
            console.log("totalBtcAmount ====>", totalBtcAmount);
            psbt.addOutput({
                address: destinationAddress,
                value: totalBtcAmount - fee,
            });
            console.log("psbt ============>", psbt.toHex());
            return {
                psbtHex: psbt.toHex(),
                psbtBase64: psbt.toBase64(),
            };
        }
        catch (error) {
            console.log("error ==> ", error);
        }
    });
}
exports.transferAllAssets_temp = transferAllAssets_temp;
function transferAllAssets(oldVault, newVault, ordinalAddress) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        console.log("transferAllAssets ==> ");
        const oldAddress = oldVault.address;
        const destinationAddress = newVault.address;
        const thresHoldValue = oldVault.threshold;
        const { witnessScript, p2msOutput } = oldVault;
        console.log(oldAddress, destinationAddress);
        const btcUtxos = yield (0, psbt_service_1.getBtcUtxoByAddress)(oldAddress);
        const runeIdList = yield (0, psbt_service_1.getAllRuneIdList)(oldAddress);
        if (!btcUtxos.length && !runeIdList.length) {
            TempMultisig_1.default.findByIdAndDelete(newVault._id);
            throw "There is no any BTC in vault for updating.";
        }
        const psbt = new bitcoinjs_lib_1.Psbt({ network });
        // Rune utxo input
        for (const runeId of runeIdList) {
            const runeUtxos = yield (0, psbt_service_1.getRuneUtxoByAddress)(oldAddress, runeId);
            console.log("runeUtxos ======>", runeUtxos.runeUtxos);
            // create rune utxo input && edict
            for (const runeutxo of runeUtxos.runeUtxos) {
                psbt.addInput({
                    hash: runeutxo.txid,
                    index: runeutxo.vout,
                    witnessScript: Buffer.from(witnessScript, "hex"),
                    witnessUtxo: {
                        script: Buffer.from(p2msOutput, "hex"),
                        value: runeutxo.value,
                    },
                });
                psbt.addOutput({
                    address: destinationAddress,
                    value: runeutxo.value,
                });
            }
        }
        // add btc utxo input
        let totalBtcAmount = 0;
        for (const btcutxo of btcUtxos) {
            if (btcutxo.value > 546) {
                totalBtcAmount += btcutxo.value;
                psbt.addInput({
                    hash: btcutxo.txid,
                    index: btcutxo.vout,
                    witnessScript: Buffer.from(witnessScript, "hex"),
                    witnessUtxo: {
                        script: Buffer.from(p2msOutput, "hex"),
                        value: btcutxo.value,
                    },
                });
            }
        }
        const feeRate = Math.floor(yield (0, psbt_service_1.getFeeRate)());
        console.log("feeRate ==> ", feeRate);
        // console.log("psbt ==> ", psbt);
        psbt.addOutput({
            address: config_1.SERVICE_FEE_ADDRESS,
            value: config_1.SERVICE_FEE,
        });
        const fee = (0, psbt_service_1.transferAllAssetsFeeCalc)(psbt, feeRate, thresHoldValue);
        console.log("Pay Fee ==>", fee);
        if (totalBtcAmount < fee) {
            TempMultisig_1.default.findByIdAndDelete(newVault._id);
            throw "BTC balance is not enough for pay fee";
        }
        console.log("totalBtcAmount ====>", totalBtcAmount);
        psbt.addOutput({
            address: destinationAddress,
            value: totalBtcAmount - config_1.SERVICE_FEE - fee,
        });
        console.log("psbt ==> ");
        console.log(psbt);
        console.log("psbt ============>", psbt.toHex());
        // Make the request
        const newRequest = new RequestModal_1.default({
            musigId: oldVault._id,
            type: "VaultUpgrade" /* RequestType.VaultUpgrade */,
            transferAmount: "ALL",
            destinationAddress,
            creator: ordinalAddress,
            signedCosigner: [],
            cosigner: oldVault.cosigner,
            psbt: [psbt.toHex()],
            threshold: oldVault.threshold,
            assets: {
                initialPrice: (_a = oldVault.assets) === null || _a === void 0 ? void 0 : _a.initialPrice,
                runeName: (_b = oldVault.assets) === null || _b === void 0 ? void 0 : _b.runeName,
                runeAmount: (_c = oldVault.assets) === null || _c === void 0 ? void 0 : _c.runeAmount,
                runeSymbol: (_d = oldVault.assets) === null || _d === void 0 ? void 0 : _d.runeSymbol,
                creatorAddress: (_e = oldVault.assets) === null || _e === void 0 ? void 0 : _e.creatorAddress,
            },
            pending: "",
        });
        yield newRequest.save();
        return {
            psbtHex: psbt.toHex(),
            psbtBase64: psbt.toBase64(),
        };
    });
}
exports.transferAllAssets = transferAllAssets;
function getBtcAndRuneByAddressController(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const btcUrl = `${config_1.OPENAPI_UNISAT_URL}/v1/indexer/address/${address}/balance`;
        console.log("url ==> ", btcUrl);
        const config = {
            headers: {
                Authorization: `Bearer ${config_1.OPENAPI_UNISAT_TOKEN}`,
            },
        };
        const btcBalance = (yield axios_1.default.get(btcUrl, config)).data.data.btcSatoshi;
        console.log("btcBalance ==> ", btcBalance);
        const runeUrl = `${config_1.OPENAPI_UNISAT_URL}/v1/indexer/address/${address}/runes/balance-list?start=0&limit=500`;
        console.log("url ==> ", runeUrl);
        const runeBalance = (yield axios_1.default.get(runeUrl, config)).data.data.detail;
        console.log("runeBalance ==> ", runeBalance);
        return {
            btcBalance,
            runeBalance,
        };
    });
}
exports.getBtcAndRuneByAddressController = getBtcAndRuneByAddressController;
function sendBtcController(walletId, destination, amount, paymentAddress, pubKey) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("walletId ==> ", walletId);
        console.log("destination ==> ", destination);
        console.log("amount ==> ", amount);
        const multisigVault = yield Multisig_1.default.findById(walletId);
        if (!multisigVault)
            return {
                success: false,
                message: "Not Found Multisig wallet.",
            };
        const { witnessScript, p2msOutput, address, threshold, cosigner, assets } = multisigVault;
        const psbt = new bitcoinjs_lib_1.Psbt({
            network: config_1.TEST_MODE ? ecpair_1.networks.testnet : ecpair_1.networks.bitcoin,
        });
        if (!multisigVault)
            return {
                success: false,
                message: "There is no wallet with this id.",
                payload: null,
            };
        if (!assets)
            return {
                success: false,
                message: "Not Found Multisig Assets.",
            };
        const btcUtxos = yield (0, psbt_service_1.getBtcUtxoByAddress)(multisigVault.address);
        console.log("btcUtxos ==> ", btcUtxos);
        const feeRate = (yield (0, psbt_service_1.getFeeRate)()) + 5;
        let totalBtcAmount = 0;
        let fee = 0;
        for (const btcutxo of btcUtxos) {
            fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
            if (totalBtcAmount < fee + amount * 1 && btcutxo.value > 1000) {
                totalBtcAmount += btcutxo.value;
                psbt.addInput({
                    hash: btcutxo.txid,
                    index: btcutxo.vout,
                    witnessScript: Buffer.from(witnessScript, "hex"),
                    witnessUtxo: {
                        script: Buffer.from(p2msOutput, "hex"),
                        value: btcutxo.value,
                    },
                });
            }
        }
        console.log("totalBtcAmount ==> ", totalBtcAmount);
        console.log("fee ==> ", fee);
        console.log("amount ==> ", amount);
        console.log("fee + amount*1 ==> ", fee + amount * 1);
        if (totalBtcAmount < fee + amount * 1)
            throw "BTC balance is not enough";
        psbt.addOutput({
            address: destination,
            value: amount * 1,
        });
        fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
        psbt.addOutput({
            address: multisigVault.address,
            value: totalBtcAmount - amount - fee,
        });
        console.log("paymentAddress ==> ", paymentAddress);
        const newRequest = new RequestModal_1.default({
            musigId: walletId,
            type: "Tranfer" /* RequestType.Tranfer */,
            transferAmount: amount,
            destinationAddress: destination,
            creator: paymentAddress,
            cosigner,
            signedCosigner: [],
            psbt: [psbt.toHex()],
            threshold,
            assets,
            pending: "",
        });
        yield newRequest.save();
        console.log("psbt.toHex() ==> ", psbt.toHex());
        return psbt.toHex();
    });
}
exports.sendBtcController = sendBtcController;
function sendRuneController(walletId, destination, runeId, amount, paymentAddress, pubKey) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("walletId ==> ", walletId);
        console.log("destination ==> ", destination);
        console.log("amount ==> ", amount);
        console.log("runeId ==> ", runeId);
        console.log("paymentAddress ==> ", paymentAddress);
        const multisigVault = yield Multisig_1.default.findById(walletId);
        if (!multisigVault)
            return {
                success: false,
                message: "Not Found Multisig wallet.",
            };
        const { witnessScript, p2msOutput, address, threshold, cosigner, assets } = multisigVault;
        const psbt = new bitcoinjs_lib_1.Psbt({
            network: config_1.TEST_MODE ? ecpair_1.networks.testnet : ecpair_1.networks.bitcoin,
        });
        if (!multisigVault)
            return {
                success: false,
                message: "There is no wallet with this id.",
                payload: null,
            };
        if (!assets)
            return {
                success: false,
                message: "Not Found Multisig Assets.",
            };
        const btcUtxos = yield (0, psbt_service_1.getBtcUtxoByAddress)(address);
        const runeUtxos = yield (0, psbt_service_1.getRuneUtxoByAddress)(address, runeId);
        const FinalEdicts = [];
        let FinaltokenSum = 0;
        const runeBlockNumber = parseInt(runeId.split(":")[0]);
        const runeTxout = parseInt(runeId.split(":")[1]);
        for (const runeutxo of runeUtxos.runeUtxos) {
            psbt.addInput({
                hash: runeutxo.txid,
                index: runeutxo.vout,
                witnessScript: Buffer.from(witnessScript, "hex"),
                witnessUtxo: {
                    value: runeutxo.value,
                    script: Buffer.from(p2msOutput, "hex"),
                },
            });
            FinaltokenSum += runeutxo.amount * Math.pow(10, runeutxo.divisibility);
        }
        if (FinaltokenSum - amount * Math.pow(10, runeUtxos.runeUtxos[0].divisibility) > 0) {
            FinalEdicts.push({
                id: new runelib_1.RuneId(runeBlockNumber, runeTxout),
                amount: amount * Math.pow(10, runeUtxos.runeUtxos[0].divisibility),
                output: 2,
            });
            FinalEdicts.push({
                id: new runelib_1.RuneId(runeBlockNumber, runeTxout),
                amount: FinaltokenSum - amount * Math.pow(10, runeUtxos.runeUtxos[0].divisibility),
                output: 1,
            });
        }
        else {
            FinalEdicts.push({
                id: new runelib_1.RuneId(runeBlockNumber, runeTxout),
                amount: parseInt(amount.toString()),
                output: 1,
            });
        }
        console.log("FinaltokenSum ==> ", FinaltokenSum);
        console.log("transferAmount ==> ", FinalEdicts);
        const Finalmintstone = new runelib_1.Runestone(FinalEdicts, (0, runelib_1.none)(), (0, runelib_1.none)(), (0, runelib_1.none)());
        psbt.addOutput({
            script: Finalmintstone.encipher(),
            value: 0,
        });
        if (FinaltokenSum - amount > 0) {
            psbt.addOutput({
                address: address,
                value: 546,
            });
        }
        // add rune receiver address
        psbt.addOutput({
            address: destination,
            value: 546,
        });
        const feeRate = (yield (0, psbt_service_1.getFeeRate)()) + 10;
        console.log("feeRate ==> ", feeRate);
        let FinalTotalBtcAmount = 0;
        let finalFee = 0;
        for (const btcutxo of btcUtxos) {
            finalFee = yield (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
            if (FinalTotalBtcAmount < finalFee && btcutxo.value > 10000) {
                FinalTotalBtcAmount += btcutxo.value;
                psbt.addInput({
                    hash: btcutxo.txid,
                    index: btcutxo.vout,
                    witnessScript: Buffer.from(witnessScript, "hex"),
                    witnessUtxo: {
                        script: Buffer.from(p2msOutput, "hex"),
                        value: btcutxo.value,
                    },
                });
            }
        }
        console.log("Pay finalFee =====================>", finalFee);
        if (FinalTotalBtcAmount < finalFee)
            throw "BTC balance is not enough";
        console.log("FinalTotalBtcAmount ====>", FinalTotalBtcAmount);
        psbt.addOutput({
            address: address,
            value: FinalTotalBtcAmount - finalFee,
        });
        const newRequest = new RequestModal_1.default({
            musigId: walletId,
            type: "Tranfer" /* RequestType.Tranfer */,
            transferAmount: amount,
            destinationAddress: destination,
            creator: paymentAddress,
            cosigner,
            signedCosigner: [],
            psbt: [psbt.toHex()],
            threshold,
            assets,
            pending: "",
        });
        yield newRequest.save();
        console.log("psbt.toHex() ==> ", psbt.toHex());
        return psbt.toHex();
    });
}
exports.sendRuneController = sendRuneController;
