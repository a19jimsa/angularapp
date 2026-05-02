export type Asset = {
  type: string;
  path: string;
};

export class AssetManager {
  private static assets: Asset[] = new Array();

  public static addAsset(asset: Asset) {
    this.assets.push(asset);
  }

  public static getAssets() {
    return this.assets;
  }
}
