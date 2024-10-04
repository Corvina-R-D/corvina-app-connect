import { CorvinaPages, IDisposable, IMessage, MessageType } from "./common";
import { ITheme } from "./ITheme";

export class CorvinaHost implements IDisposable {
  private _jwt: string;
  private _username: string;
  private _organizationId: string;
  private _organizationResourceId: string;
  private _corvinaHost: string;
  private _corvinaDomain: string;
  private _theme: ITheme | undefined;
  private _defaultStandardTime: any;
  private _onMessageRef: (event: MessageEvent<IMessage>) => void;
  private _onNavigateCallback:
    | ((input: { page: string | CorvinaPages }) => void)
    | undefined;

  private constructor({
    jwt,
    username,
    organizationId,
    organizationResourceId,
    corvinaHost,
    corvinaDomain,
    theme,
    defaultStandardTime,
  }: {
    jwt: string;
    username: string;
    organizationId: string;
    organizationResourceId: string;
    corvinaHost: string;
    corvinaDomain: string;
    theme?: ITheme;
    defaultStandardTime: any;
  }) {
    this._jwt = jwt;
    this._username = username;
    this._organizationId = organizationId;
    this._organizationResourceId = organizationResourceId;
    this._corvinaHost = corvinaHost;
    this._corvinaDomain = corvinaDomain;
    this._theme = theme;
    this._defaultStandardTime = defaultStandardTime;
    this._onMessageRef = this.onMessage.bind(this);
    window.addEventListener("message", this._onMessageRef);
  }

  dispose() {
    window.removeEventListener("message", this._onMessageRef);
  }

  onNavigate(callback: (input: { page: string | CorvinaPages }) => void): void {
    this._onNavigateCallback = callback;
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

  set username(username: string) {
    this._username = username;

    const message: IMessage = {
      type: MessageType.USER_CHANGED,
      payload: {
        username,
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

  set organizationResourceId(organizationResourceId: string) {
    this._organizationResourceId = organizationResourceId;

    const message: IMessage = {
      type: MessageType.ORGANIZATION_RESOURCE_ID_CHANGED,
      payload: {
        organizationResourceId,
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

  set defaultStandardTime(defaultStandardTime: any) {
    this._defaultStandardTime = defaultStandardTime;
  }

  get defaultStandardTime(): any {
    return this._defaultStandardTime;
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
      if (iframe.id && iframe.id.startsWith("corvina-app-connect-")) {
        iframe.contentWindow?.postMessage(message, {
          targetOrigin: iframe.src,
        });
      }
    }
  }

  private onMessage(event: MessageEvent<IMessage>) {
    console.debug("CorvinaHost: onMessage", event.data);

    switch (event.data.type) {
      case MessageType.CORVINA_CONNECT_INIT:
        this.onCorvinaConnectInit(event);
        break;
      case MessageType.CORVINA_NAVIGATE:
        if (!this._onNavigateCallback) {
          console.warn("CorvinaHost: onNavigate callback is not defined");
        }
        this._onNavigateCallback?.(event.data.payload);
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
        username: this._username,
        organizationId: this._organizationId,
        organizationResourceId: this._organizationResourceId,
        corvinaHost: this._corvinaHost,
        corvinaDomain: this._corvinaDomain,
        theme: this._theme,
        defaultStandardTime: this._defaultStandardTime,
      },
    };

    if (event.source) {
      event.source.postMessage(response, { targetOrigin: event.origin });
    } else {
      console.warn("CorvinaHost: Event source is not defined", event);
    }
  }

  static async create({
    jwt,
    username,
    organizationId,
    organizationResourceId,
    corvinaHost,
    corvinaDomain,
    theme,
    defaultStandardTime,
  }: {
    jwt: string;
    username: string;
    organizationId: string;
    organizationResourceId: string;
    corvinaHost: string;
    corvinaDomain: string;
    theme?: ITheme;
    defaultStandardTime: any;
  }): Promise<CorvinaHost> {
    return new CorvinaHost({ jwt, username, organizationId, organizationResourceId, corvinaHost, corvinaDomain, theme, defaultStandardTime });
  }
}
