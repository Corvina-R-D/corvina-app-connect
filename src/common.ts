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
