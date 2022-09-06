
export interface IMessage {
    type: string;
    // payload: any;
}

enum MessageType {
    CORVINA_CONNECT_INIT = "corvina-connect-init",
    CORVINA_CONNECT_INIT_RESPONSE = "corvina-connect-init-response",
    ORGANIZATION_ID_CHANGED = "organization-id-changed",
    JWT_REFRESHED = "jwt-refreshed",
}

export class CorvinaHost {

    constructor() {

        window.addEventListener("message", this.onMessage.bind(this));
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
        };

        // event.source.postMessage(response, event.origin);
    }

    static async create(): Promise<CorvinaHost> {

        return new CorvinaHost();
    }
}

export class CorvinaConnect {
    private _jwt: string;
    private _organizationId: string;
    private _corvinaHost: string;

    constructor({ jwt, organizationId, corvinaHost }: { jwt: string, organizationId: string, corvinaHost: string }) {
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;

        // listener on postMessage from Corvina parent window
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

    static async create(corvinaHost: string): Promise<CorvinaConnect> {
        // postMessage to Corvina parent window
        window.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);

        // listen for message from Corvina parent window, that message will contain the context information such as JWT, organizationId and corvinaHost
        window.addEventListener('message', (event) => {
            let message: IMessage = event.data;

            if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {

            }
        });

        return new CorvinaConnect({ jwt: "", organizationId: "", corvinaHost });
    }
}

declare global {
    interface Window { $corvina: any; }
}

window.$corvina = {
    CorvinaConnect,
    CorvinaHost,
};