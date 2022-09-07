(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorvinaConnect = exports.CorvinaConnectEventType = exports.CorvinaHost = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType["CORVINA_CONNECT_INIT"] = "CORVINA_CONNECT_INIT";
    MessageType["CORVINA_CONNECT_INIT_RESPONSE"] = "CORVINA_CONNECT_INIT_RESPONSE";
    MessageType["ORGANIZATION_ID_CHANGED"] = "ORGANIZATION_ID_CHANGED";
    MessageType["JWT_CHANGED"] = "JWT_CHANGED";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
class CorvinaHost {
    constructor({ jwt, organizationId, corvinaHost }) {
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;
        this._onMessageRef = this.onMessage.bind(this);
        window.addEventListener("message", this._onMessageRef);
    }
    dispose() {
        window.removeEventListener("message", this._onMessageRef);
    }
    set jwt(jwt) {
        this._jwt = jwt;
        const message = {
            type: MessageType.JWT_CHANGED,
            payload: {
                jwt,
            },
        };
        window.postMessage(message, "*");
    }
    set organizationId(organizationId) {
        this._organizationId = organizationId;
        const message = {
            type: MessageType.ORGANIZATION_ID_CHANGED,
            payload: {
                organizationId,
            },
        };
        window.postMessage(message, "*");
    }
    get jwt() {
        return this._jwt;
    }
    get organizationId() {
        return this._organizationId;
    }
    onMessage(event) {
        console.log("onMessage", event.data);
        switch (event.data.type) {
            case MessageType.CORVINA_CONNECT_INIT:
                this.onCorvinaConnectInit(event);
                break;
            default:
                break;
        }
    }
    onCorvinaConnectInit(event) {
        const response = {
            type: MessageType.CORVINA_CONNECT_INIT_RESPONSE,
            payload: {
                jwt: this._jwt,
                organizationId: this._organizationId,
                corvinaHost: this._corvinaHost,
            },
        };
        if (event.source) {
            event.source.postMessage(response, { targetOrigin: event.origin });
        }
        else {
            console.warn('Event source is not defined', event);
        }
    }
    static create({ jwt, organizationId, corvinaHost }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new CorvinaHost({ jwt, organizationId, corvinaHost });
        });
    }
}
exports.CorvinaHost = CorvinaHost;
var CorvinaConnectEventType;
(function (CorvinaConnectEventType) {
    CorvinaConnectEventType["ORGANIZATION_ID_CHANGED"] = "ORGANIZATION_ID_CHANGED";
    CorvinaConnectEventType["JWT_CHANGED"] = "JWT_CHANGED";
})(CorvinaConnectEventType = exports.CorvinaConnectEventType || (exports.CorvinaConnectEventType = {}));
class CorvinaConnect {
    constructor({ jwt, organizationId, corvinaHost }) {
        this._eventCallback = {};
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;
        this._eventCallback = Object.keys(CorvinaConnectEventType).reduce((acc, key) => {
            acc[key] = [];
            return acc;
        }, {});
        this._onMessageRef = this.onMessage.bind(this);
        window.addEventListener("message", this._onMessageRef);
    }
    static dispose() {
        if (CorvinaConnect._instance) {
            CorvinaConnect._instance.dispose();
            CorvinaConnect._instance = undefined;
        }
    }
    dispose() {
        window.removeEventListener("message", this._onMessageRef);
    }
    get jwt() {
        return this._jwt;
    }
    get organizationId() {
        return this._organizationId;
    }
    get corvinaHost() {
        return this._corvinaHost;
    }
    onMessage(event) {
        switch (event.data.type) {
            case MessageType.JWT_CHANGED:
                this.onJwtChanged(event);
                break;
            case MessageType.ORGANIZATION_ID_CHANGED:
                this.onOrganizationIdChanged(event);
                break;
            default:
                break;
        }
    }
    onJwtChanged(event) {
        this._jwt = event.data.payload.jwt;
        for (const callback of this._eventCallback[CorvinaConnectEventType.JWT_CHANGED]) {
            callback(this._jwt);
        }
    }
    onOrganizationIdChanged(event) {
        this._organizationId = event.data.payload.organizationId;
        for (const callback of this._eventCallback[CorvinaConnectEventType.ORGANIZATION_ID_CHANGED]) {
            callback(this._organizationId);
        }
    }
    off(event) {
        if (!event) {
            throw new Error("Event name is required");
        }
        this._eventCallback[event] = [];
    }
    on(event, callback) {
        if (!event) {
            throw new Error("Event name is required");
        }
        if (!callback) {
            throw new Error("Callback is required");
        }
        this._eventCallback[event].push(callback);
    }
    static create({ corvinaHost, corvinaHostWindow }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._instance) {
                return new Promise((resolve, reject) => {
                    try {
                        corvinaHostWindow.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);
                        const handleInitResponse = (event) => {
                            let message = event.data;
                            if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {
                                let { jwt, organizationId } = message.payload;
                                window.removeEventListener("message", handleInitResponse, false);
                                this._instance = new CorvinaConnect({ jwt, organizationId, corvinaHost });
                                resolve(this._instance);
                            }
                        };
                        window.addEventListener('message', handleInitResponse);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }
            return this._instance;
        });
    }
}
exports.CorvinaConnect = CorvinaConnect;
window.$corvina = {
    CorvinaConnect,
    CorvinaHost,
};

},{}]},{},[1]);
