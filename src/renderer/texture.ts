import { Renderer } from './renderer';

export const Target = {
  TEXTURE_2D: 0x0de1, // 3553
  TEXTURE_2D_ARRAY: 0x8c1a, // 35866
  TEXTURE_CUBE_MAP: 0x8513, // 34067
} as const;

export class Texture {
  private name: string;
  private imageData:
    | HTMLImageElement
    | HTMLImageElement[]
    | Uint8ClampedArray
    | null;
  private glTexture?: WebGLTexture;
  private target: number; // WebGL constant
  private width: number;
  private height: number;
  private uniformName: string;
  private repeat: boolean;
  private paths: string[];
  private framebuffer: WebGLFramebuffer | null = null;

  constructor(
    name: string,
    imageData: HTMLImageElement | HTMLImageElement[] | Uint8ClampedArray | null,
    target: number,
    width: number,
    height: number,
    uniformName: string,
    repeat: boolean,
    paths: string[],
  ) {
    this.name = name;
    this.imageData = imageData;
    this.target = target;
    this.width = width;
    this.height = height;
    this.uniformName = uniformName;
    this.repeat = repeat;
    this.paths = paths;
  }

  public get FrameBuffer() {
    return this.framebuffer;
  }

  public get Name() {
    return this.name;
  }

  public set ImageData(
    image: HTMLImageElement | HTMLImageElement[] | Uint8ClampedArray,
  ) {
    this.imageData = image;
  }

  public get ImageData() {
    if (!this.imageData) throw new Error('Could not get imagedata is null');
    return this.imageData;
  }

  public get Texture() {
    if (!this.glTexture) throw new Error('GL texture is not set');
    return this.glTexture;
  }

  public get Target() {
    return this.target;
  }

  public get UniformName() {
    return this.uniformName;
  }

  public get Paths() {
    return this.paths;
  }

  public set Paths(paths: string[]) {
    this.paths = paths;
  }

  public bindCubemap() {
    const images = this.imageData as HTMLImageElement[];
    const gl = Renderer.getGL;
    this.glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.glTexture);
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
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    return this;
  }

  public bindTexture() {
    const gl = Renderer.getGL;
    this.glTexture = gl.createTexture();
    if (!this.glTexture) {
      throw new Error('Could not create texture');
    }
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    if (this.imageData instanceof HTMLImageElement) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // Level (mipmap nivå)
        gl.RGBA, // Intern format (RGBA eftersom vi lagrar normaler i 3 kanaler + alpha)
        gl.RGBA, // Format
        gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
        this.imageData,
      );
    } else if (this.imageData instanceof HTMLCanvasElement) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // Level (mipmap nivå)
        gl.RGBA, // Intern format (RGBA eftersom vi lagrar normaler i 3 kanaler + alpha)
        gl.RGBA, // Format
        gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
        this.imageData,
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mipmap level
        gl.RGBA, // internal format
        this.width,
        this.height,
        0, // border
        gl.RGBA, // format
        gl.UNSIGNED_BYTE, // Datatyp (Uint8Array)
        this.imageData as Uint8ClampedArray,
      );
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (this.repeat) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    if (this.width === this.height) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return this;
  }

  public bind2DArrayTexture(images: HTMLImageElement[]) {
    const gl = Renderer.getGL;
    const tex0 = images[0];
    this.glTexture = gl.createTexture();
    gl.bindTexture(this.target, this.glTexture);
    const width = tex0.width;
    const height = tex0.height;
    const layers = images.length;

    gl.texImage3D(
      this.target,
      0,
      gl.RGBA,
      width,
      height,
      layers,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );

    console.log(images);

    images.forEach((tex, i) => {
      gl.texSubImage3D(
        this.target,
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
      this.target,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (this.repeat) {
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, gl.REPEAT);
    } else {
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.generateMipmap(this.target);
    gl.bindTexture(this.target, null);
    return this;
  }

  public updateTexture(data: Uint8ClampedArray | HTMLImageElement) {
    const gl = Renderer.getGL;
    gl.bindTexture(this.Target, this.Texture);
    if (data instanceof Uint8ClampedArray) {
      gl.texSubImage2D(
        this.Target,
        0,
        0,
        0,
        this.width,
        this.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data,
      );
    } else {
      gl.texSubImage2D(this.Target, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
  }

  public updateTextureArrayLayer(image: HTMLImageElement, layer: number) {
    const gl = Renderer.getGL;
    gl.bindTexture(this.Target, this.Texture);
    gl.texSubImage3D(
      this.Target,
      0,
      0,
      0,
      layer,
      this.width,
      this.height,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    );
    console.log('Updated texture ' + this.Target);
  }

  createFramebuffer() {
    const gl = Renderer.getGL;
    const texturePosition = this.createTexture(this.width, this.height);
    const textureUV = this.createTexture(this.width, this.height);
    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texturePosition,
      0,
    );

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT1,
      gl.TEXTURE_2D,
      textureUV,
      0,
    );

    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    // Kontrollera att framebuffer är komplett
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer is not complete:', status);
    }

    // Återställ till canvasens framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return this.framebuffer;
  }

  createTexture(width: number, height: number) {
    const gl = Renderer.getGL;

    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      width,
      height,
      0,
      gl.RGBA,
      gl.FLOAT,
      null,
    );
    const ext = gl.getExtension('EXT_color_buffer_float');

    if (!ext) {
      throw new Error('Float framebuffer stöds inte');
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
}
