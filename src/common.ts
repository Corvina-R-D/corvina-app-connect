export interface IMessage {
    type: string;
    payload: any;
}

export enum MessageType {
    CORVINA_CONNECT_INIT = "CORVINA_CONNECT_INIT",
    CORVINA_CONNECT_INIT_RESPONSE = "CORVINA_CONNECT_INIT_RESPONSE",
    ORGANIZATION_ID_CHANGED = "ORGANIZATION_ID_CHANGED",
    ORGANIZATION_RESOURCE_ID_CHANGED = "ORGANIZATION_RESOURCE_ID_CHANGED",
    JWT_CHANGED = "JWT_CHANGED",
    USER_CHANGED = "USER_CHANGED",
    THEME_CHANGED = "THEME_CHANGED",
    CORVINA_NAVIGATE = "CORVINA_NAVIGATE",
    BRAND_NAME_CHANGED = "BRAND_NAME_CHANGED",
    IFRAME_HREF_CHANGED = "IFRAME_HREF_CHANGED",
    TRANSACTIONS_AUTHORIZATION_REQUEST = "TRANSACTIONS_AUTHORIZATION_REQUEST",
    TRANSACTIONS_AUTHORIZATION_RESPONSE = "TRANSACTIONS_AUTHORIZATION_RESPONSE",
    USER_PREFERENCE_GET_REQUEST = "USER_PREFERENCE_GET_REQUEST",
    USER_PREFERENCE_GET_RESPONSE = "USER_PREFERENCE_GET_RESPONSE",
    USER_PREFERENCE_SET_REQUEST = "USER_PREFERENCE_SET_REQUEST",
    USER_PREFERENCE_SET_RESPONSE = "USER_PREFERENCE_SET_RESPONSE",
}

export enum CorvinaPages {
    HOME = "home",
    DASHBOARD = "dashboard",
    DEVICE_ACTIVATE = "device-activate",
    DEVICE_MANAGE = "device-manage",
    DEVICE_VPN = "device-vpn",
    DATA_CONFIGURE = "data-configure",
    DATA_EXPLORE = "data-explore",
    DATA_ALARMS = "data-alarms",
    DATA_NOTIFICATIONS = "data-notifications",
    IAM_ORGANIZATIONS = "iam-organizations",
    IAM_USERS = "iam-users",
    IAM_ROLES = "iam-roles",
    DEALER = "dealer",
    AUDIT = "audit", // deprecated
    LOG = "log",
}

export interface IDisposable {
    dispose(): void;
}

export const appHrefQueryString = 'appHref';

export interface IJwtApp {
    jwt: string;
    iframeOrigin: string;
}
export type IJwtAppMap = Map<string, IJwtApp>; // iframeOrigin -> IJwtApp

export interface PreauthorizedCreditTransactionInDTO {
    orderId: string;
    targetWalletId: string;
    amount: number;
    sourceOrgResourceId?: string;
    sourceWalletId?: string;
    description?: string;
    executionMinTime?: Date;
    executionMaxTime?: Date;
    periodicity?: string;
    ordinal?: number;
    executionMaxOrdinal?: number;
    transactionSubjectType?: string;
    transactionSubjectRef?: string;
    transactionSubjectQuantity?: number;
    transactionData?: Map<String, Object>;
}

export interface PreauthorizedCreditTransactionOutDTO {
    orderId: string,
    authorizedBy?: string,
    targetWalletId: string,
    amount: number,
    sourceOrgResourceId?: string,
    sourceWalletId?: string,
    description?: string,
    executionMinTime?: Date,
    executionMaxTime?: Date,
    periodicity?: string,
    ordinal?: number,
    executionMaxOrdinal?: number,
    transactionSubjectType?: string,
    transactionSubjectRef?: string,
    transactionSubjectQuantity?: number,
    transactionData?: Map<String, Object>,
    id: number,
    orgResourceId: string,
    entityId: number,
    entityStringId: string,
    entityType: string,
    state: string,
}

export enum TransactionsAuthorizationDialogResponseMessage {
    AUTHORIZED = "AUTHORIZED",
    USER_REJECTED = "USER_REJECTED",
    ERROR_NO_EMPTY_TRANSACTIONS = "ERROR_NO_EMPTY_TRANSACTIONS",
    ERROR_NO_IN_APP_PURCHASES = "ERROR_NO_IN_APP_PURCHASES",
}

export class TransactionsAuthorizationDialogResponse {
    status!: number;
    payload!: PreauthorizedCreditTransactionOutDTO[] | null;
    msg!: TransactionsAuthorizationDialogResponseMessage;

    constructor(status: number, payload: PreauthorizedCreditTransactionOutDTO[] | null, msg: TransactionsAuthorizationDialogResponseMessage) {
        this.status = status;
        this.payload = payload;
        this.msg = msg;
    }
}
