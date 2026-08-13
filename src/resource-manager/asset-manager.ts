import { Manager } from './manager';

export class AssetManager extends Manager {
  private static images: Map<string, HTMLImageElement> = new Map();

  static async loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = (_) => resolve(image);
      image.onerror = (e) => {
        console.error(e);
        reject(new Error('Failed to load image ' + path));
      };
      image.src = path;
      const filename = image.src.split('/').pop();
      if (!filename) throw Error('Could not get filename');
      this.images.set(filename, image);
    });
  }

  public static getAssets() {
    return this.images;
  }
}
