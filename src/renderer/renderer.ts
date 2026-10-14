import { PerspectiveCamera } from './perspective-camera';
import { VertexArray } from './vertex-array';
import { OrtographicCamera } from './orthographic-camera';
import { BlendMode, Material } from './material';
import { Texture } from './texture';
import { ShaderManager } from 'src/resource-manager/shader-manager';
import { mat4 } from 'gl-matrix';
import { Transform3D } from 'src/components/transform3D';
import { Mouse } from 'src/app/map-editor/map-editor.component';

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
    mesh: VertexArray,
    material: Material,
    instanceData: Float32Array,
    count: number,
  ) {
    const gl = Renderer.getGL;
    mesh.bind();
    const instanceBuffer = mesh.instanceBuffer;
    if (!instanceBuffer)
      throw new Error('Could not get instance buffer ' + instanceBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      instanceData.subarray(0, count * mesh.bufferLayout.amount),
    );
    //Must be true on 3d mesh otherwise, back vertex draws over closer.
    gl.depthMask(material.depthWrite);
    switch (material.blendMode) {
      case BlendMode.Opaque:
        gl.disable(gl.BLEND);
        break;
      case BlendMode.AlphaBlend:
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        break;
      case BlendMode.Additive:
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        break;
    }
    gl.cullFace(gl.FRONT);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      mesh.indexBuffer.getCount(),
      gl.UNSIGNED_SHORT,
      0,
      count,
    );
    gl.cullFace(gl.BACK);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      mesh.indexBuffer.getCount(),
      gl.UNSIGNED_SHORT,
      0,
      count,
    );
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    mesh.unbind();
  }

  private static setupGL() {
    const gl = Renderer.gl;
    Renderer.canvas.width = 1920;
    Renderer.canvas.height = 1080;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS); // eller LEQUAL
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  static begin() {
    this.gl.clearColor(0, 0, 0, 1);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  static drawIndexed(vertexArray: VertexArray) {
    vertexArray.bind();
    const count = vertexArray.indexBuffer.getCount();
    this.gl.drawElements(this.gl.TRIANGLES, count, this.gl.UNSIGNED_SHORT, 0);
    vertexArray.unbind();
  }

  static drawStrip(vertexArray: VertexArray) {
    vertexArray.bind();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexArray.vertexBuffer.buffer);
    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      0,
      vertexArray.vertexBuffer.vertices,
    );
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.drawArrays(
      this.gl.TRIANGLE_STRIP,
      0,
      vertexArray.vertexBuffer.vertices.length / 3,
    );
    this.gl.enable(this.gl.CULL_FACE);
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
    vertexArray.unbind();
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
    gl.depthFunc(gl.LEQUAL);
    gl.colorMask(true, true, true, true);
  }

  public static updateMesh(vao: VertexArray) {
    const gl = Renderer.getGL;
    if (!vao.VAO) throw new Error('Could not get VAO');
    vao.bind();
    const buffer = vao.vertexBuffer.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vao.vertexBuffer.vertices);
    vao.unbind();
  }

  public static drawToFrameBuffer(
    mouseX: number,
    mouseY: number,
    mesh: VertexArray,
    texture: Texture,
    transform: Transform3D,
  ) {
    const gl = Renderer.getGL;
    const frameBuffer = texture.FrameBuffer;
    if (!frameBuffer) throw new Error('Framebuffer is null');

    // Bind picking-framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    gl.viewport(0, 0, 1920, 1080);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Använd picking-shadern
    const shader = ShaderManager.getShader('framebuffer');
    shader.bind();

    // Skicka samma kamera- och modellmatriser
    // som din vanliga rendering använder.
    shader.setUniformMat4('u_matrix', this.camera.getViewProjectionMatrix());
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, transform.position);
    mat4.rotateX(modelMatrix, modelMatrix, transform.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, transform.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, transform.rotation[2]);
    mat4.scale(modelMatrix, modelMatrix, transform.scale);
    shader.setUniformMat4('u_model', modelMatrix);

    // Rita din befintliga mesh
    Renderer.drawIndexed(mesh);

    // Läs pixeln under musen
    const pixel = new Uint8Array(4);

    gl.readPixels(mouseX, mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    // Avkoda pixelns färg till UV
    const u = pixel[0] / 255;
    const v = pixel[1] / 255;

    console.log(u, v);

    // Återställ framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    shader.unbind();

    return { u, v };
  }
}
