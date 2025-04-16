import { vec2, vec3 } from 'gl-matrix';

export type Vertex = {
  position: vec3;
};

export class Mesh {
  vertices = new Array();
  indices = new Array();
  normals = new Array();

  addSquares(
    width: number,
    height: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) {
    const texWidth = width;
    const texHeight = height;

    const u0 = sx / texWidth;
    const v0 = sy / texHeight;

    const u1 = (sx + sw) / texWidth;
    const v1 = (sy + sh) / texHeight;

    const x0 = dx;
    const y0 = dy;
    const x1 = dx + dw;
    const y1 = dy + dh;

    const vertices = [
      x0,
      y0,
      0,
      u0,
      v0,
      x1,
      y0,
      0,
      u1,
      v0,
      x1,
      y1,
      0,
      u1,
      v1,
      x0,
      y1,
      0,
      u0,
      v1,
    ];

    this.vertices.push(...vertices);

    let multiplier = 0;
    if (this.indices.length !== 0) {
      multiplier = this.indices.length / 6;
    } else {
      this.indices.push(0, 1, 2, 0, 2, 3);
      return;
    }
    const i0 = 0 + 4 * multiplier;
    const i1 = 1 + 4 * multiplier;
    const i2 = 2 + 4 * multiplier;
    const i3 = 0 + 4 * multiplier;
    const i4 = 2 + 4 * multiplier;
    const i5 = 3 + 4 * multiplier;
    this.indices.push(i0, i1, i2, i3, i4, i5);
  }

  addCube(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
  ) {
    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;

    const positions = [
      x - w,
      y - h,
      z + d,
      x + w,
      y - h,
      z + d,
      x + w,
      y + h,
      z + d,
      x - w,
      y + h,
      z + d,

      x - w,
      y - h,
      z - d,
      x + w,
      y - h,
      z - d,
      x + w,
      y + h,
      z - d,
      x - w,
      y + h,
      z - d,
    ];
    this.vertices.push(...positions);
    const indices = [
      0,
      1,
      2,
      0,
      2,
      3, // front
      1,
      5,
      6,
      1,
      6,
      2, // back
      5,
      4,
      7,
      5,
      7,
      6, // top
      4,
      0,
      3,
      4,
      3,
      7, // bottom
      3,
      2,
      6,
      3,
      6,
      7, // right
      4,
      5,
      1,
      4,
      1,
      0, // left
    ];
    this.indices.push(...indices);
  }

  addPlane(quads: number, width: number, height: number) {
    for (let z = 0; z < quads; z++) {
      let v = z / quads;
      for (let x = 0; x < quads; x++) {
        let u = x / quads;
        if (z > quads / 8) {
          this.vertices.push(u * width, 0, v * height);
        } else {
          const random = Math.random() * 5 + 1;
          this.vertices.push(u * width, random, v * height);
        }

        this.vertices.push(u, v);
      }
    }
    for (let z = 0; z < quads - 1; z++) {
      for (let x = 0; x < quads - 1; x++) {
        const i = z * quads + x;
        // Två trianglar per kvadrat
        this.indices.push(i, i + 1, i + quads);
        this.indices.push(i + 1, i + quads + 1, i + quads);
      }
    }
  }

  recalculateNormals(quads: number, width: number, height: number) {
    this.normals = new Array(this.indices.length).fill(0);
    const positions = [];
    for (let i = 0; i < this.vertices.length; i += 5) {
      positions.push(
        this.vertices[i],
        this.vertices[i + 1],
        this.vertices[i + 2]
      ); // x, y, z
    }
    console.log(this.vertices);
    for (let i = 0; i < this.indices.length; i += 3) {
      const i0 = this.indices[i];
      const i1 = this.indices[i + 1];
      const i2 = this.indices[i + 2];
      const v0 = vec3.fromValues(
        positions[i0 * 3],
        positions[i0 * 3 + 1],
        positions[i0 * 3 + 2]
      );
      const v1 = vec3.fromValues(
        positions[i1 * 3],
        positions[i1 * 3 + 1],
        positions[i1 * 3 + 2]
      );
      const v2 = vec3.fromValues(
        positions[i2 * 3],
        positions[i2 * 3 + 1],
        positions[i2 * 3 + 2]
      );
      const edge1 = vec3.subtract(vec3.create(), v1, v0);
      const edge2 = vec3.subtract(vec3.create(), v2, v0);
      const faceNormal = vec3.cross(vec3.create(), edge1, edge2);
      vec3.normalize(faceNormal, faceNormal);
      // Accumulate normal to each vertex normal
      for (let j of [i0, i1, i2]) {
        this.normals[j * 3] += faceNormal[0];
        this.normals[j * 3 + 1] += faceNormal[1];
        this.normals[j * 3 + 2] += faceNormal[2];
      }
    }
    for (let i = 0; i < this.normals.length; i += 3) {
      const normal = vec3.fromValues(
        this.normals[i],
        this.normals[i + 1],
        this.normals[i + 2]
      );
      vec3.normalize(normal, normal);
      this.normals[i] = normal[0] * -1;
      this.normals[i + 1] = normal[1] * -1;
      this.normals[i + 2] = normal[2] * -1;
    }
    return this.normals;
  }
}
