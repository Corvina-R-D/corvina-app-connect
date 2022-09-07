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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorvinaConnect = exports.CorvinaConnectEventType = exports.CorvinaHost = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType["CORVINA_CONNECT_INIT"] = "corvina-connect-init";
    MessageType["CORVINA_CONNECT_INIT_RESPONSE"] = "corvina-connect-init-response";
    MessageType["ORGANIZATION_ID_CHANGED"] = "organization-id-changed";
    MessageType["JWT_CHANGED"] = "jwt-changed";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var CorvinaHost = /** @class */ (function () {
    function CorvinaHost(_a) {
        var jwt = _a.jwt, organizationId = _a.organizationId, corvinaHost = _a.corvinaHost;
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;
        window.addEventListener("message", this.onMessage.bind(this));
    }
    Object.defineProperty(CorvinaHost.prototype, "jwt", {
        get: function () {
            return this._jwt;
        },
        set: function (jwt) {
            this._jwt = jwt;
            var message = {
                type: MessageType.JWT_CHANGED,
                payload: {
                    jwt: jwt,
                },
            };
            window.postMessage(message, "*");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CorvinaHost.prototype, "organizationId", {
        get: function () {
            return this._organizationId;
        },
        set: function (organizationId) {
            this._organizationId = organizationId;
            var message = {
                type: MessageType.ORGANIZATION_ID_CHANGED,
                payload: {
                    organizationId: organizationId,
                },
            };
            window.postMessage(message, "*");
        },
        enumerable: false,
        configurable: true
    });
    CorvinaHost.prototype.onMessage = function (event) {
        console.log("onMessage", event.data);
        switch (event.data.type) {
            case MessageType.CORVINA_CONNECT_INIT:
                this.onCorvinaConnectInit(event);
                break;
            default:
                break;
        }
    };
    CorvinaHost.prototype.onCorvinaConnectInit = function (event) {
        var response = {
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
    };
    CorvinaHost.create = function (_a) {
        var jwt = _a.jwt, organizationId = _a.organizationId, corvinaHost = _a.corvinaHost;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, new CorvinaHost({ jwt: jwt, organizationId: organizationId, corvinaHost: corvinaHost })];
            });
        });
    };
    return CorvinaHost;
}());
exports.CorvinaHost = CorvinaHost;
var CorvinaConnectEventType;
(function (CorvinaConnectEventType) {
    CorvinaConnectEventType["ORGANIZATION_ID_CHANGED"] = "organization-id-changed";
    CorvinaConnectEventType["JWT_CHANGED"] = "jwt-changed";
})(CorvinaConnectEventType = exports.CorvinaConnectEventType || (exports.CorvinaConnectEventType = {}));
var CorvinaConnect = /** @class */ (function () {
    function CorvinaConnect(_a) {
        var jwt = _a.jwt, organizationId = _a.organizationId, corvinaHost = _a.corvinaHost;
        this._eventCallback = {};
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;
        this._eventCallback = Object.keys(CorvinaConnectEventType).reduce(function (acc, key) {
            acc[key] = [];
            return acc;
        }, {});
        // listener on postMessage from Corvina parent window
        window.addEventListener("message", this.onMessage.bind(this));
    }
    Object.defineProperty(CorvinaConnect.prototype, "jwt", {
        get: function () {
            return this._jwt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CorvinaConnect.prototype, "organizationId", {
        get: function () {
            return this._organizationId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CorvinaConnect.prototype, "corvinaHost", {
        get: function () {
            return this._corvinaHost;
        },
        enumerable: false,
        configurable: true
    });
    CorvinaConnect.prototype.onMessage = function (event) {
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
    };
    CorvinaConnect.prototype.onJwtChanged = function (event) {
        this._jwt = event.data.payload.jwt;
        for (var _i = 0, _a = this._eventCallback[CorvinaConnectEventType.JWT_CHANGED]; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this._jwt);
        }
    };
    CorvinaConnect.prototype.onOrganizationIdChanged = function (event) {
        this._organizationId = event.data.payload.organizationId;
        for (var _i = 0, _a = this._eventCallback[CorvinaConnectEventType.ORGANIZATION_ID_CHANGED]; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback(this._organizationId);
        }
    };
    CorvinaConnect.prototype.off = function (event) {
        if (!event) {
            throw new Error("Event name is required");
        }
        this._eventCallback[event] = [];
    };
    CorvinaConnect.prototype.on = function (event, callback) {
        if (!event) {
            throw new Error("Event name is required");
        }
        if (!callback) {
            throw new Error("Callback is required");
        }
        this._eventCallback[event].push(callback);
    };
    CorvinaConnect.create = function (corvinaHost) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            // postMessage to Corvina parent window
                            window.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);
                            // listen for message from Corvina parent window, that message will contain the context information such as JWT, organizationId and corvinaHost
                            var handleInitResponse_1 = function (event) {
                                var message = event.data;
                                if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {
                                    var _a = message.payload, jwt = _a.jwt, organizationId = _a.organizationId;
                                    window.removeEventListener("message", handleInitResponse_1, false);
                                    resolve(new CorvinaConnect({ jwt: jwt, organizationId: organizationId, corvinaHost: corvinaHost }));
                                }
                            };
                            window.addEventListener('message', handleInitResponse_1);
                        }
                        catch (error) {
                            reject(error);
                        }
                    })];
            });
        });
    };
    return CorvinaConnect;
}());
exports.CorvinaConnect = CorvinaConnect;
window.$corvina = {
    CorvinaConnect: CorvinaConnect,
    CorvinaHost: CorvinaHost,
};
