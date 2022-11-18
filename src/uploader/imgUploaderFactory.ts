import { ImgurPluginSettings } from "src/ImgurPlugin";
import UploadStrategy from "src/UploadStrategy";
import TencentCOSUploader from "./cos/TencentCOSUploader";
import ImageUploader from "./ImageUploader";

function defaultAnonymousUploader(): ImageUploader {
  return new TencentCOSUploader(null, null, null, null);
}

export default function buildUploaderFrom(
  settings: ImgurPluginSettings
): ImageUploader | undefined {
  if (settings.uploadStrategy === UploadStrategy.TENCENT_COS.id) {
    console.info("start uploader...");
    if (
      settings.SecretId &&
      settings.SecretKey &&
      settings.Bucket &&
      settings.Region
    ) {
      console.info("started uploader.");
      return new TencentCOSUploader(
        settings.SecretId,
        settings.SecretKey,
        settings.Bucket,
        settings.Region
      );
    }
    return defaultAnonymousUploader();
  }
  throw Error("This line of code should never be reached");
}
