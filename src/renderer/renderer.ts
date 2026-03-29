import { PerspectiveCamera } from './perspective-camera';
import { VertexArray } from './vertex-array';
import { OrtographicCamera } from './orthographic-camera';
import { Texture } from './texture';

export class Renderer {
  private static gl: WebGL2RenderingContext;
  private static canvas: HTMLCanvasElement;
  private static camera: PerspectiveCamera;

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

  public static drawSkybox(vao: VertexArray) {
    const gl = this.gl;
    gl.depthMask(false);
    gl.depthFunc(gl.LEQUAL);
    vao.bind();
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    vao.unbind();
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.colorMask(true, true, true, true);
  }

  public static updateMesh(vao: VertexArray) {
    const gl = Renderer.getGL;
    if (!vao) throw new Error('Could not get vao');
    vao.bind();
    const buffer = vao.vertexBuffer.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vao.vertexBuffer.vertices);
    vao.unbind();
  }
}
