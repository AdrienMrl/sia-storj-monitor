"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNodeSettings = exports.registerNode = exports.login = exports.sendRecord = exports.setAuthToken = void 0;
const axios_1 = __importDefault(require("axios"));
process.env.NODE_ENV = 'prod';
let nuageMetricsAPI = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3002'
    : 'https://metrics-api.nuage.sh';
nuageMetricsAPI = 'https://metrics-api.nuage.sh';
let api;
exports.setAuthToken = (token) => (api = axios_1.default.create({
    baseURL: nuageMetricsAPI,
    headers: {
        common: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    },
}));
exports.setAuthToken('');
exports.sendRecord = (payload) => api.post(`/user/record`, payload);
exports.login = (email, password) => api.post(`/login`, { username: email, password });
exports.registerNode = (payload) => api.put('/node', payload);
exports.updateNodeSettings = (nodeId, payload) => api.post(`/node/${nodeId}`, payload);
//# sourceMappingURL=api.js.map