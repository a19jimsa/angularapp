import { Renderer } from 'src/renderer/renderer';
import { Manager } from './manager';
import { Texture, TextureType } from 'src/renderer/texture';
import { TextureArrayBuilder } from 'src/renderer/texture-array-builder';

export class TextureManager extends Manager {
  private static textures = new Map<string, Texture>();
  private static glArray = new TextureArrayBuilder();

  public static async build(type: TextureType) {
    const textures = new Array();
    for (const [name, texture] of this.textures.entries()) {
      if (type === texture.type) {
        textures.push(texture);
        console.log(name);
      }
    }
    this.glArray.rebuild(type, textures);
    console.log(textures);
  }

  public static getTextureArray(type: TextureType) {
    return this.glArray.TextureArray.get(type);
  }

  public static async add(name: string, path: string, type: TextureType) {
    const image = await this.loadImage(path);
    const texture = new Texture(
      name,
      image,
      image.width,
      image.height,
      0,
      type,
    );
    const index = this.textures.size;
    this.textures.set(name, texture);
    return index;
  }

  public static async addNonImage(name: string, width: number, height: number) {
    const texture = new Texture(name, null, width, height, 0);
    this.textures.set(name, texture);
    return name;
  }

  private static async loadImage(path: string): Promise<HTMLImageElement> {
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

  static getTexture(name: string) {
    if (!this.textures.get(name)) {
      new Error('Could not get texture!');
    }
    return this.textures.get(name)!;
  }

  static getSlot(name: string): number {
    let index = 0;
    for (let key of this.textures.keys()) {
      if (key === name) return index;
      index++;
    }
    return -1;
  }

  static override bind(name: string) {
    const gl = Renderer.getGL;
    const texture = this.textures.get(name);
    if (!texture) throw new Error('Cannot bind texture ' + name);
    gl.bindTexture(gl.TEXTURE_2D, texture);
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
