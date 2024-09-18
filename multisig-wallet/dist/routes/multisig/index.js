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
const express_1 = require("express");
const Bitcoin = __importStar(require("bitcoinjs-lib"));
const config_1 = require("../../config/config");
const test1_1 = require("../../controller/test1");
const nativeMusig_controller_1 = require("../../controller/nativeMusig.controller");
const nativeMusig_controller_2 = require("../../controller/nativeMusig.controller");
const Multisig_1 = __importDefault(require("../../model/Multisig"));
const rune_controller_1 = require("../../controller/rune.controller");
const taproot_controller_1 = require("../../controller/taproot.controller");
const TaprootMultisig_1 = __importDefault(require("../../model/TaprootMultisig"));
const type_1 = require("../../type");
// Create a new instance of the Express Router
const multiSigWalletRoute = (0, express_1.Router)();
multiSigWalletRoute.post("/create-vault", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("create-nativeSegwit api is called!!");
        console.log(req.body);
        const { pubKeyList, minSignCount, assets, imageUrl, vaultType } = req.body;
        let error = "";
        if (!pubKeyList.length)
            error += "There is no publicKey value.";
        if (!minSignCount)
            error += "There is no minSignCount value.";
        if (!imageUrl)
            error += "There is no imageUrl value.";
        if (!vaultType)
            error += "There is no vaultType value.";
        if (minSignCount > pubKeyList.length)
            error += "minSignCount should be less than pubkey list count";
        if (error) {
            console.log("input error ==> ", error);
            return res.status(400).send({
                success: false,
                message: error,
                payload: null,
            });
        }
        if (vaultType == type_1.VaultType.NativeSegwit) {
            // Create new vault.
            const payload = yield (0, nativeMusig_controller_1.createNativeSegwit)(pubKeyList, minSignCount, assets, config_1.TEST_MODE ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin, imageUrl);
            console.log("payload after createNativeSegwit ==> ", payload);
            if (!payload.success)
                return res.status(200).send({
                    success: payload.success,
                    message: payload.message,
                    payload: {
                        vault: null,
                        rune: null,
                    },
                });
            console.log("Created new vault successfully!!");
            if (assets.runeName == "None")
                return res.status(200).send({
                    success: payload.success,
                    message: payload.message,
                    payload: {
                        vault: payload,
                        rune: null,
                    },
                });
            // Etching new rune tokens
            const { runeName, runeAmount, runeSymbol, initialPrice, creatorAddress } = assets;
            const result = yield (0, rune_controller_1.createRuneToken)(runeName, runeAmount, runeSymbol, initialPrice, creatorAddress);
            console.log("Finished etching new rune toens ==> ", result);
            if (!result.success) {
                yield Multisig_1.default.findByIdAndDelete((_a = payload.payload) === null || _a === void 0 ? void 0 : _a.DBID);
                console.log("Remove new wallet cuz rune etching failed..");
                payload.message = "Vault creation is cancelled.";
                payload.payload = null;
                return res.status(200).send({
                    success: result.success,
                    message: result.message,
                    payload: {
                        vault: payload,
                        rune: result,
                    },
                });
            }
            return res.status(200).send({
                success: result.success,
                message: payload.message + " " + result.message,
                payload: {
                    vault: payload,
                    rune: result,
                },
            });
        }
        else {
            const payload = yield (0, taproot_controller_1.createTaprootMultisig)(pubKeyList, minSignCount, assets, imageUrl);
            console.log("payload after createNativeSegwit ==> ", payload);
            if (!payload.success)
                return res.status(200).send({
                    success: payload.success,
                    message: payload.message,
                    payload: {
                        vault: null,
                        rune: null,
                    },
                });
            console.log("Created new vault successfully!!");
            if (assets.runeName == "None")
                return res.status(200).send({
                    success: payload.success,
                    message: payload.message,
                    payload: {
                        vault: payload,
                        rune: null,
                    },
                });
            // Etching new rune tokens
            const { runeName, runeAmount, runeSymbol, initialPrice, creatorAddress } = assets;
            const result = yield (0, rune_controller_1.createRuneToken)(runeName, runeAmount, runeSymbol, initialPrice, creatorAddress);
            console.log("Finished etching new rune toens ==> ", result);
            if (!result.success) {
                yield Multisig_1.default.findByIdAndDelete((_b = payload.payload) === null || _b === void 0 ? void 0 : _b.DBID);
                console.log("Remove new wallet cuz rune etching failed..");
                payload.message = "Vault creation is cancelled.";
                payload.payload = null;
                return res.status(200).send({
                    success: result.success,
                    message: result.message,
                    payload: {
                        vault: payload,
                        rune: result,
                    },
                });
            }
            return res.status(200).send({
                success: result.success,
                message: payload.message + " " + result.message,
                payload: {
                    vault: payload,
                    rune: result,
                },
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "There is Something wrong..",
            payload: null,
        });
    }
}));
multiSigWalletRoute.get("/fetchVaultList", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("fetchWalletList api is called!!");
        const nativeList = yield Multisig_1.default.find();
        const taprootList = yield TaprootMultisig_1.default.find();
        if (!nativeList.length && !taprootList.length)
            return res.status(200).send({
                success: false,
                message: "There is no wallet here.",
                payload: [],
            });
        return res.status(200).send({
            success: true,
            message: "Fetch wallet list successfully",
            payload: {
                native: nativeList,
                taproot: taprootList
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "There is Something wrong..",
            payload: null,
        });
    }
}));
multiSigWalletRoute.post("/update-vault", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("update-vaultapi is called!!");
        const { vaultId, pubKeyList, minSignCount, assets, ordinalAddress, imageUrl, } = req.body;
        console.log("recreate api ==> ", vaultId, pubKeyList, minSignCount, assets, ordinalAddress, imageUrl);
        let error = "";
        if (!imageUrl)
            error += "There is no imageUrl. ";
        if (!vaultId)
            error += "There is no vaultId. ";
        if (!pubKeyList.length)
            error += "There is no publicKey value.";
        if (!minSignCount)
            error += "There is no minSignCount value.";
        if (!minSignCount)
            error += "There is no minSignCount value.";
        if (!ordinalAddress)
            error += "There is no ordinalAddress value.";
        if (error)
            return res.status(400).send({
                success: false,
                message: error,
                payload: null,
            });
        const oldVault = yield Multisig_1.default.findById(vaultId);
        if (!oldVault)
            return res.status(200).send({
                success: false,
                message: "There is no exist wallet with this id",
                payload: null,
            });
        const newWallet = yield (0, nativeMusig_controller_1.reCreateNativeSegwit)(pubKeyList, minSignCount, assets, Bitcoin.networks.testnet, vaultId, imageUrl);
        console.log("new wallet ==> ", newWallet.message);
        if (!newWallet.payload)
            return res.status(200).send({
                success: newWallet.success,
                message: newWallet.message,
                payload: null,
            });
        const request = yield (0, nativeMusig_controller_1.transferAllAssets)(oldVault, newWallet.payload, ordinalAddress);
        return res.status(200).send({
            success: true,
            message: "Request saved sucessfully",
            payload: request,
        });
        //   Transfer all assets from old to new
    }
    catch (error) {
        console.log("Updating vault error ==> ", error);
        return res.status(200).send({
            success: false,
            message: error,
            payload: null,
        });
    }
}));
multiSigWalletRoute.get("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pubKeyList, minSignCount } = req.body;
        let error = "";
        if (!pubKeyList.length)
            error += "There is no publicKey value.";
        if (!minSignCount)
            error += "There is no minSignCount value.";
        if (minSignCount > pubKeyList.length)
            error += "minSignCount should be less than pubkey list count";
        const address = yield (0, test1_1.createMultiSigWallet)(pubKeyList, minSignCount);
        return res.status(200).send({
            message: true,
            payload: address,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error });
    }
}));
// multiSigWalletRoute.post("/sendBtcRequest", async (req, res) => {
//   const {
//     id,
//     transferAmount,
//     destinationAddress,
//     ordinalAddress,
//     pubKey,
//     multisigWalletAddress,
//   } = req.body;
//   let error = "";
//   if (!multisigWalletAddress) error += "There is no Musig walle address. ";
//   else if (!validate(multisigWalletAddress))
//     error += "multisig wallet address is invalid. ";
//   if (!pubKey) error += "There is no publicKey. ";
//   if (!destinationAddress) error += "There is no targetAddress. ";
//   if (!transferAmount) error += "There is no sendAmount value";
//   if (error)
//     return res.status(400).send({
//       success: false,
//       message: error,
//       payload: null,
//     });
//   const payload = await makeRequest(
//     id,
//     transferAmount,
//     destinationAddress,
//     ordinalAddress,
//     pubKey
//   );
//   console.log("payload ==> ", payload);
//   if (payload.success) {
//     return res.status(200).send({
//       success: true,
//       message: "PSBT is created successfully",
//       psbtHex: payload.psbt.toHex(),
//       psbtBase64: payload.psbt.toBase64(),
//     });
//   } else {
//     return res.status(200).send({
//       success: true,
//       message: error,
//       psbtHex: null,
//       psbtBase64: null,
//     });
//   }
// });
// multiSigWalletRoute.post("/create-taproot", async (req, res) => {
//   try {
//     const { pubKeyList, minSignCount, assets } = req.body;
//     let error = "";
//     if (!pubKeyList.length) error += "There is no publicKey value.";
//     if (!minSignCount) error += "There is no minSignCount value.";
//     if (minSignCount > pubKeyList.length)
//       error += "minSignCount should be less than pubkey list count";
//     if (error)
//       return res.status(400).send({
//         success: false,
//         message: error,
//         payload: null,
//       });
//     const payload = await createTaprootMultiSigWallet(
//       pubKeyList,
//       minSignCount,
//       assets,
//       Bitcoin.networks.testnet
//     );
//     if (!payload.success)
//       return res.status(400).send({
//         success: payload.success,
//         message: payload.message,
//         payload: null,
//       });
//     const address = payload.payload?.address;
//     // const { output, address, witness, internalPublicKey, redeem, message } = payload.payload;
//     return res.status(200).send({
//       success: payload.success,
//       message: payload.message,
//       payload: address,
//     });
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).send({ error });
//   }
// });
// multiSigWalletRoute.post("/createSendPsbt", async (req, res) => {
//   try {
//     const { multisigWalletAddress } = req.body;
//     const payload = await sendBtcRequest(multisigWalletAddress);
//     if (!payload.success)
//       return res.status(400).send({
//         success: payload.success,
//         message: payload.message,
//         payload: null,
//       });
//     const address = payload.payload?.address;
//     return res.status(200).send(payload);
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).send({ error });
//   }
// });
multiSigWalletRoute.post("/sendBtc", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletId, destination, amount, paymentAddress, pubKey } = req.body;
        let error = "";
        if (!walletId)
            error += "There is no walletId value.";
        if (!destination)
            error += "There is no destination value.";
        if (!amount)
            error += "There is no amount value.";
        const result = yield (0, nativeMusig_controller_1.sendBtcController)(walletId, destination, amount, paymentAddress, pubKey);
        return res.status(200).send({
            success: true,
            message: "The request is made successfully",
            payload: result,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "The request is made with failure.",
            payload: error,
        });
    }
}));
multiSigWalletRoute.post("/sendRune", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vaultId, destination, runeId, amount, ordinalAddress, ordinalPublicKey, } = req.body;
        let error = "";
        if (!vaultId)
            error += "There is no walletId value.";
        if (!destination)
            error += "There is no destination value.";
        if (!amount)
            error += "There is no amount value.";
        const result = yield (0, nativeMusig_controller_1.sendRuneController)(vaultId, destination, runeId, amount, ordinalAddress, ordinalPublicKey);
        return res.status(200).send({
            success: true,
            message: "The request is made successfully",
            payload: result,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "The request is made with failure.",
            payload: error,
        });
    }
}));
multiSigWalletRoute.get("/getAll", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield (0, nativeMusig_controller_2.loadAllMusigWallets)();
    if (payload.success)
        return res.status(200).send(payload);
    else
        return res.status(500).send(payload);
}));
multiSigWalletRoute.post("/getOne", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const payload = yield (0, nativeMusig_controller_1.loadOneMusigWallets)(id);
    if (payload.success)
        return res.status(200).send(payload);
    else
        return res.status(500).send(payload);
}));
multiSigWalletRoute.post("/createRequest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, transferAmount, destinationAddress, ordinalAddress, pubKey } = req.body;
    const payload = yield (0, nativeMusig_controller_1.makeRequest)(id, transferAmount, destinationAddress, ordinalAddress, pubKey);
    return res.status(200).send({
        success: true,
        message: "make the request successfully.",
        payload,
    });
}));
multiSigWalletRoute.post("/createBtcRequest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, transferAmount, destinationAddress, paymentAddress, paymentPubkey, } = req.body;
    const payload = yield (0, nativeMusig_controller_1.makeRequest)(id, transferAmount, destinationAddress, paymentAddress, paymentPubkey);
    return res.status(200).send({
        success: true,
        message: "make the request successfully.",
        payload,
    });
}));
multiSigWalletRoute.post("/getBtcAndRuneByAddress", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address } = req.body;
        const payload = yield (0, nativeMusig_controller_1.getBtcAndRuneByAddressController)(address);
        return res.status(200).send({
            success: true,
            message: "Get Btc and Rune successfully.",
            payload,
        });
    }
    catch (error) {
        return res.status(200).send({
            success: false,
            message: "Get Btc and Rune failed.",
            payload: null,
        });
    }
}));
// Taproot
// multiSigWalletRoute.post("/create-vault-taproot", async (req, res) => {
//   try {
//     const { pubkeyList, threshold } = req.body;
//     const result = await createTaprootMultisig(pubkeyList, threshold);
//     return res.status(200).send({
//       success: true,
//       message: "Multisig wallet is made successfully",
//       payload: result,
//     });
//   } catch (error) {
//     console.log("error ==> ", error);
//   }
// });
multiSigWalletRoute.get("/fetchTaprootVaultList", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("fetchTaprootVaultList api is called!!");
        const walletList = yield TaprootMultisig_1.default.find();
        if (!walletList.length)
            return res.status(200).send({
                success: false,
                message: "There is no taproot wallet here.",
                payload: [],
            });
        return res.status(200).send({
            success: true,
            message: "Fetch taproot wallet list successfully",
            payload: walletList,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "There is Something wrong..",
            payload: null,
        });
    }
}));
multiSigWalletRoute.post("/restore", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const result = yield (0, taproot_controller_1.restoreTaprootMultisig)(id);
        return res.status(200).send({
            success: true,
            message: "Multisig wallet is restored successfully",
            payload: result,
        });
    }
    catch (error) {
        console.log("error ==> ", error);
    }
}));
multiSigWalletRoute.post("/sendBtcTaproot", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, amount, destinationAddress } = req.body;
        const result = yield (0, taproot_controller_1.sendBtcTaproot)(id, amount, destinationAddress);
        return res.status(200).send({
            success: true,
            message: "send PSBT is made successfully.",
            payload: result,
        });
    }
    catch (error) {
        console.log("error ==> ", error);
    }
}));
multiSigWalletRoute.post("/combine", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("exec in sendBtcRoute ==>  api is calling!!");
    try {
        const { id, psbt, signedPSBT, walletType } = req.body;
        const result = yield (0, taproot_controller_1.broadcastPSBT)(id, psbt, signedPSBT, walletType);
        return res.status(200).json({ success: true, result });
    }
    catch (error) {
        console.log("exec PSBT Error : ", error);
        return res.status(500).json({ success: false });
    }
}));
exports.default = multiSigWalletRoute;
