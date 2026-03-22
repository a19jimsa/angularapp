import { ShaderManager } from 'src/resource-manager/shader-manager';
import { PerspectiveCamera } from './perspective-camera';
import { VertexArray } from './vertex-array';
import { mat4 } from 'gl-matrix';
import { OrtographicCamera } from './orthographic-camera';
import { Model } from './model';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';
import { BufferLayout } from './buffer';
import { ShaderDataType, ShaderType } from './shader-data-type';
import { Texture } from './texture';

export class Renderer {
  private static gl: WebGL2RenderingContext;
  private static canvas: HTMLCanvasElement;
  private static camera: PerspectiveCamera;
  private static skyboxTextures: Texture[] = new Array();

  static create(canvas: HTMLCanvasElement, camera: PerspectiveCamera) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('Webgl2 Not supported');
    Renderer.gl = gl;
    Renderer.canvas = canvas;
    this.camera = camera;
    Renderer.setupGL();
  }

  public static getHeight() {
    return this.canvas.height;
  }

  public static getWidth() {
    return this.canvas.width;
  }

  public static getCamera() {
    return this.camera;
  }

  public static get getGL() {
    if (!this.gl) throw new Error('GL is not set');
    return Renderer.gl;
  }

  public static drawInstancing(
    vertexArray: VertexArray,
    positions: number[],
    count: number,
  ) {
    const gl = Renderer.getGL;
    vertexArray.bind();
    if (!vertexArray.instanceBuffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexArray.instanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(positions));
    // --- Draw call ---
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      vertexArray.indexBuffer.getCount(),
      gl.UNSIGNED_SHORT,
      0,
      count, // rita 4 grässtrån
    );
    vertexArray.unbind();
  }

  private static setupGL() {
    const gl = Renderer.gl;
    Renderer.canvas.width = 1920;
    Renderer.canvas.height = 1080;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  public static async setupSkybox(images: HTMLImageElement[]) {
    for (const image of images) {
      const texture = new Texture(
        'skybox',
        image,
        image.width,
        image.height,
        0,
      );
      this.skyboxTextures.push(texture);
    }
    const skyboxTexture = this.createAndBindSkybox(images);

    const bufferLayout = new BufferLayout();
    bufferLayout.add(
      0,
      ShaderDataType.GetType(ShaderType.Float),
      3,
      false,
      false,
    );

    const model = new Model(bufferLayout);
    model.addSkybox();
    const vao = new VertexArray(
      new Float32Array(model.vertices),
      new Uint16Array(model.indices),
    );
    return { skyboxTexture, model };
  }

  private static createAndBindSkybox(images: HTMLImageElement[]) {
    const gl = Renderer.getGL;
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
        images[i],
      );
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    return texture;
  }

  static begin() {
    // Clear the canvas AND the depth buffer.
    this.gl.clearColor(0, 0, 0, 1); // Viktigt! Gör hela canvasen svart
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  static drawIndexed(vertexArray: VertexArray) {
    vertexArray.bind();
    const count = vertexArray.indexBuffer.getCount();
    this.gl.drawElements(this.gl.TRIANGLES, count, this.gl.UNSIGNED_SHORT, 0);
    vertexArray.unbind();
  }

  static drawLines(vertexArray: VertexArray) {
    vertexArray.bind();
    this.gl.drawElements(
      this.gl.LINES,
      vertexArray.indexBuffer.getCount(),
      this.gl.UNSIGNED_SHORT,
      0,
    );
  }

  static end(camera: PerspectiveCamera | OrtographicCamera) {}

  public static drawSkybox(
    vao: VertexArray,
    texture: WebGLTexture,
    slot: number,
  ) {
    const gl = this.gl;
    gl.depthMask(false);
    gl.depthFunc(gl.LEQUAL);
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    vao.bind();
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    vao.unbind();
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.colorMask(true, true, true, true);
  }

  public static updateMesh(meshId: string) {
    const gl = Renderer.getGL;
    const vao = MeshManager.getMesh(meshId);
    if (!vao) throw new Error('Could not get vao');
    vao.bind();
    const buffer = vao.vertexBuffer.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vao.vertexBuffer.vertices);
    vao.unbind();
  }

  public static updateTexture(
    textureName: string,
    width: number,
    height: number,
    coords: Uint8ClampedArray,
  ) {
    const gl = Renderer.getGL;
    const texture = TextureManager.getTexture(textureName);
    if (!texture.newTexture)
      throw new Error('Could not find texture ' + textureName);
    gl.bindTexture(gl.TEXTURE_2D, texture.newTexture);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      width,
      height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      coords,
    );
  }
}
