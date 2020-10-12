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
const R = __importStar(require("ramda"));
const sia = __importStar(require("./sia"));
const storj = __importStar(require("./storj"));
const model_1 = require("./model");
const api_1 = require("./api");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const readConfig = () => {
    try {
        const content = fs_1.default.readFileSync('/etc/conductord/config.json');
        return JSON.parse(content.toString());
    }
    catch (err) {
        console.error(`could not read config file: ${err.message} Please create file at /etc/conductord/config.json and make sure that the JSON is correct.`);
        process.exit(1);
    }
};
const collect = (nodeId, port, type) => __awaiter(void 0, void 0, void 0, function* () {
    let record = {};
    if (type === model_1.HostType.SIA) {
        const resp = yield sia.collectHost(port);
        const spaceUsed = yield sia.getStorage(port);
        record = Object.assign(Object.assign({ type: 'SIA' }, R.pick(['storagerevenue', 'downloadbandwidthrevenue', 'uploadbandwidthrevenue', 'contractcompensation'], resp.data.financialmetrics)), { spaceUsed,
            nodeId, createdAt: new Date() });
    }
    else {
        const spaceUsed = yield storj.collect(port);
        record = {
            type: 'STORJ',
            spaceUsed,
            nodeId,
            createdAt: new Date(),
        };
    }
    yield api_1.sendRecord(record);
    console.log('sent record.');
});
const checkNodeSettings = (node) => __awaiter(void 0, void 0, void 0, function* () {
    if (node.type === model_1.HostType.SIA && node._id) {
        console.log('collecting node settigns for SIA');
        const settings = yield sia.getHostSettings(node);
        yield api_1.updateNodeSettings(node._id, settings);
    }
});
const config = readConfig();
const ready = (id, hostInfo) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`connected to ${hostInfo.type}. Public key or ID is ${id}. Logging in...`);
    const resp = yield api_1.login(process.env.NODE_ENV === 'development' ? 'test@adrienmorel.co' : 'hello@adrienmorel.co', 'kronos');
    console.log(`token: ${resp.data.token}`);
    api_1.setAuthToken(resp.data.token);
    console.log('login success');
    let host = resp.data.hosts.find((k) => k.hostKey === id);
    if (!host) {
        console.log('node is new. Registering');
        const registerResp = yield api_1.registerNode({
            ip: 'localhost',
            username: os_1.default.userInfo().username,
            nodeType: hostInfo.type,
            hostKey: id,
        });
        host = R.prop('data', registerResp);
    }
    collect(host._id, hostInfo.port, host.nodeType);
    const hostWithPort = R.assoc('port', hostInfo.port, host);
    checkNodeSettings(hostWithPort);
    node_schedule_1.default.scheduleJob('*/30 * * * *', () => {
        collect(host._id, host.port, host.nodeType);
    });
    node_schedule_1.default.scheduleJob('0 */30 * * *', () => {
        checkNodeSettings(hostWithPort);
    });
});
config.hosts.forEach((host) => {
    if (host.type === model_1.HostType.SIA) {
        console.log(`connecting to sia on port ${host.port}...`);
        sia.prepare(host).then((SiaPubKey) => __awaiter(void 0, void 0, void 0, function* () {
            ready(SiaPubKey, host);
        }));
    }
    else {
        storj.prepare(host).then((id) => __awaiter(void 0, void 0, void 0, function* () {
            ready(id, host);
        }));
    }
});
//# sourceMappingURL=index.js.map