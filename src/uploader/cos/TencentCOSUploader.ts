import { IMGUR_API_BASE } from "src/imgur/constants";
import COS from "cos-nodejs-sdk-v5";
import { setTimeout } from "timers/promises";
import { ImgurPostData } from "../../imgur/imgurResponseTypes";
import ImageUploader from "../ImageUploader";
import { handleImgurErrorResponse } from "../../imgur/ImgurClient";

export default class TencentCOSUploader implements ImageUploader {
  private readonly SecretId!: string;

  private readonly SecretKey!: string;

  private readonly BucketId!: string;

  private readonly Region!: string;

  constructor(
    secretId: string,
    secretKey: string,
    bucketId: string,
    region: string
  ) {
    this.SecretId = secretId;
    this.SecretKey = secretKey;
    this.BucketId = bucketId;
    this.Region = region;
  }

  async upload(image: File, filename: string): Promise<string> {
    console.info(`cos uploading [${image.name}] ...`);

    const buffer = await image.arrayBuffer();
    const rawBuffer = Buffer.from(buffer);

    let resultUrl = null;

    const cos: COS = new COS({
      SecretId: this.SecretId,
      SecretKey: this.SecretKey,
    });

    cos.putObject(
      {
        Bucket: this.BucketId /* 必须 */,
        Region: this.Region /* 存储桶所在地域，必须字段 */,
        Key: filename /* 必须 */,
        StorageClass: "STANDARD",
        Body: rawBuffer, // 上传文件对象
      },
      (err: any, data: COS.PutObjectResult) => {
        if (data && data.statusCode === 200) {
          resultUrl = `https://${data.Location}?imageMogr2/format/webp`;
        }
      }
    );

    if (!resultUrl) {
      await setTimeout(100);
    }

    if (!resultUrl) {
      await setTimeout(1000);
    }

    if (!resultUrl) {
      await setTimeout(5000);
    }

    return resultUrl;
  }
}