import { IDisposable, IMessage, MessageType, CorvinaPages } from "./common";
import { ITheme } from "./ITheme";


export enum CorvinaConnectEventType {
    ORGANIZATION_ID_CHANGED = "ORGANIZATION_ID_CHANGED",
    ORGANIZATION_RESOURCE_ID_CHANGED = "ORGANIZATION_RESOURCE_ID_CHANGED",
    JWT_CHANGED = "JWT_CHANGED",
    USER_CHANGED = "USER_CHANGED",
    THEME_CHANGED = "THEME_CHANGED",
}

const initHandshake = ({ corvinaHostWindow, corvinaHost }: { corvinaHostWindow: Window, corvinaHost: string }): Promise<CorvinaConnect> => {
    return new Promise((resolve, reject) => {
        try {
            // postMessage to Corvina parent window
            corvinaHostWindow?.postMessage({ type: MessageType.CORVINA_CONNECT_INIT }, corvinaHost);

            // listen for message from Corvina parent window, that message will contain the context information such as JWT, organizationId and corvinaHost
            const handleInitResponse = (event: MessageEvent<IMessage>) => {

                console.debug("CorvinaConnect: onMessage", event.data);

                let message: IMessage = event.data;

                if (message.type === MessageType.CORVINA_CONNECT_INIT_RESPONSE) {
                    let { corvinaDomain, jwt, username, organizationId, organizationResourceId, defaultStandardTime, theme } = message.payload

                    window.removeEventListener("message", handleInitResponse, false)

                    resolve(new CorvinaConnect({ jwt, username, organizationId, organizationResourceId, corvinaHost, corvinaDomain, theme, defaultStandardTime, corvinaHostWindow }));
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
    private _username: string;
    private _organizationId: string;
    private _organizationResourceId: string;
    private _corvinaHost: string;
    private _corvinaDomain: string;
    private _theme: ITheme | undefined;
    private _defaultStandardTime: any;
    private _corvinaHostWindow: Window;
    private _eventCallback: { [key: string]: ((value: any) => void)[] } = {};
    private _onMessageRef: (event: MessageEvent<IMessage>) => void;
    private static _instance: CorvinaConnect | undefined;

    public constructor({ jwt, username, organizationId, organizationResourceId, corvinaHost, corvinaDomain, theme, defaultStandardTime, corvinaHostWindow }: { jwt: string, username: string, organizationId: string, organizationResourceId: string, corvinaHost: string, corvinaDomain: string, theme?: ITheme, defaultStandardTime: any, corvinaHostWindow: Window }) {

        if (!jwt) {
            throw new Error('JWT is required');
        }

        if (!username) {
            throw new Error('Username is required');
        }

        if (!organizationId) {
            throw new Error('OrganizationId is required');
        }

        if (!organizationResourceId) {
            throw new Error('OrganizationResourceId is required');
        }

        if (!corvinaHost) {
            throw new Error('CorvinaHost is required');
        }

        if (!corvinaDomain) {
            throw new Error('CorvinaDomain is required');
        }

        if (!corvinaHostWindow) {
            throw new Error('CorvinaHostWindow is required');
        }

        this._jwt = jwt;
        this._username = username;
        this._organizationId = organizationId;
        this._organizationResourceId = organizationResourceId;
        this._corvinaHost = corvinaHost;
        this._corvinaDomain = corvinaDomain;
        this._theme = theme;
        this._defaultStandardTime = defaultStandardTime;
        this._corvinaHostWindow = corvinaHostWindow;

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

    get username(): string {
        return this._username;
    }

    get organizationId(): string {
        return this._organizationId;
    }

    get organizationResourceId(): string | undefined {
        return this._organizationResourceId;
    }

    get corvinaHost(): string {
        return this._corvinaHost;
    }

    get corvinaDomain(): string {
        return this._corvinaDomain;
    }

    get theme(): ITheme | undefined {
        return this._theme;
    }

    get defaultStandardTime(): any {
        return this._defaultStandardTime;
    }

    private onMessage(event: MessageEvent<IMessage>) {

        console.debug("CorvinaConnect: onMessage", event.data);

        switch (event.data.type) {
            case MessageType.USER_CHANGED:
                this.onUserChanged(event);
                break;
            case MessageType.JWT_CHANGED:
                this.onJwtChanged(event);
                break;
            case MessageType.ORGANIZATION_ID_CHANGED:
                this.onOrganizationIdChanged(event);
                break;
            case MessageType.ORGANIZATION_RESOURCE_ID_CHANGED:
                this.onOrganizationResourceIdChanged(event);
                break;
            case MessageType.THEME_CHANGED:
                this.onThemeChanged(event);
                break;
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

    private onUserChanged(event: MessageEvent<IMessage>) {
        this._username = event.data.payload.username;

        for (const callback of this._eventCallback[CorvinaConnectEventType.USER_CHANGED]) {
            callback(this._username);
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

    private onOrganizationResourceIdChanged(event: MessageEvent<IMessage>) {
        this._organizationResourceId = event.data.payload.organizationResourceId;

        for (const callback of this._eventCallback[CorvinaConnectEventType.ORGANIZATION_RESOURCE_ID_CHANGED]) {
            callback(this._organizationResourceId);
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

    public navigateTo(page: string | CorvinaPages) { 
        if (!page) {
            throw new Error("Path is required");
        }
        
        const message = {
            type: MessageType.CORVINA_NAVIGATE,
            payload: {
                page
            }
        } as IMessage
        this._corvinaHostWindow.postMessage(message, this._corvinaHost);
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