export interface IS3Repository{
    uploadFile(bucket: string, key:string,file: Buffer): Promise<string>;
}