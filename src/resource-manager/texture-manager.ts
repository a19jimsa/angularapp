import { Manager } from './manager';

export class TextureManager extends Manager {
  private static textureMap = new Map<string, WebGLTexture>();
  private static images = new Map<number, HTMLImageElement>();
  public static setGl(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  static async loadTexture(path: string): Promise<HTMLImageElement> {
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

  static loadSkybox(images: HTMLImageElement[]): WebGLTexture | null {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    for (let i = 0; i < images.length; i++) {
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0,
        gl.RGB,
        images[i].width,
        images[i].height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        images[i]
      );
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    return texture;
  }

  static createAndBindTexture(
    name: string,
    image: HTMLImageElement | null,
    width: number,
    height: number
  ): number {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Could not create texture');
    }
    const slot = this.textureMap.size;
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (image instanceof HTMLImageElement) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // Level (mipmap nivå)
        gl.RGBA, // Intern format (RGBA eftersom vi lagrar normaler i 3 kanaler + alpha)
        gl.RGBA, // Format
        gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
        image
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mipmap level
        gl.RGBA, // internal format
        width,
        height,
        0, // border
        gl.RGBA, // format
        gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
        null
      );
    }

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    this.textureMap.set(name, texture);
    if (image) {
      this.images.set(slot, image);
    }
    return slot;
  }

  static getTexture(name: string) {
    if (!this.textureMap.get(name)) {
      new Error('Could not get texture!');
    }
    return this.textureMap.get(name)!;
  }

  static getSlot(name: string): number {
    let index = 0;
    for (let key of this.textureMap.keys()) {
      if (key === name) return index;
      index++;
    }
    return -1;
  }

  static override bind(name: string) {
    const gl = this.gl;
    const texture = this.textureMap.get(name);
    if (!texture) throw new Error('Cannon bind texture ' + name);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  static unbind() {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  static getImage(index: number) {
    const image = this.images.get(index);
    if (!image) throw new Error('Cannot find texture with index ' + index);
    return image;
  }

  static getImages() {
    return this.images;
  }

  static getNames() {
    return this.textureMap.keys();
  }

  static getTextures() {
    return this.textureMap.entries();
  }
}
