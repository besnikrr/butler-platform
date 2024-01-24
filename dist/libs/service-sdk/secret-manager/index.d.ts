export interface ISecretValue {
    [key: string]: string;
}
export declare const SecretManagerService: () => {
    getSecretValue: (SecretId: string) => Promise<ISecretValue>;
};
