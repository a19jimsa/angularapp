import { Renderer } from './renderer';

export enum TextureType {
  Brush = 'brush',
  Terrain = 'terrain',
  Albedo = 'albedo',
  Normal = 'normal',
  UI = 'ui',
  Skybox = 'skybox',
  Splatmap = 'Splatmap',
}

export const Target = {
  TEXTURE_2D: 0x0de1, // 3553
  TEXTURE_2D_ARRAY: 0x8c1a, // 35866
  TEXTURE_CUBE_MAP: 0x8513, // 34067
} as const;

export class Texture {
  private name: string;
  private glTexture?: WebGLTexture;
  private target: number; // WebGL constant
  private width: number;
  private height: number;
  private uniformName: string;
  private shaderID: string;

  constructor(
    name: string,
    target: number,
    width: number,
    height: number,
    uniformName: string,
    shaderID: string,
  ) {
    this.name = name;
    this.target = target;
    this.width = width;
    this.height = height;
    this.uniformName = uniformName;
    this.shaderID = shaderID;
  }

  public get Name() {
    return this.name;
  }

  public get Texture() {
    if (!this.glTexture) throw new Error('GL texture is not set');
    return this.glTexture;
  }

  public get Target() {
    return this.target;
  }

  public get ShaderID() {
    return this.shaderID;
  }

  public get UniformName() {
    return this.uniformName;
  }

  public bindCubemap(images: HTMLImageElement[]) {
    const gl = Renderer.getGL;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    let i = 0;
    for (const image of images) {
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0,
        gl.RGB,
        image.width,
        image.height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        image,
      );
      i++;
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    this.glTexture = texture;
    return texture;
  }

  public bindTexture(
    image: HTMLImageElement | null,
    width: number,
    height: number,
  ) {
    const gl = Renderer.getGL;
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Could not create texture');
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (image instanceof HTMLImageElement) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // Level (mipmap nivå)
        gl.RGBA, // Intern format (RGBA eftersom vi lagrar normaler i 3 kanaler + alpha)
        gl.RGBA, // Format
        gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
        image,
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
        null,
      );
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.glTexture = texture;
    return texture;
  }

  public bind2DArray(images: HTMLImageElement[]) {
    const gl = Renderer.getGL;
    const tex0 = images[0];
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    const width = tex0.width;
    const height = tex0.height;
    const layers = images.length;
    gl.texImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,
      gl.RGBA8,
      width,
      height,
      layers,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );

    images.forEach((tex, i) => {
      gl.texSubImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        0,
        0,
        i,
        width,
        height,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        tex,
      );
    });

    gl.texParameteri(
      gl.TEXTURE_2D_ARRAY,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    this.glTexture = texture;
    console.log(this.glTexture);
    return texture;
  }

  public updateTexture(coords: Uint8ClampedArray) {
    const gl = Renderer.getGL;
    gl.bindTexture(this.Target, this.Texture);
    gl.texSubImage2D(
      this.Target,
      0,
      0,
      0,
      this.width,
      this.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      coords,
    );
  }
}
