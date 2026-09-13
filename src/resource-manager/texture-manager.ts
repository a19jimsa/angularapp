import { Target, Texture } from 'src/renderer/texture';
import { Manager } from './manager';
export class TextureManager extends Manager {
  private static textures = new Map<string, Texture>();
  public static dirty = false;

  public static bindTexture(name: string, texture: Texture) {
    texture.bindTexture();
    this.textures.set(name, texture);
  }

  public static async loadImages(paths: string[]) {
    const images: HTMLImageElement[] = new Array();
    for (const path of paths) {
      const image = await this.loadImage(path);
      images.push(image);
    }
    return images;
  }

  public static async addTextureArray(
    name: string,
    uniformName: string,
    images: HTMLImageElement[],
    repeat: boolean,
  ) {
    const paths = images.map((image) => image.src);
    const texture = new Texture(
      images,
      Target.TEXTURE_2D_ARRAY,
      images[0].height,
      images[0].width,
      uniformName,
      repeat,
      paths,
    );
    texture.bind2DArrayTexture(images);
    this.textures.set(name, texture);
    this.dirty = true;
    return texture;
  }

  public static addCubeMap(
    name: string,
    uniformName: string,
    images: HTMLImageElement[],
    paths: string[],
  ) {
    const texture = new Texture(
      images,
      Target.TEXTURE_CUBE_MAP,
      images[0].width,
      images[0].height,
      uniformName,
      false,
      paths,
    );
    texture.bindCubemap();
    this.textures.set(name, texture);
    this.dirty = true;
    return texture;
  }

  public static addTexture(
    name: string,
    width: number,
    height: number,
    uniformName: string,
    image: HTMLImageElement | Uint8ClampedArray,
    repeat: boolean,
  ) {
    const paths = new Array();
    if (image instanceof HTMLImageElement) {
      paths.push(image.src);
    }
    const texture = new Texture(
      image,
      Target.TEXTURE_2D,
      width,
      height,
      uniformName,
      repeat,
      paths,
    );
    texture.bindTexture();
    this.textures.set(name, texture);
    this.dirty = true;
    return texture;
  }

  static async loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = (_) => resolve(image);
      image.onerror = (e) => {
        console.error(e);
        reject(new Error('Failed to load image ' + path));
      };
      image.src = path;
    });
  }

  static getNames() {
    return this.textures.keys();
  }

  static getTextures() {
    return this.textures;
  }

  static getTexture(name: string) {
    const texture = this.textures.get(name);
    if (!texture) throw new Error('Could not get texture!');
    return texture;
  }
}
