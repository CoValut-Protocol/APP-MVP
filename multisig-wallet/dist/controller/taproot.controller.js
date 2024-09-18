"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.broadcastPSBT = exports.sendBtcTaproot = exports.restoreTaprootMultisig = exports.createTaprootMultisig = void 0;
const bip371_1 = require("bitcoinjs-lib/src/psbt/bip371");
const mutisigWallet_1 = require("../utils/mutisigWallet");
const bip341_1 = require("bitcoinjs-lib/src/payments/bip341");
const ecc = __importStar(require("tiny-secp256k1"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const bip32_1 = __importDefault(require("bip32"));
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const TaprootMultisig_1 = __importDefault(require("../model/TaprootMultisig"));
const config_1 = require("../config/config");
const psbt_service_1 = require("../service/psbt.service");
const rng = require("randombytes");
bitcoin.initEccLib(ecc);
const bip32 = (0, bip32_1.default)(ecc);
// tb1p6m6r55qey5j9n3f6ds24kzz7acpcktwwwkrx54k35eqnvqtcx5ps65932q
const createTaprootMultisig = (pubkeyList, threshold, assets, imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const leafPubkeys = pubkeyList.map((pubkey) => (0, bip371_1.toXOnly)(Buffer.from(pubkey, "hex")));
        const leafKey = bip32.fromSeed(rng(64), config_1.TEST_MODE ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
        const multiSigWallet = new mutisigWallet_1.TaprootMultisigWallet(leafPubkeys, threshold * 1, leafKey.privateKey, bip341_1.LEAF_VERSION_TAPSCRIPT).setNetwork(config_1.TEST_MODE ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
        console.log("address ==> ", multiSigWallet.address);
        const newTaproot = new TaprootMultisig_1.default({
            cosigner: pubkeyList,
            threshold,
            privateKey: (_a = leafKey.privateKey) === null || _a === void 0 ? void 0 : _a.toString("hex"),
            tapscript: bip341_1.LEAF_VERSION_TAPSCRIPT,
            address: multiSigWallet.address,
            assets,
            imageUrl,
        });
        yield newTaproot.save();
        // return multiSigWallet.address;
        return {
            success: true,
            message: "Create Musig Wallet successfully.",
            payload: {
                DBID: newTaproot._id.toString(),
                address: multiSigWallet.address,
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
exports.createTaprootMultisig = createTaprootMultisig;
const restoreTaprootMultisig = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const taprootMultisig = yield TaprootMultisig_1.default.findById(id);
    console.log(taprootMultisig);
    if (!taprootMultisig)
        return;
    // return taprootMultisig;
    // const { leafPubkeys, threshold, privateKey } = taprootMultisig;
    const pubkeyList = taprootMultisig.cosigner;
    const threshold = taprootMultisig.threshold;
    const privateKey = taprootMultisig.privateKey;
    const leafPubkeys = pubkeyList.map((pubkey) => (0, bip371_1.toXOnly)(Buffer.from(pubkey, "hex")));
    const multiSigWallet = new mutisigWallet_1.TaprootMultisigWallet(leafPubkeys, threshold, Buffer.from(privateKey, "hex"), bip341_1.LEAF_VERSION_TAPSCRIPT).setNetwork(config_1.TEST_MODE ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
    return multiSigWallet.address;
});
exports.restoreTaprootMultisig = restoreTaprootMultisig;
const sendBtcTaproot = (id, amount, destinationAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const taprootMultisig = yield TaprootMultisig_1.default.findById(id);
    console.log(taprootMultisig);
    if (!taprootMultisig)
        return;
    const pubkeyList = taprootMultisig.cosigner;
    const threshold = taprootMultisig.threshold;
    const privateKey = taprootMultisig.privateKey;
    const leafPubkeys = pubkeyList.map((pubkey) => (0, bip371_1.toXOnly)(Buffer.from(pubkey, "hex")));
    const multiSigWallet = new mutisigWallet_1.TaprootMultisigWallet(leafPubkeys, threshold, Buffer.from(privateKey, "hex"), bip341_1.LEAF_VERSION_TAPSCRIPT).setNetwork(config_1.TEST_MODE ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
    const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
    const feeRate = (yield (0, psbt_service_1.getFeeRate)()) + 6;
    let totalBtcAmount = 0;
    const btcUtxos = yield (0, psbt_service_1.getBtcUtxoByAddress)(multiSigWallet.address);
    console.log("btcUtxos ==> ", btcUtxos);
    for (const btcutxo of btcUtxos) {
        const fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
        if (totalBtcAmount < fee + amount * 1 + 10000 && btcutxo.value > 1000) {
            totalBtcAmount += btcutxo.value;
            multiSigWallet.addInput(psbt, btcutxo.txid, btcutxo.vout, btcutxo.value);
        }
    }
    let fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
    console.log("fee + amount + 5000 ==> ", fee + amount * 1 + 5000);
    console.log("totalBtcAmount ==> ", totalBtcAmount);
    if (totalBtcAmount < fee + amount * 1 + 5000)
        return "There is not enough btc in this address.";
    psbt.addOutput({
        value: amount * 1,
        address: destinationAddress,
    });
    fee = (0, psbt_service_1.calculateTxFee)(psbt, feeRate);
    psbt.addOutput({
        value: totalBtcAmount - amount - fee,
        address: multiSigWallet.address,
    });
    console.log("psbt", psbt.toHex());
    return psbt.toHex();
});
exports.sendBtcTaproot = sendBtcTaproot;
const broadcastPSBT = (id, psbt, signedPSBT, walletType) => __awaiter(void 0, void 0, void 0, function* () {
    const taprootMultisig = yield TaprootMultisig_1.default.findById(id);
    console.log(taprootMultisig);
    if (!taprootMultisig)
        return;
    const pubkeyList = taprootMultisig.cosigner;
    const threshold = taprootMultisig.threshold;
    const privateKey = taprootMultisig.privateKey;
    const leafPubkeys = pubkeyList.map((pubkey) => (0, bip371_1.toXOnly)(Buffer.from(pubkey, "hex")));
    const multiSigWallet = new mutisigWallet_1.TaprootMultisigWallet(leafPubkeys, threshold, Buffer.from(privateKey, "hex"), bip341_1.LEAF_VERSION_TAPSCRIPT).setNetwork(config_1.TEST_MODE ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
    const tempPsbt = Bitcoin.Psbt.fromHex(signedPSBT);
    const inputCount = tempPsbt.inputCount;
    const inputArr = Array.from({ length: inputCount }, (_, index) => index);
    console.log("inputArr in exec ==> ", inputArr);
    console.log("multiSigWallet ==> ", multiSigWallet);
    console.log("signedPSBT ==> ", signedPSBT);
    const tempSignedPSBT = Bitcoin.Psbt.fromHex(signedPSBT);
    multiSigWallet.addDummySigs(tempSignedPSBT);
    tempSignedPSBT.finalizeAllInputs();
    const txID = yield (0, psbt_service_1.combinePsbt)(psbt, tempSignedPSBT.toHex());
    // console.log(txID);
});
exports.broadcastPSBT = broadcastPSBT;
