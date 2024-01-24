export declare const NewUploadService: () => {
    uploadimage: (bucket: string, key?: string) => Promise<string>;
    getPresignedURL: (bucket: string, existingKey?: string) => Promise<string[]>;
};
