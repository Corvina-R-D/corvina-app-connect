export interface IMessage {
    type: string;
    payload: any;
}
export declare enum MessageType {
    CORVINA_CONNECT_INIT = "CORVINA_CONNECT_INIT",
    CORVINA_CONNECT_INIT_RESPONSE = "CORVINA_CONNECT_INIT_RESPONSE",
    ORGANIZATION_ID_CHANGED = "ORGANIZATION_ID_CHANGED",
    JWT_CHANGED = "JWT_CHANGED"
}
export interface IDisposable {
    dispose(): void;
}
export declare class CorvinaHost implements IDisposable {
    private _jwt;
    private _organizationId;
    private _corvinaHost;
    private _onMessageRef;
    private constructor();
    dispose(): void;
    set jwt(jwt: string);
    set organizationId(organizationId: string);
    get jwt(): string;
    get organizationId(): string;
    private sendMessageToAllFrames;
    private onMessage;
    private onCorvinaConnectInit;
    static create({ jwt, organizationId, corvinaHost }: {
        jwt: string;
        organizationId: string;
        corvinaHost: string;
    }): Promise<CorvinaHost>;
}
export declare enum CorvinaConnectEventType {
    ORGANIZATION_ID_CHANGED = "ORGANIZATION_ID_CHANGED",
    JWT_CHANGED = "JWT_CHANGED"
}
export declare class CorvinaConnect implements IDisposable {
    private _jwt;
    private _organizationId;
    private _corvinaHost;
    private _eventCallback;
    private _onMessageRef;
    private static _instance;
    constructor({ jwt, organizationId, corvinaHost }: {
        jwt: string;
        organizationId: string;
        corvinaHost: string;
    });
    static dispose(): void;
    dispose(): void;
    get jwt(): string;
    get organizationId(): string;
    get corvinaHost(): string;
    private onMessage;
    private onJwtChanged;
    private onOrganizationIdChanged;
    off(event: CorvinaConnectEventType): void;
    on(event: CorvinaConnectEventType, callback: (value: any) => void): void;
    static create({ corvinaHost, corvinaHostWindow, timeoutMs }: {
        corvinaHost: string;
        corvinaHostWindow?: Window;
        timeoutMs?: number;
    }): Promise<CorvinaConnect>;
}
declare global {
    interface Window {
        $corvina: any;
    }
}
//# sourceMappingURL=index.d.ts.map