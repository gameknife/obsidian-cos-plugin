import ImgurClient from "../../imgur/ImgurClient";
import ImageUploader from "../ImageUploader";

export default class ImgurAuthenticatedUploader implements ImageUploader {
  constructor(readonly client: ImgurClient) {}

  async upload(image: File, filename: string): Promise<string> {
    return (await this.client.upload(image)).data.link;
  }
}
