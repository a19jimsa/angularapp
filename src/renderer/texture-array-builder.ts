import { Renderer } from './renderer';
import { Texture, TextureType } from './texture';

export class TextureArrayBuilder {
  private textureArrays = new Map<TextureType, WebGLTexture>();

  constructor() {}

  get TextureArray() {
    return this.textureArrays;
  }

  public getTextureArraySlot(type: TextureType) {
    const slot = Array.from(this.textureArrays.keys()).indexOf(type);
    return slot;
  }

  public rebuild(type: TextureType, textures: Texture[]) {
    if (textures.length === 0) return;
    this.createTextureArrays(type, textures);
  }

  private createTextureArrays(type: TextureType, textures: Texture[]) {
    const gl = Renderer.getGL;
    const tex0 = textures[0];

    const textureArray = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureArray);

    const width = tex0.width;
    const height = tex0.height;
    const layers = textures.length;

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

    textures.forEach((tex, i) => {
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
        tex.image!,
      );
    });

    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    this.textureArrays.set(type, textureArray);
  }
}
