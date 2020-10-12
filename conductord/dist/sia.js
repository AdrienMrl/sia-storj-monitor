"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.getHostSettings = exports.getStorage = exports.collectHost = exports.prepare = void 0;
const R = __importStar(require("ramda"));
const axios_1 = __importDefault(require("axios"));
let siads = {};
exports.prepare = (host) => __awaiter(void 0, void 0, void 0, function* () {
    if (host.port === undefined)
        return console.error('error! host has no port');
    siads[host.port] = axios_1.default.create({
        baseURL: `http://localhost:${host.port}`,
        auth: {
            username: '',
            password: host.apipassword || ''
        },
        headers: {
            common: {
                'Content-Type': 'application/json',
                'User-Agent': 'Sia-Agent',
            },
        },
    });
    const hostData = yield exports.collectHost(host.port);
    return R.path(['data', 'publickey', 'key'], hostData);
});
exports.collectHost = (port) => __awaiter(void 0, void 0, void 0, function* () {
    if (!siads[port])
        throw 'error! no host on port ' + port;
    const hostData = yield siads[port].get('/host');
    return hostData;
});
exports.getStorage = (port) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield siads[port].get('/host/storage');
    return R.compose(R.sum, R.map((folder) => parseInt(R.prop('capacity', folder)) -
        parseInt(R.prop('capacityremaining', folder))), R.path(['data', 'folders']))(resp);
});
exports.getHostSettings = (host) => __awaiter(void 0, void 0, void 0, function* () {
    if (!host.port) {
        throw `Error! Host ${host._id} has no port`;
    }
    const hostSettings = yield exports.collectHost(host.port);
    const scoreEstimateResp = yield siads[host.port].get('/host/estimatescore');
    const walletinfo = yield siads[host.port].get('/wallet');
    const externalsettings = hostSettings.data.externalsettings;
    return {
        downloadbandwidthprice: externalsettings.downloadbandwidthprice,
        uploadbandwidthprice: externalsettings.uploadbandwidthprice,
        storageprice: externalsettings.storageprice,
        workingstatus: hostSettings.data.workingstatus,
        scoreestimate: scoreEstimateResp.data.conversionrate,
        wallet: {
            balance: walletinfo.data.confirmedsiacoinbalance,
            unlocked: walletinfo.data.unlocked,
        }
    };
});
//# sourceMappingURL=sia.js.map