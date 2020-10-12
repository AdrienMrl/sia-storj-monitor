export enum HostType {
    STORJ,
    SIA
}

export interface Host {
    _id?: string;
    port: number;
    type: HostType;
    apipassword?: string;
}