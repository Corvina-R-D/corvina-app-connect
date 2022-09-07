
export interface IMessage {
    type: string;
    payload: any;
}

export enum MessageType {
    CORVINA_CONNECT_INIT = "CORVINA_CONNECT_INIT",
    CORVINA_CONNECT_INIT_RESPONSE = "CORVINA_CONNECT_INIT_RESPONSE",
    ORGANIZATION_ID_CHANGED = "ORGANIZATION_ID_CHANGED",
    JWT_CHANGED = "JWT_CHANGED",
}

export interface IDisposable {
    dispose(): void;
}

export class CorvinaHost implements IDisposable {
    private _jwt: string;
    private _organizationId: string;
    private _corvinaHost: string;
    private _onMessageRef: (event: MessageEvent<IMessage>) => void;

    private constructor({ jwt, organizationId, corvinaHost }: { jwt: string, organizationId: string, corvinaHost: string }) {
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;

        this._onMessageRef = this.onMessage.bind(this);
        window.addEventListener("message", this._onMessageRef);
    }

    dispose() {
        window.removeEventListener("message", this._onMessageRef);
    }

    set jwt(jwt: string) {
        this._jwt = jwt;

        const message: IMessage = {
            type: MessageType.JWT_CHANGED,
            payload: {
                jwt,
            },
        };

        window.postMessage(message, "*"); // TODO: change it in a list of initialized applications
    }

    set organizationId(organizationId: string) {
        this._organizationId = organizationId;

        const message: IMessage = {
            type: MessageType.ORGANIZATION_ID_CHANGED,
            payload: {
                organizationId,
            },
        };

        window.postMessage(message, "*"); // TODO: change it in a list of initialized applications
    }

    get jwt(): string {
        return this._jwt;
    }

    get organizationId(): string {
        return this._organizationId;
    }

    private onMessage(event: MessageEvent<IMessage>) {

        console.log("onMessage", event.data);

        switch (event.data.type) {
            case MessageType.CORVINA_CONNECT_INIT:
                this.onCorvinaConnectInit(event);
                break;
            default:
                break;
        }
    }

    private onCorvinaConnectInit(event: MessageEvent<IMessage>) {

        const response: IMessage = {
            type: MessageType.CORVINA_CONNECT_INIT_RESPONSE,
            payload: {
                jwt: this._jwt,
                organizationId: this._organizationId,
                corvinaHost: this._corvinaHost,
            },
        };

        if (event.source) {
            event.source.postMessage(response, { targetOrigin: event.origin });
        } else {
            console.warn('Event source is not defined', event)
        }
    }

    static async create({ jwt, organizationId, corvinaHost }: { jwt: string, organizationId: string, corvinaHost: string }): Promise<CorvinaHost> {

        return new CorvinaHost({ jwt, organizationId, corvinaHost });
    }
}

export enum CorvinaConnectEventType {
    ORGANIZATION_ID_CHANGED = "ORGANIZATION_ID_CHANGED",
    JWT_CHANGED = "JWT_CHANGED",
}

export class CorvinaConnect implements IDisposable {
    private _jwt: string;
    private _organizationId: string;
    private _corvinaHost: string;
    private _eventCallback: { [key: string]: ((value: any) => void)[] } = {};
    private _onMessageRef: (event: MessageEvent<IMessage>) => void;
    private static _instance : CorvinaConnect | undefined;

    private constructor({ jwt, organizationId, corvinaHost }: { jwt: string, organizationId: string, corvinaHost: string }) {
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;
        
        this._eventCallback = Object.keys(CorvinaConnectEventType).reduce((acc: any, key: string) => {
            acc[key] = [];
            return acc;
        }, {});

        // listener on postMessage from Corvina parent window
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

    get jwt(): string {
        return this._jwt;
    }

    get organizationId(): string {
        return this._organizationId;
    }

    get corvinaHost(): string {
        return this._corvinaHost;
    }

    private onMessage(event: MessageEvent<IMessage>) {

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

    private onJwtChanged(event: MessageEvent<IMessage>) {
        this._jwt = event.data.payload.jwt;

        for (const callback of this._eventCallback[CorvinaConnectEventType.JWT_CHANGED]) {
            callback(this._jwt);
        }
    }

    private onOrganizationIdChanged(event: MessageEvent<IMessage>) {
        this._organizationId = event.data.payload.organizationId;

        for (const callback of this._eventCallback[CorvinaConnectEventType.ORGANIZATION_ID_CHANGED]) {
            callback(this._organizationId);
        }
    }

    public off(event: CorvinaConnectEventType) {
        if (!event) {
            throw new Error("Event name is required");
        }

        this._eventCallback[event] = [];
    }

    public on(event: CorvinaConnectEventType, callback: (value: any) => void) {
        if (!event) {
            throw new Error("Event name is required");
        }

        if (!callback) {
            throw new Error("Callback is required")
        }

        this._eventCallback[event].push(callback);
    }

    static async create({ corvinaHost, corvinaHostWindow } : {corvinaHost: string, corvinaHostWindow: Window}): Promise<CorvinaConnect> {
        if (!this._instance) {
            return new Promise((resolve, reject) => {
                try {
                    // postMessage to Corvina parent window
                    corvinaHostWindow.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);
    
                    // listen for message from Corvina parent window, that message will contain the context information such as JWT, organizationId and corvinaHost
                    const handleInitResponse = (event: MessageEvent<IMessage>) => {
                        let message: IMessage = event.data;
    
                        if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {
                            let { jwt, organizationId } = message.payload
    
                            window.removeEventListener("message", handleInitResponse, false)
    
                            this._instance = new CorvinaConnect({ jwt, organizationId, corvinaHost });

                            resolve(this._instance);
                        }
                    };
    
                    window.addEventListener('message', handleInitResponse);
    
                } catch (error) {
                    reject(error);
                }
    
            });
        }

        return this._instance;
    }
}

declare global {
    interface Window { $corvina: any; }
}

window.$corvina = {
    CorvinaConnect,
    CorvinaHost,
};