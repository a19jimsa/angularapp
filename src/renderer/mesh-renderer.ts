import { mat4, vec2, vec3 } from 'gl-matrix';

export type Vertex = {
  position: vec3;
  uv: vec2;
  normal: vec3;
};

export class MeshRenderer {
  constructor(vertices: Float32Array, indices: Uint16Array, shader: string) {
    //Clean up this code to store all vao in the engine and to get them!!! Now it is hardcoded!
    //Setupmesh or layout
  }
}
