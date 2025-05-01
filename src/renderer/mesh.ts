import { mat4, vec2, vec3 } from 'gl-matrix';
import { VertexArrayBuffer } from './vertex-array-buffer';
import { Shader } from './shader';
import { PerspectiveCamera } from './perspective-camera';
import { OrtographicCamera } from './orthographic-camera';

export type Vertex = {
  position: vec3;
  normal: vec2;
  texture: vec2;
};

export class Mesh {
  gl: WebGL2RenderingContext;
  vao: VertexArrayBuffer;
  texture: WebGLTexture;
  shader: Shader;

  constructor(
    gl: WebGL2RenderingContext,
    vertices: Float32Array,
    indices: Uint16Array,
    texture: WebGLTexture,
    shader: Shader
  ) {
    this.gl = gl;
    this.vao = new VertexArrayBuffer(gl, vertices, indices);
    this.texture = texture;
    this.shader = shader;
    this.setupMesh(shader);
  }

  private setupMesh(shader: Shader) {
    const gl = this.gl;
    shader.use();
    const positionLoc = gl.getAttribLocation(shader.program, 'a_position');
    gl.vertexAttribPointer(
      positionLoc,
      3,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(positionLoc);
    const texLocation = gl.getAttribLocation(shader.program, 'a_texcoord');
    gl.vertexAttribPointer(
      texLocation,
      2,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(texLocation);
    const normalLocation = gl.getAttribLocation(shader.program, 'a_normal');
    gl.vertexAttribPointer(
      normalLocation,
      3,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      5 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(normalLocation);
  }

  updateNormals() {
    const gl = this.gl;
    const normals = new Array();
    //Stride 8 xyzuvnormals(3)
    for (let i = 0; i < this.vao.indexBuffer.indices.length; i += 3) {
      const i0 = this.vao.indexBuffer.indices[i];
      const i1 = this.vao.indexBuffer.indices[i + 1];
      const i2 = this.vao.indexBuffer.indices[i + 2];

      const v0 = this.vao.vertexBuffer.vertices[i0 * 8];
      const v1 = this.vao.vertexBuffer.vertices[i0 * 8 + 1];
      const v2 = this.vao.vertexBuffer.vertices[i0 * 8 + 2];

      const v3 = this.vao.vertexBuffer.vertices[i1 * 8];
      const v4 = this.vao.vertexBuffer.vertices[i1 * 8 + 1];
      const v5 = this.vao.vertexBuffer.vertices[i1 * 8 + 2];

      const v6 = this.vao.vertexBuffer.vertices[i2 * 8];
      const v7 = this.vao.vertexBuffer.vertices[i2 * 8 + 1];
      const v8 = this.vao.vertexBuffer.vertices[i2 * 8 + 2];

      const triangleA = vec3.fromValues(v0, v1, v2);
      const triangleB = vec3.fromValues(v3, v4, v5);
      const triangleC = vec3.fromValues(v6, v7, v8);

      const edge = vec3.create();
      vec3.subtract(edge, triangleB, triangleA);
      const edge1 = vec3.create();
      vec3.subtract(edge1, triangleC, triangleA);

      const normal = vec3.create();
      vec3.cross(normal, edge, edge1);
      vec3.normalize(normal, normal);
      // Skriv normalen till varje vertex i triangeln (flat shading)
      for (const idx of [i0, i1, i2]) {
        this.vao.vertexBuffer.vertices[idx * 8 + 5] = normal[0];
        this.vao.vertexBuffer.vertices[idx * 8 + 6] = normal[1];
        this.vao.vertexBuffer.vertices[idx * 8 + 7] = normal[2];
      }
    }
  }

  translate(x: number, y: number, z: number) {
    const model = mat4.create();
    mat4.translate(model, model, vec3.fromValues(x, y, z));
    this.shader.uploadUniformMat4('u_model', model);
  }

  draw(camera: PerspectiveCamera | OrtographicCamera) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.shader.use();
    const location = this.gl.getUniformLocation(
      this.shader.program,
      'u_matrix'
    );
    this.gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
    this.vao.bind();
    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.vao.indexBuffer.getCount(),
      this.gl.UNSIGNED_SHORT,
      0
    );
    this.vao.unbind();
  }

  drawLine(camera: PerspectiveCamera, direction: vec3) {
    // Kamera-position
    const viewMatrix = camera.getViewMatrix();

    const invertedView = mat4.create();
    mat4.invert(invertedView, viewMatrix);
    const origin = vec3.fromValues(
      -invertedView[12],
      -invertedView[13],
      -invertedView[14]
    );

    // Musposition
    const start = origin;
    const end = vec3.create();
    vec3.scaleAndAdd(end, start, direction, 100);

    // WebGL
    const gl = this.gl;
    this.shader.use();

    // Skapa och binda VBO
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([start[0], start[1], start[2], end[0], end[1], end[2]]),
      gl.STATIC_DRAW
    );

    // Bind VBO till attribut i shadern
    const positionLocation = gl.getAttribLocation(
      this.shader.program,
      'a_position'
    );
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    // Ställ in transformation (projection/view-matris)
    const projectionViewMatrix = camera.getViewProjectionMatrix();
    const projectionViewLocation = gl.getUniformLocation(
      this.shader.program,
      'u_matrix'
    );
    gl.uniformMatrix4fv(projectionViewLocation, false, projectionViewMatrix);

    // Rita linjen
    gl.drawArrays(gl.LINES, 0, 2);
  }

  drawPivot(perspectiveCamera: PerspectiveCamera) {
    this.shader.use();
    const location = this.gl.getUniformLocation(
      this.shader.program,
      'u_matrix'
    );
    this.gl.uniformMatrix4fv(
      location,
      false,
      perspectiveCamera.getViewProjectionMatrix()
    );
    this.vao.bind();
    this.gl.drawElements(
      this.gl.LINES,
      this.vao.indexBuffer.getCount(),
      this.gl.UNSIGNED_SHORT,
      0
    );
    this.vao.unbind();
  }
}
