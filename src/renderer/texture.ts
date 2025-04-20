import { Shader } from './shader';

export class Texture {
  private gl: WebGL2RenderingContext;
  private texture: WebGLTexture[] = new Array();
  private images = new Array();
  private slot: number = 0;
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  async loadTexture(path: string): Promise<HTMLImageElement> {
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

  createAndBindTexture(image: HTMLImageElement, slot: number) {
    this.slot = slot;
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + slot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // Level (mipmap nivå)
      gl.RGBA, // Intern format (RGBA eftersom vi lagrar normaler i 3 kanaler + alpha)
      gl.RGBA, // Format
      gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
      image
    );

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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.texture.push(texture!);
    this.images.push(image);
  }

  createNormalMap(data: Uint8Array, image: HTMLImageElement, slot: number) {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + slot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // Level (mipmap nivå)
      gl.RGBA, // Intern format (RGBA eftersom vi lagrar normaler i 3 kanaler + alpha)
      image.width, // Bredd
      image.height, // Höjd
      0, // Border (ska alltid vara 0)
      gl.RGBA, // Format
      gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
      data // Data från Uint8Array
    );

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
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.REPEAT
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.REPEAT
    );
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.texture.push(texture!);
  }

  setUniform(shader: Shader, name: string, slot: number) {
    this.gl.uniform1i(this.gl.getUniformLocation(shader.program!, name), slot);
  }

  getSlot() {
    return this.slot;
  }

  getTexture(slot: number) {
    return this.texture[slot];
  }

  getImage(slot: number) {
    return this.images[slot];
  }

  bind(gl: WebGL2RenderingContext) {
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  unbind(gl: WebGL2RenderingContext) {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
