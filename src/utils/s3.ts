import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Constants } from "./constants";
import {v4 as uuidv4} from 'uuid';

const AWSconfig = {
    region: Constants.BUCKET_REGION,
    credentials:{
        accessKeyId: Constants.BUCKET_ACCESS_KEY_ID,
        secretAccessKey: Constants.SECRET_ACCESS_KEY
    }
}

const s3 = new S3Client(AWSconfig)

const generateS3Url = async (filetype: string): Promise<{presignedUrl: string, filename: string}> =>{
    const filename = uuidv4()
    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `${filename}.${filetype}`,
        ContentType: filetype
    })

    const presignedUrl = await getSignedUrl(s3, command, {expiresIn:3600})
    return {presignedUrl,filename}
    }

export {generateS3Url}


















