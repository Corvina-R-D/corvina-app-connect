import { CorvinaPages, IDisposable, IJwtApp, IJwtAppMap, IMessage, MessageType } from "./common";
import { UrlWatcher } from "./hrefwatcher";
import { ITheme } from "./ITheme";

export class CorvinaHost implements IDisposable {
  private _jwtApp: IJwtAppMap;
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
  private _brandName: string;
  private _onIFrameHrefChanged: ((href: string) => void) | undefined;
  private _urlWatcher: UrlWatcher | undefined;
  private _appHref: string | undefined;
  private _onPreauthorizedTransactionAuthorizationRequestCallback: ((event: MessageEvent<IMessage>) => void) | undefined;

  private constructor({
    jwtApp,
    username,
    organizationId,
    organizationResourceId,
    corvinaHost,
    corvinaDomain,
    theme,
    defaultStandardTime,
    brandName,
  }: {
    jwtApp: IJwtAppMap;
    username: string;
    organizationId: string;
    organizationResourceId: string;
    corvinaHost: string;
    corvinaDomain: string;
    theme?: ITheme;
    defaultStandardTime: any;
    brandName: string;
  }) {
    this._jwtApp = jwtApp;
    this._username = username;
    this._organizationId = organizationId;
    this._organizationResourceId = organizationResourceId;
    this._corvinaHost = corvinaHost;
    this._corvinaDomain = corvinaDomain;
    this._theme = theme;
    this._defaultStandardTime = defaultStandardTime;
    this._onMessageRef = this.onMessage.bind(this);
    this._brandName = brandName;
    window.addEventListener("message", this._onMessageRef);
  }

  dispose() {
    window.removeEventListener("message", this._onMessageRef);
    this._urlWatcher?.dispose();
    this._urlWatcher = undefined;
  }

  onNavigate(callback: (input: { page: string | CorvinaPages }) => void): void {
    this._onNavigateCallback = callback;
  }

  onPreauthorizedTransactionAuthorizationRequest(callback: (event: MessageEvent<IMessage>) => void): void {
    this._onPreauthorizedTransactionAuthorizationRequestCallback = callback;
  }

  setJwtApp(jwtApp: IJwtApp) {
    const message: IMessage = {
      type: MessageType.JWT_CHANGED,
      payload: {
        jwt: jwtApp.jwt,
      },
    };

    this._jwtApp.set(jwtApp.iframeOrigin, jwtApp);

    this.sendMessageToFrame(message, jwtApp.iframeOrigin);
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

  set brandName(brandName: string) {
    this._brandName = brandName;

    const message: IMessage = {
      type: MessageType.BRAND_NAME_CHANGED,
      payload: {
        brandName,
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

  get organizationId(): string {
    return this._organizationId;
  }

  get theme(): ITheme | undefined {
    return this._theme;
  }

  get brandName(): string {
    return this._brandName;
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

  private sendMessageToFrame(message: IMessage, iframeOrigin: string) {
    // retrieve all iframes in the page with source starting with iframeOrigin
    const iframes = document.querySelectorAll(`iframe[src^='${iframeOrigin}']`) as NodeListOf<HTMLIFrameElement>;

    for (const iframe of iframes) { 
      iframe.contentWindow?.postMessage(message, {
        targetOrigin: iframe.src,
      });
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
          break;
        }

        this._onNavigateCallback?.(event.data.payload);
        break;
      case MessageType.IFRAME_HREF_CHANGED:
        if (event.data.payload.href && this._appHref !== event.data.payload.href) {
          this._appHref = event.data.payload.href;
          if (this._urlWatcher && this._appHref) {
            this._urlWatcher.setAppHref(this._appHref, event.data.payload.type);
          }
        }
        break;
      case MessageType.TRANSACTIONS_AUTHORIZATION_REQUEST:
        if (!this._onPreauthorizedTransactionAuthorizationRequestCallback) {
          console.warn("CorvinaHost: onPaymentAuthorizationRequest callback is not defined");
          break;
        }

        this._onPreauthorizedTransactionAuthorizationRequestCallback?.(event);
        break;
      default:
        break;
    }
  }

  private onCorvinaConnectInit(event: MessageEvent<IMessage>) {
    const response: IMessage = {
      type: MessageType.CORVINA_CONNECT_INIT_RESPONSE,
      payload: {
        jwt: this._jwtApp.get(event.origin)?.jwt,
        username: this._username,
        organizationId: this._organizationId,
        organizationResourceId: this._organizationResourceId,
        corvinaHost: this._corvinaHost,
        corvinaDomain: this._corvinaDomain,
        theme: this._theme,
        defaultStandardTime: this._defaultStandardTime,
        brandName: this._brandName,	
      },
    };

    if (event.source) {
      event.source.postMessage(response, { targetOrigin: event.origin });
    } else {
      console.warn("CorvinaHost: Event source is not defined", event);
    }
  }

  static async create({
    jwtApp,
    username,
    organizationId,
    organizationResourceId,
    corvinaHost,
    corvinaDomain,
    theme,
    defaultStandardTime,
    brandName,
  }: {
    jwtApp: IJwtAppMap;
    username: string;
    organizationId: string;
    organizationResourceId: string;
    corvinaHost: string;
    corvinaDomain: string;
    theme?: ITheme;
    defaultStandardTime: any;
    brandName: string;
  }): Promise<CorvinaHost> {
    return new CorvinaHost({ jwtApp, username, organizationId, organizationResourceId, corvinaHost, corvinaDomain, theme, defaultStandardTime, brandName });
  }

  enableNavigationSync() {
    // initialize appHref
    this._appHref = UrlWatcher.extractAppHref();

    this._urlWatcher = new UrlWatcher(({type}) => {
      const newAppHref = UrlWatcher.extractAppHref();
      if (newAppHref !== this._appHref) {
        const message: IMessage = {
          type: MessageType.IFRAME_HREF_CHANGED,
          payload: {
            href: newAppHref,
            type 
          },
        }
        this.sendMessageToAllFrames(message);  
        this._appHref = newAppHref;
      }
    });  
  }

  disableNavigationSync() {
    this._urlWatcher?.dispose();
    this._urlWatcher = undefined;
  }
}
