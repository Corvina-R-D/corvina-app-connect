System.register([], function (exports_1, context_1) {
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
    var MessageType, CorvinaHost, CorvinaConnect;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            (function (MessageType) {
                MessageType["CORVINA_CONNECT_INIT"] = "corvina-connect-init";
                MessageType["CORVINA_CONNECT_INIT_RESPONSE"] = "corvina-connect-init-response";
            })(MessageType || (MessageType = {}));
            CorvinaHost = class CorvinaHost {
                constructor() {
                    window.addEventListener("message", this.onMessage.bind(this));
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
                    };
                }
                static create() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return new CorvinaHost();
                    });
                }
            };
            exports_1("CorvinaHost", CorvinaHost);
            CorvinaConnect = class CorvinaConnect {
                constructor({ jwt, organizationId, corvinaHost }) {
                    this._jwt = jwt;
                    this._organizationId = organizationId;
                    this._corvinaHost = corvinaHost;
                }
                get jwt() {
                    return this.jwt;
                }
                get organizationId() {
                    return this.organizationId;
                }
                get corvinaHost() {
                    return this.corvinaHost;
                }
                static create(corvinaHost) {
                    return __awaiter(this, void 0, void 0, function* () {
                        window.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);
                        window.addEventListener('message', (event) => {
                            let message = event.data;
                            if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {
                            }
                        });
                        return new CorvinaConnect({ jwt: "", organizationId: "", corvinaHost });
                    });
                }
            };
            exports_1("CorvinaConnect", CorvinaConnect);
            window.$corvina = {
                CorvinaConnect,
                CorvinaHost,
            };
        }
    };
});
//# sourceMappingURL=index.js.map