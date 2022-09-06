export interface IMessage {
    type: string;
}
export declare class CorvinaHost {
    constructor();
    private onMessage;
    private onCorvinaConnectInit;
    static create(): Promise<CorvinaHost>;
}
export declare class CorvinaConnect {
    private _jwt;
    private _organizationId;
    private _corvinaHost;
    constructor({ jwt, organizationId, corvinaHost }: {
        jwt: string;
        organizationId: string;
        corvinaHost: string;
    });
    get jwt(): string;
    get organizationId(): string;
    get corvinaHost(): string;
    static create(corvinaHost: string): Promise<CorvinaConnect>;
}
declare global {
    interface Window {
        $corvina: any;
    }
}
//# sourceMappingURL=index.d.ts.map