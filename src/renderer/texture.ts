import { Shader } from './shader';

export class Texture {
  private gl: WebGL2RenderingContext;
  private textureMap = new Map<string, WebGLTexture>();
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

  loadSkybox(images: HTMLImageElement[]): WebGLTexture | null {
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

  createAndBindTexture(
    name: string,
    image: HTMLImageElement | null,
    width: number,
    height: number
  ): number {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + this.textureMap.size);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
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
        gl.UNSIGNED_BYTE, // type
        null
      );
    }

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    if (!texture) {
      new Error('Could not create texture');
      return -1;
    }
    //Much better!
    const slot = this.textureMap.size;
    this.textureMap.set(name, texture);
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return slot;
  }

  createNormalMap(
    name: string,
    data: Uint8Array,
    image: HTMLImageElement,
    slot: number
  ) {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + slot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureMap.get(name)!);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      image.width,
      image.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data
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
    //Push texture for later use... maybe use a map?=??? better than random position and rely on slot?=???
    //Much better!
    this.textureMap.set(name, texture!);
  }

  setUniform(shader: Shader, name: string, slot: number) {
    shader.use();
    this.gl.uniform1i(this.gl.getUniformLocation(shader.program!, name), slot);
  }

  getTexture(name: string) {
    if (!this.textureMap.get(name)) {
      new Error('Could not get texture!');
    }
    return this.textureMap.get(name)!;
  }

  getSlot(name: string): number {
    let index = 0;
    for (let key of this.textureMap.keys()) {
      if (key === name) return index;
      index++;
    }
    return -1;
  }

  bind(name: string) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.textureMap.get(name)!);
  }

  unbind() {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
