import { Renderer } from 'src/renderer/renderer';
import { Target, Texture, TextureType } from 'src/renderer/texture';
import { TextureArrayBuilder } from 'src/renderer/texture-array-builder';
import { Manager } from './manager';

export class TextureManager extends Manager {
  private static textures = new Array<Texture>();
  private static textureArrayBuilder = new TextureArrayBuilder();
  public static dirty = false;

  public static async addTextureArray(
    uniformName: string,
    images: HTMLImageElement[],
    shaderID: string,
  ) {
    const texture = new Texture(
      Target.TEXTURE_2D_ARRAY,
      images[0].height,
      images[0].width,
      uniformName,
      shaderID,
    );
    texture.bind2DArray(images);
    this.textures.push(texture);
    this.dirty = true;
    return texture;
  }

  public static addCubeMap(images: HTMLImageElement[], shaderID: string) {
    const texture = new Texture(
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
    path: string,
    unifornName: string,
    shaderID: string,
  ) {
    const image = await this.loadImage(path);
    const texture = new Texture(
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
    width: number,
    height: number,
    uniformName: string,
    shaderID: string,
  ) {
    const texture = new Texture(
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

  static getTexture(uniformName: string) {
    return this.textures.find((e) => e.UniformName === uniformName);
  }

  static getTextures() {
    return this.textures;
  }
}
