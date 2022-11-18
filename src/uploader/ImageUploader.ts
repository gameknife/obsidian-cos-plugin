export default interface ImageUploader {
  upload(image: File, filename: string): Promise<string>;
}
