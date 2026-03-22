import { Renderer } from 'src/renderer/renderer';
import { Manager } from './manager';
import { Texture, TextureType } from 'src/renderer/texture';
import { TextureArrayBuilder } from 'src/renderer/texture-array-builder';

export class TextureManager extends Manager {
  private static textures = new Map<string, Texture>();
  private static textureArrayBuilder = new TextureArrayBuilder();

  public static async build(type: TextureType) {
    const textures = new Array();
    for (const [name, texture] of this.textures.entries()) {
      if (type === texture.type) {
        textures.push(texture);
        console.log(name);
      }
    }
    this.textureArrayBuilder.rebuild(type, textures);
    console.log(textures);
  }

  public static addTexture(name: string, texture: Texture) {
    this.textures.set(name, texture);
  }

  public static async addToTextureArray(
    name: string,
    path: string,
    type: TextureType,
  ) {
    const image = await this.loadImage(path);
    const texture = new Texture(
      name,
      image,
      image.width,
      image.height,
      0,
      type,
    );
    this.textures.set(name, texture);
    return texture;
  }

  public static async addNonImage(name: string, width: number, height: number) {
    const texture = new Texture(name, null, width, height, 0);
    this.textures.set(name, texture);
    return name;
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

  static getTextureArray(type: TextureType) {
    const texture = this.textureArrayBuilder.TextureArray.get(type);
    if (!texture) throw new Error('Could not get texture of type' + type);
    const slot = this.textureArrayBuilder.getTextureArraySlot(type);
    return { texture, slot };
  }

  static getTexture(name: string) {
    const texture = this.textures.get(name);
    if (!texture) throw new Error('Could not get texture of name' + name);
    const slot = Array.from(this.textures.keys()).indexOf(name);
    const newTexture = texture.texture;
    return { newTexture, slot };
  }

  static override bind(name: string) {
    const gl = Renderer.getGL;
    const texture = this.textures.get(name);
    if (!texture) throw new Error('Cannot bind texture ' + name);
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
  }

  static unbind() {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  static getNames() {
    return this.textures.keys();
  }

  static getTextures() {
    return this.textures.entries();
  }

  static restore() {
    this.textures.clear();
  }
}
