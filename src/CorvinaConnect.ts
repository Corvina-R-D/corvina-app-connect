import { IDisposable, IMessage, MessageType } from "./common";
import { ITheme } from "./ITheme";


export enum CorvinaConnectEventType {
    ORGANIZATION_ID_CHANGED = "ORGANIZATION_ID_CHANGED",
    JWT_CHANGED = "JWT_CHANGED",
    THEME_CHANGED = "THEME_CHANGED",
}

const initHandshake = ({ corvinaHostWindow, corvinaHost }: { corvinaHostWindow: Window, corvinaHost: string }): Promise<CorvinaConnect> => {
    return new Promise((resolve, reject) => {
        try {
            // postMessage to Corvina parent window
            corvinaHostWindow?.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);

            // listen for message from Corvina parent window, that message will contain the context information such as JWT, organizationId and corvinaHost
            const handleInitResponse = (event: MessageEvent<IMessage>) => {

                console.log("CorvinaConnect: onMessage", event.data);

                let message: IMessage = event.data;

                if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {
                    let { jwt, organizationId, theme } = message.payload

                    window.removeEventListener("message", handleInitResponse, false)

                    resolve(new CorvinaConnect({ jwt, organizationId, corvinaHost, theme }));
                }
            };

            window.addEventListener('message', handleInitResponse);

        } catch (error) {
            reject(error);
        }

    })
}

export class CorvinaConnect implements IDisposable {
    private _jwt: string;
    private _organizationId: string;
    private _corvinaHost: string;
    private _theme: ITheme | undefined;
    private _eventCallback: { [key: string]: ((value: any) => void)[] } = {};
    private _onMessageRef: (event: MessageEvent<IMessage>) => void;
    private static _instance: CorvinaConnect | undefined;

    public constructor({ jwt, organizationId, corvinaHost, theme }: { jwt: string, organizationId: string, corvinaHost: string, theme?: ITheme }) {

        if (!jwt) {
            throw new Error('JWT is required');
        }

        if (!organizationId) {
            throw new Error('OrganizationId is required');
        }

        if (!corvinaHost) {
            throw new Error('CorvinaHost is required');
        }

        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;
        this._theme = theme;

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

    get theme(): ITheme | undefined {
        return this._theme;
    }

    private onMessage(event: MessageEvent<IMessage>) {

        console.log("CorvinaConnect: onMessage", event.data);

        switch (event.data.type) {
            case MessageType.JWT_CHANGED:
                this.onJwtChanged(event);
                break;
            case MessageType.ORGANIZATION_ID_CHANGED:
                this.onOrganizationIdChanged(event);
                break;
            case MessageType.THEME_CHANGED:
                this.onThemeChanged(event);
            default:
                break;
        }
    }

    private onThemeChanged(event: MessageEvent<IMessage>) {
        this._theme = event.data.payload.theme;

        for (const callback of this._eventCallback[CorvinaConnectEventType.THEME_CHANGED]) {
            callback(this._theme);
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

    static async create({ corvinaHost, corvinaHostWindow, timeoutMs }: { corvinaHost: string, corvinaHostWindow?: Window, timeoutMs?: number }): Promise<CorvinaConnect> {

        if (!this._instance) {
            corvinaHostWindow = corvinaHostWindow || window.parent.window;

            const initHandshakePromise = initHandshake({ corvinaHostWindow, corvinaHost });
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(reject, timeoutMs ?? 5000, 'Create timeout reached');
            });

            this._instance = (await Promise.race([initHandshakePromise, timeoutPromise]) as CorvinaConnect)
        }

        return this._instance;
    }
}