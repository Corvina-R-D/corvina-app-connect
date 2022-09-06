
interface CorvinaMessageEvent {
    data: IMessage;
    origin: string;
    source: Window;
}

export interface IMessage {
    type: string;
    payload: any;
}

export enum MessageType {
    CORVINA_CONNECT_INIT = "corvina-connect-init",
    CORVINA_CONNECT_INIT_RESPONSE = "corvina-connect-init-response",
    ORGANIZATION_ID_CHANGED = "organization-id-changed",
    JWT_CHANGED = "jwt-changed",
}

export class CorvinaHost {
    private _jwt: string;
    private _organizationId: string;
    private _corvinaHost: string;

    constructor({ jwt, organizationId, corvinaHost }: { jwt: string, organizationId: string, corvinaHost: string }) {
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;

        window.addEventListener("message", this.onMessage.bind(this));
    }

    set jwt(jwt: string) {
        this._jwt = jwt;

        const message: IMessage = {
            type: MessageType.JWT_CHANGED,
            payload: {
                jwt,
            },
        };

        window.postMessage(message, "*");
    }

    set organizationId(organizationId: string) {
        this._organizationId = organizationId;

        const message: IMessage = {
            type: MessageType.ORGANIZATION_ID_CHANGED,
            payload: {
                organizationId,
            },
        };

        window.postMessage(message, "*");
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

        // TODO: cast added only for typescript, flavio??
        (<CorvinaMessageEvent>event).source.postMessage(response, event.origin);
    }

    static async create({ jwt, organizationId, corvinaHost }: { jwt: string, organizationId: string, corvinaHost: string }): Promise<CorvinaHost> {

        return new CorvinaHost({ jwt, organizationId, corvinaHost });
    }
}

export enum CorvinaConnectEventType {
    ORGANIZATION_ID_CHANGED = "organization-id-changed",
    JWT_CHANGED = "jwt-changed",
}

export class CorvinaConnect {
    private _jwt: string;
    private _organizationId: string;
    private _corvinaHost: string;
    private _eventCallback: { [key: string]: ((value: any) => void) } = {};

    constructor({ jwt, organizationId, corvinaHost }: { jwt: string, organizationId: string, corvinaHost: string }) {
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;

        // listener on postMessage from Corvina parent window
        window.addEventListener("message", this.onMessage.bind(this));
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

        if (this._eventCallback[CorvinaConnectEventType.JWT_CHANGED]) {
            this._eventCallback[CorvinaConnectEventType.JWT_CHANGED](this._jwt);
        }
    }

    private onOrganizationIdChanged(event: MessageEvent<IMessage>) {
        this._organizationId = event.data.payload.organizationId;

        if (this._eventCallback[CorvinaConnectEventType.ORGANIZATION_ID_CHANGED]) {
            this._eventCallback[CorvinaConnectEventType.ORGANIZATION_ID_CHANGED](this._organizationId);
        }
    }

    public on(event: CorvinaConnectEventType, callback: (value: any) => void) {
        if (!event) {
            throw new Error("Event name is required");

        }

        this._eventCallback[event] = callback;
    }

    static async create(corvinaHost: string): Promise<CorvinaConnect> {

        return new Promise((resolve, reject) => {
            try {
                // postMessage to Corvina parent window
                window.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);

                // listen for message from Corvina parent window, that message will contain the context information such as JWT, organizationId and corvinaHost
                const handleInitResponse = (event: MessageEvent<IMessage>) => {
                    let message: IMessage = event.data;

                    if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {
                        let { jwt, organizationId } = message.payload

                        window.removeEventListener("message", handleInitResponse, false)

                        resolve(new CorvinaConnect({ jwt, organizationId, corvinaHost }))
                    }
                };

                window.addEventListener('message', handleInitResponse);

            } catch (error) {
                reject(error);
            }

        });
    }
}

declare global {
    interface Window { $corvina: any; }
}

window.$corvina = {
    CorvinaConnect,
    CorvinaHost,
};