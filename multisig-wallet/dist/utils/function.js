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
exports.checkingAssets = exports.pushRawTx = exports.getTxHexById = exports.getRuneByIDandAddress = exports.getUTXOByAddress = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
// Get BTC UTXO
const getUTXOByAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `${config_1.OPENAPI_UNISAT_URL}/v1/indexer/address/${address}/utxo-data`;
        const config = {
            headers: {
                Authorization: `Bearer ${config_1.OPENAPI_UNISAT_TOKEN}`,
            },
        };
        let cursor = 0;
        const size = 5000;
        const utxos = [];
        console.log("here!");
        while (1) {
            console.log("url ==> ", url);
            const res = yield axios_1.default.get(url, Object.assign(Object.assign({}, config), { params: { cursor, size } }));
            console.log("res.data ==> ", res.data);
            if (res.data.code === -1)
                throw new Error("Invalid Address");
            utxos.push(...res.data.data.utxo.map((utxo) => {
                return {
                    scriptpubkey: utxo.scriptPk,
                    txid: utxo.txid,
                    value: utxo.satoshi,
                    vout: utxo.vout,
                };
            }));
            cursor += res.data.data.utxo.length;
            if (cursor === res.data.data.total)
                break;
        }
        return utxos;
    }
    catch (error) {
        console.log(error.data);
        throw new Error("Network is disconnected!!");
    }
});
exports.getUTXOByAddress = getUTXOByAddress;
const getRuneByIDandAddress = (address, runeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `${config_1.OPENAPI_UNISAT_URL}/v1/indexer/address/${address}/runes/${runeId}/balance`;
        const config = {
            headers: {
                Authorization: `Bearer ${config_1.OPENAPI_UNISAT_TOKEN}`,
            },
        };
        let cursor = 0;
        const size = 5000;
        console.log("url ==> ", url);
        const res = yield axios_1.default.get(url, Object.assign(Object.assign({}, config), { params: { cursor, size } }));
        console.log("res.data ==> ", res.data);
        if (res.data.code === -1)
            throw new Error("Invalid Address");
        return res.data.data.utxo;
    }
    catch (error) {
        console.log(error.data);
        throw new Error("Network is disconnected!!");
    }
});
exports.getRuneByIDandAddress = getRuneByIDandAddress;
const getTxHexById = (txId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(`https://mempool.space/${config_1.TEST_MODE ? "testnet/" : ""}api/tx/${txId}/hex`);
        return data;
    }
    catch (error) {
        console.log("Mempool api error. Can not get transaction hex");
        throw "Mempool api is not working now. Try again later";
    }
});
exports.getTxHexById = getTxHexById;
const pushRawTx = (rawTx) => __awaiter(void 0, void 0, void 0, function* () {
    const txid = yield postData(`https://mempool.space/${config_1.TEST_MODE ? "testnet/" : ""}api/tx`, rawTx);
    console.log("pushed txid", txid);
    return txid;
});
exports.pushRawTx = pushRawTx;
const postData = (url, json, content_type = "text/plain", apikey = "") => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    while (1) {
        try {
            const headers = {};
            if (content_type)
                headers["Content-Type"] = content_type;
            if (apikey)
                headers["X-Api-Key"] = apikey;
            const res = yield axios_1.default.post(url, json, {
                headers,
            });
            return res.data;
        }
        catch (err) {
            const axiosErr = err;
            console.log("push tx error", (_a = axiosErr.response) === null || _a === void 0 ? void 0 : _a.data);
            if (!((_b = axiosErr.response) === null || _b === void 0 ? void 0 : _b.data).includes('sendrawtransaction RPC error: {"code":-26,"message":"too-long-mempool-chain,'))
                throw new Error("Got an err when push tx");
        }
    }
});
const checkingAssets = (ordinalAddress, tokenName, tokenAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        headers: {
            Authorization: `Bearer ${config_1.OPENAPI_UNISAT_TOKEN}`,
        },
    };
    // if(tokenType == TokenTypes.Brc20){
    //     const url = `https://open-api-testnet.unisat.io/v1/indexer/address/${ordinalAddress}/brc20/${tokenName}/info`;
    //     const payload = await axios.get(url, config);
    //     const privileage = payload.data.data.availableBalance;
    //     if(privileage >= tokenAmount) return true
    //     else return false
    // } else if(tokenType == TokenTypes.Rune) {
    const url = `https://open-api-testnet.unisat.io/v1/indexer/address/${ordinalAddress}/runes/${tokenName}/balance`;
    const payload = yield axios_1.default.get(url, config);
    const privileage = payload.data.data.amount;
    if (privileage >= tokenAmount)
        return true;
    else
        return false;
    // }
});
exports.checkingAssets = checkingAssets;
