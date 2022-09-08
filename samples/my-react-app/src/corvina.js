var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var MessageType;
(function (MessageType) {
    MessageType["CORVINA_CONNECT_INIT"] = "CORVINA_CONNECT_INIT";
    MessageType["CORVINA_CONNECT_INIT_RESPONSE"] = "CORVINA_CONNECT_INIT_RESPONSE";
    MessageType["ORGANIZATION_ID_CHANGED"] = "ORGANIZATION_ID_CHANGED";
    MessageType["JWT_CHANGED"] = "JWT_CHANGED";
})(MessageType || (MessageType = {}));
export class CorvinaHost {
    constructor({ jwt, organizationId, corvinaHost }) {
        this._initializedApps = {};
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
        this.postMessageToAllInitializedApps(message);
    }
    set organizationId(organizationId) {
        this._organizationId = organizationId;
        const message = {
            type: MessageType.ORGANIZATION_ID_CHANGED,
            payload: {
                organizationId,
            },
        };
        this.postMessageToAllInitializedApps(message);
    }
    get jwt() {
        return this._jwt;
    }
    get organizationId() {
        return this._organizationId;
    }
    postMessageToAllInitializedApps(message) {
        for (const app in this._initializedApps) {
            let source = this._initializedApps[app];
            source.postMessage(message, { targetOrigin: app });
        }
    }
    onMessage(event) {
        console.log("CorvinaHost: onMessage", event.data);
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
            this._initializedApps[event.origin] = event.source;
        }
        else {
            console.warn('CorvinaHost: Event source is not defined', event);
        }
    }
    static create({ jwt, organizationId, corvinaHost }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new CorvinaHost({ jwt, organizationId, corvinaHost });
        });
    }
}
export var CorvinaConnectEventType;
(function (CorvinaConnectEventType) {
    CorvinaConnectEventType["ORGANIZATION_ID_CHANGED"] = "ORGANIZATION_ID_CHANGED";
    CorvinaConnectEventType["JWT_CHANGED"] = "JWT_CHANGED";
})(CorvinaConnectEventType || (CorvinaConnectEventType = {}));
export class CorvinaConnect {
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
        console.log("CorvinaConnect: onMessage", event.data);
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
                            console.log("CorvinaConnect: onMessage", event.data);
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
window.$corvina = {
    CorvinaConnect,
    CorvinaHost,
};