import { Target, Texture } from 'src/renderer/texture';
import { Manager } from './manager';
export class TextureManager extends Manager {
  private static textures = new Map<string, Texture>();
  public static dirty = false;

  public static async addTextureArray(
    name: string,
    uniformName: string,
    images: HTMLImageElement[],
    repeat: boolean,
  ) {
    const texture = new Texture(
      images,
      Target.TEXTURE_2D_ARRAY,
      images[0].height,
      images[0].width,
      uniformName,
      repeat,
    );
    texture.bind2DArrayTexture();
    this.textures.set(name, texture);
    this.dirty = true;
    return texture;
  }

  public static addCubeMap(
    name: string,
    uniformName: string,
    images: HTMLImageElement[],
  ) {
    const texture = new Texture(
      images,
      Target.TEXTURE_CUBE_MAP,
      images[0].width,
      images[0].height,
      uniformName,
      false,
    );
    texture.bindCubemap();
    this.textures.set(name, texture);
    this.dirty = true;
    return texture;
  }

  public static async addTexture(
    name: string,
    width: number,
    height: number,
    uniformName: string,
    image: HTMLImageElement | Uint8ClampedArray,
    repeat: boolean,
  ) {
    const texture = new Texture(
      image,
      Target.TEXTURE_2D,
      width,
      height,
      uniformName,
      repeat,
    );
    texture.bindTexture();
    this.textures.set(name, texture);
    this.dirty = true;
    return texture;
  }

  public static async loadImage(path: string): Promise<HTMLImageElement> {
    // Load texture
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
    return this.textures.get(name);
  }
}
