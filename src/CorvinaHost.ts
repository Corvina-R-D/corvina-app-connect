import { IDisposable, IMessage, MessageType } from './common'
import { ITheme } from './ITheme';

export class CorvinaHost implements IDisposable {
    private _jwt: string;
    private _organizationId: string;
    private _corvinaHost: string;
    private _theme: ITheme | undefined;
    private _onMessageRef: (event: MessageEvent<IMessage>) => void;

    private constructor({ jwt, organizationId, corvinaHost, theme }: { jwt: string, organizationId: string, corvinaHost: string, theme?: ITheme }) {
        this._jwt = jwt;
        this._organizationId = organizationId;
        this._corvinaHost = corvinaHost;
        this._theme = theme;

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

        this.sendMessageToAllFrames(message);
    }

    set organizationId(organizationId: string) {
        this._organizationId = organizationId;

        const message: IMessage = {
            type: MessageType.ORGANIZATION_ID_CHANGED,
            payload: {
                organizationId,
            },
        };

        this.sendMessageToAllFrames(message);
    }

    set theme(theme: ITheme | undefined) {
        this._theme = theme;

        const message: IMessage = {
            type: MessageType.THEME_CHANGED,
            payload: {
                theme,
            },
        };

        this.sendMessageToAllFrames(message);
    }

    get jwt(): string {
        return this._jwt;
    }

    get organizationId(): string {
        return this._organizationId;
    }

    get theme(): ITheme | undefined {
        return this._theme;
    }

    private sendMessageToAllFrames(message: IMessage) {
        // retrieve all iframes in the page
        const iframes = document.getElementsByTagName("iframe");

        // send a message to each iframe
        for (const iframe of iframes) {
            iframe.contentWindow?.postMessage(message, { targetOrigin: iframe.src });
        }
    }

    private onMessage(event: MessageEvent<IMessage>) {

        console.log("CorvinaHost: onMessage", event.data);

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
                theme: this._theme,
            },
        };

        if (event.source) {
            event.source.postMessage(response, { targetOrigin: event.origin });
        } else {
            console.warn('CorvinaHost: Event source is not defined', event)
        }
    }

    static async create({ jwt, organizationId, corvinaHost, theme }: { jwt: string, organizationId: string, corvinaHost: string, theme?: ITheme }): Promise<CorvinaHost> {

        return new CorvinaHost({ jwt, organizationId, corvinaHost, theme });
    }
}