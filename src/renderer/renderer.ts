import { ShaderManager } from 'src/resource-manager/shader-manager';
import { PerspectiveCamera } from './perspective-camera';
import { VertexArray } from './vertex-array';
import { mat4 } from 'gl-matrix';
import { OrtographicCamera } from './orthographic-camera';
import { Model } from './model';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';

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
    Renderer.setupSkybox();
  }

  public static get getGL() {
    if (!this.gl) throw new Error('GL is not set');
    return Renderer.gl;
  }

  public static bindShader(shaderName: string) {
    const shader = ShaderManager.getShader(shaderName);
    this.gl.useProgram(shader);
  }

  public static drawInstancing(positions: Float32Array) {
    const gl = Renderer.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const model = new Model();
    model.addCube();

    // --- Mesh VBO ---
    const meshVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, meshVBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(model.vertices),
      gl.STATIC_DRAW
    );

    const stride = 8 * 4; // 8 floats per vertex * 4 bytes
    let index = 0;

    // a_position
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(index, 0);
    index++;

    // a_texcoord
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, 2, gl.FLOAT, false, stride, 3 * 4);
    gl.vertexAttribDivisor(index, 0);
    index++;

    // a_normal
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, stride, 5 * 4);
    gl.vertexAttribDivisor(index, 0);
    index++;

    // --- Instans VBO ---
    const instanceVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceVBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.DYNAMIC_DRAW
    );

    // a_offset (instans-attribut)
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.vertexAttribDivisor(index, 1); // 1 = per instans

    // --- Bind shader ---
    const shader = ShaderManager.getShader('grass');
    console.log(shader);
    shader.bind();
    shader.setUniformMat4(
      'u_matrix',
      Renderer.camera.getViewProjectionMatrix()
    );
    // --- Draw call ---
    const instanceCount = positions.length / 3;
    const count = model.vertices.length / 3;
    console.log(count + instanceCount);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, count, instanceCount);
    shader.unbind();
    gl.bindVertexArray(null);
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

  private static async setupSkybox() {
    const top = await TextureManager.loadImage(
      '/assets/textures/skybox/top.bmp'
    );
    const right = await TextureManager.loadImage(
      '/assets/textures/skybox/right.bmp'
    );
    const left = await TextureManager.loadImage(
      '/assets/textures/skybox/left.bmp'
    );
    const bottom = await TextureManager.loadImage(
      '/assets/textures/skybox/bottom.bmp'
    );
    const front = await TextureManager.loadImage(
      '/assets/textures/skybox/front.bmp'
    );
    const back = await TextureManager.loadImage(
      '/assets/textures/skybox/back.bmp'
    );
    const slot = TextureManager.createAndBindSkybox([
      top,
      right,
      left,
      bottom,
      front,
      back,
    ]);
    const model = new Model();
    model.addSkybox();
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
    if (!shader) return;
    shader.bind();
    const matrix = mat4.create();
    mat4.copy(matrix, this.camera.getViewMatrix());
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    const perspectiveMatrix = mat4.create();
    mat4.multiply(perspectiveMatrix, this.camera.getProjectionMatrix(), matrix);
    shader.setUniformMat4('u_matrix', perspectiveMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, TextureManager.getTexture('skybox'));
    vertexArray.bind();
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
