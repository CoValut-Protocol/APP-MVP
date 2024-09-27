"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_FEE_PERCENT = exports.RUNE_WIF_KEY = exports.WIF_KEY = exports.SERVICE_FEE_ADDRESS = exports.ADMIN_ADDRESS = exports.WalletTypes = exports.SERVICE_FEE = exports.RUNE_RECEIVE_VALUE = exports.ADMIN_PAYMENT_ADDRESS = exports.SERVICE_FEE_PERCENT = exports.COSIGNATURE_SIZE = exports.SIGNATURE_SIZE = exports.OPENAPI_UNISAT_TOKEN = exports.TRAC_NETWORK_API = exports.MEMPOOL_URL = exports.OPENAPI_URL = exports.OPENAPI_UNISAT_URL = exports.MEMPOOL_API = exports.TEST_MODE = exports.JWT_SECRET = exports.PORT = exports.MONGO_URL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
try {
    dotenv_1.default.config();
}
catch (error) {
    console.error("Error loading environment variables:", error);
    process.exit(1);
}
exports.MONGO_URL = `mongodb+srv://toskypi1016:Zjlf8P7TbhS2oy89@cluster0.qyg4xxl.mongodb.net/Multisig`;
exports.PORT = process.env.PORT || 9090;
exports.JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";
exports.TEST_MODE = true;
exports.MEMPOOL_API = exports.TEST_MODE
    ? "https://mempool.space/testnet/api"
    : "https://mempool.space/api";
exports.OPENAPI_UNISAT_URL = exports.TEST_MODE
    ? "https://open-api-testnet.unisat.io"
    : "https://open-api.unisat.io";
exports.OPENAPI_URL = exports.TEST_MODE
    ? "https://api-testnet.unisat.io/wallet-v4"
    : "https://api.unisat.io/wallet-v4";
exports.MEMPOOL_URL = exports.TEST_MODE
    ? "https://mempool.space/testnet/api"
    : "https://ordinalgenesis.mempool.space/api";
exports.TRAC_NETWORK_API = exports.TEST_MODE ? "http://turbo.tracnetwork.io:55007" : "http://turbo.tracnetwork.io:55007";
exports.OPENAPI_UNISAT_TOKEN = "50c50d3a720f82a3b93f164ff76989364bd49565b378b5c6a145c79251ee7672";
exports.SIGNATURE_SIZE = 126;
exports.COSIGNATURE_SIZE = 47;
exports.SERVICE_FEE_PERCENT = 3;
exports.ADMIN_PAYMENT_ADDRESS = process.env
    .ADMIN_PAYMENT_ADDRESS;
exports.RUNE_RECEIVE_VALUE = 546;
exports.SERVICE_FEE = 8000;
var WalletTypes;
(function (WalletTypes) {
    WalletTypes["UNISAT"] = "Unisat";
    WalletTypes["XVERSE"] = "Xverse";
    WalletTypes["HIRO"] = "Hiro";
    WalletTypes["OKX"] = "Okx";
})(WalletTypes || (exports.WalletTypes = WalletTypes = {}));
exports.ADMIN_ADDRESS = exports.TEST_MODE
    ? "tb1pcngsk49thk8e5m2ndfqv9sycltrjr4rx0prwhwr22mujl99y6szqw2kv0f"
    : "bc1pcngsk49thk8e5m2ndfqv9sycltrjr4rx0prwhwr22mujl99y6szqezqr4x";
exports.SERVICE_FEE_ADDRESS = exports.TEST_MODE
    ? "tb1pm5xmwqstu2fhcf2566xur059d5jg80s80uq9qj6hjz46f8lzne0qusrr7x"
    : "bc1ppd09afhjt4uelc8shxu5qqct6tc84e2nxdwj4f77ew8k6p6kcg5s47cwrg";
exports.WIF_KEY = exports.TEST_MODE
    ? "cUpP2sL3WGuZhF4LKEQxfQGUqgC1MdByV9mw2Luek6enxWPqnSaH"
    : "KyJHbn3c2oHY1icRP7W4VLYF8RGf7DyJxdmzprzSBKQyxXT3Krph";
exports.RUNE_WIF_KEY = exports.TEST_MODE
    ? "cPfH4h3TTryoBA5gmXKBrf3Jkea4mg512fvTwHSwgS4zDGZDZD6h"
    : "KyJHbn3c2oHY1icRP7W4VLYF8RGf7DyJxdmzprzSBKQyxXT3Krph";
exports.SERVER_FEE_PERCENT = 0.02;
// export const OPENAPI_UNISAT_TOKEN = process.env.UNISAT_TOKEN;
// export const OPENAPI_UNISAT_TOKEN2 = process.env.UNISAT_TOKEN2;
