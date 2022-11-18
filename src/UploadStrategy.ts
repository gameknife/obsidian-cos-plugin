export default class UploadStrategy {
  private static readonly valuesArr: UploadStrategy[] = [];

  static get values(): ReadonlyArray<UploadStrategy> {
    return this.valuesArr;
  }

  static readonly TENCENT_COS = new UploadStrategy(
    "Private COS",
    "Private COS Bucket upload"
  );

  private constructor(readonly id: string, readonly description: string) {
    UploadStrategy.valuesArr.push(this);
  }
}
