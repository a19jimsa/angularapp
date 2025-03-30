export class Texture {
  private gl: WebGL2RenderingContext;
  private texture: WebGLTexture | null;
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.texture = this.gl.createTexture();
  }

  async loadTexture(path: string, slot: number): Promise<HTMLImageElement> {
    // Load texture

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = path;
    });
  }

  getTexture() {
    return this.texture;
  }

  bind(gl: WebGL2RenderingContext) {
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  unbind(gl: WebGL2RenderingContext) {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
