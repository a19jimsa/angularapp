import { ShaderManager } from 'src/resource-manager/shader-manager';
import { PerspectiveCamera } from './perspective-camera';
import { VertexArray } from './vertex-array';
import { mat4 } from 'gl-matrix';
import { OrtographicCamera } from './orthographic-camera';
import { Model } from './model';
import { MeshManager } from 'src/resource-manager/mesh-manager';

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

  public static get getGL() {
    if (!this.gl) throw new Error('GL is not set');
    return Renderer.gl;
  }

  public static bindShader(shaderName: string) {
    const shader = ShaderManager.getShader(shaderName);
    this.gl.useProgram(shader);
  }

  public static drawInstancing() {
    // this.gl.bindVertexArray(mesh.vao);
    // const indexCountPerBlade = 6 * 5; // 30 om du har 5 quads
    // const instanceCount = grass.positions.length / 4; // en xyz per strå + instance id
    // gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, grass.positions);
    // gl.drawElementsInstanced(
    //   gl.TRIANGLES,
    //   indexCountPerBlade, // hur många index beskriver ETT strå
    //   gl.UNSIGNED_SHORT, // typ i index‑buffern
    //   0, // byte‑offset i index‑buffern
    //   instanceCount
    // );
    // gl.bindVertexArray(null);
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

  private static setupSkybox() {
    const model = new Model();
    model.addSkybox();
    MeshManager.addMesh(model, 'skybox', 'skybox');
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
  }

  static drawLines(vertexArray: VertexArray) {
    vertexArray.bind();
    this.gl.drawElements(
      this.gl.LINES,
      vertexArray.indexBuffer.getCount(),
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  static end(camera: PerspectiveCamera | OrtographicCamera) {}

  static drawSkybox(vertexArray: VertexArray) {
    const gl = this.gl;
    gl.depthMask(false);
    gl.depthFunc(gl.LEQUAL);
    const shader = ShaderManager.getShader('skybox');
    shader.bind();
    vertexArray.bind();
    const matrix = mat4.create();
    mat4.copy(matrix, this.camera.getViewMatrix());
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    const perspectiveMatrix = mat4.create();
    mat4.multiply(perspectiveMatrix, this.camera.getProjectionMatrix(), matrix);
    shader.setUniformMat4('u_matrix', perspectiveMatrix);
    shader.setMaterialTexture('u_skybox', 'skybox');
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.bindVertexArray(null);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.colorMask(true, true, true, true);
  }

  // private createBatch(
  //   gl: WebGL2RenderingContext,
  //   mesh: MeshRenderer,
  //   amount: number
  // ) {
  //   mesh.shader.use();
  //   mesh.vao.bind();
  //   const buffer = gl.createBuffer();
  //   mesh.vao.vertexBuffer.buffer = buffer!;
  //   if (!mesh.vao.vertexBuffer.buffer) {
  //     console.error("Couldn't not create buffer!");
  //   }
  //   gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vao.vertexBuffer.buffer);
  //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(amount), gl.DYNAMIC_DRAW);
  //   const location = gl.getAttribLocation(
  //     mesh.shader.program,
  //     'a_instancePositions'
  //   );
  //   gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 4 * 4, 0);
  //   gl.enableVertexAttribArray(location);
  //   gl.vertexAttribDivisor(location, 1); // ← per‑instans
  //   const idLocation = gl.getAttribLocation(
  //     mesh.shader.program,
  //     'a_instanceID'
  //   );
  //   gl.vertexAttribPointer(idLocation, 1, gl.FLOAT, false, 4 * 4, 3 * 4);
  //   gl.enableVertexAttribArray(idLocation);
  //   gl.vertexAttribDivisor(idLocation, 1);
  //   gl.useProgram(null);
  //   mesh.vao.unbind();
  //   return mesh;
  // }
}
