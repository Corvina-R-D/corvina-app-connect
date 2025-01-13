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
    LOG = "log",
}

export interface IDisposable {
    dispose(): void;
}
