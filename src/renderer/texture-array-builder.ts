import { Renderer } from './renderer';

export class TextureArrayBuilder {
  constructor() {}

  public build(images: HTMLImageElement[]) {
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
    return texture;
  }
}
