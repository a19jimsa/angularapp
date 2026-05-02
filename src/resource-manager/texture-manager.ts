import { Target, Texture } from 'src/renderer/texture';
import { Manager } from './manager';

export class TextureManager extends Manager {
  private static textures = new Array<Texture>();
  public static dirty = false;

  public static async addTextureArray(
    slot: string,
    uniformName: string,
    images: HTMLImageElement[],
    shaderID: string,
  ) {
    const texture = new Texture(
      slot,
      Target.TEXTURE_2D_ARRAY,
      images[0].height,
      images[0].width,
      uniformName,
      shaderID,
    );
    texture.bind2DArrayTexture(images);
    this.textures.push(texture);
    this.dirty = true;
    return texture;
  }

  public static addCubeMap(
    slot: string,
    images: HTMLImageElement[],
    shaderID: string,
  ) {
    const texture = new Texture(
      slot,
      Target.TEXTURE_CUBE_MAP,
      images[0].width,
      images[0].height,
      'u_skybox',
      shaderID,
    );
    texture.bindCubemap(images);
    this.textures.push(texture);
    this.dirty = true;
    return texture;
  }

  public static async addTexture(
    slot: string,
    unifornName: string,
    image: HTMLImageElement,
    shaderID: string,
  ) {
    const texture = new Texture(
      slot,
      Target.TEXTURE_2D,
      image.width,
      image.height,
      unifornName,
      shaderID,
    );
    texture.bindTexture(image, image.width, image.height);
    this.textures.push(texture);
    this.dirty = true;
    return texture;
  }

  public static async addNonImage(
    slot: string,
    width: number,
    height: number,
    uniformName: string,
    shaderID: string,
  ) {
    const texture = new Texture(
      slot,
      Target.TEXTURE_2D,
      width,
      height,
      uniformName,
      shaderID,
    );
    texture.bindTexture(null, width, height);
    this.textures.push(texture);
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

  static restore() {
    this.textures.length = 0;
  }

  static getTexture(slot: string) {
    return this.textures.find((e) => e.Slot === slot);
  }

  static getTextures() {
    return this.textures;
  }
}
