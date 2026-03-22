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

export class Texture {
  name: string;
  image: HTMLImageElement | null;
  texture: WebGLTexture;
  width: number;
  height: number;
  format: number;
  type?: TextureType;

  constructor(
    name: string,
    image: HTMLImageElement | null,
    width: number,
    height: number,
    format: number,
    type?: TextureType,
  ) {
    this.name = name;
    this.image = image;
    this.width = width;
    this.height = height;
    this.format = format;
    this.type = type;
    this.texture = this.bindTexture(image, width, height);
  }

  private bindTexture(
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
    return texture;
  }
}
