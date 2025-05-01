import { vec3 } from 'gl-matrix';
import { Vec } from 'src/app/vec';

export class Model {
  vertices: number[] = new Array();
  indices: number[] = new Array();
  normals: number[] = new Array();
  constructor() {}

  addSquares(
    width: number,
    height: number,
    rotation: number,
    pivot: Vec,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
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

    //Rotate from correct pivot position
    const pivotX = dx + pivot.x + dh / 2;
    const pivotY = dy + pivot.y;

    const vertices = [
      // top-left
      (x0 - pivotX) * cos - (y0 - pivotY) * sin + pivotX,
      (x0 - pivotX) * sin + (y0 - pivotY) * cos + pivotY,
      0,
      u0,
      v0,
      0,
      0,
      0,

      // top-right
      (x1 - pivotX) * cos - (y0 - pivotY) * sin + pivotX,
      (x1 - pivotX) * sin + (y0 - pivotY) * cos + pivotY,
      0,
      u1,
      v0,
      0,
      0,
      0,

      // bottom-right
      (x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX,
      (x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY,
      0,
      u1,
      v1,
      0,
      0,
      0,

      // bottom-left
      (x0 - pivotX) * cos - (y1 - pivotY) * sin + pivotX,
      (x0 - pivotX) * sin + (y1 - pivotY) * cos + pivotY,
      0,
      u0,
      v1,
      0,
      0,
      0,
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
    const positions: number[] = [
      // Front face
      -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
      0.0, -1.0, 1.0, 1.0, 0.0, 0.0,
      // Back face
      -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0, -1.0,
      0.0, 0.0, 1.0, -1.0, -1.0, 0.0, 0.0,

      // Top face
      -1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
      0.0, 1.0, 1.0, -1.0, 0.0, 0.0,

      // Bottom face
      -1.0, -1.0, -1.0, 0.0, 0.0, 1.0, -1.0, -1.0, 0.0, 0.0, 1.0, -1.0, 1.0,
      0.0, 0.0, -1.0, -1.0, 1.0, 0.0, 0.0,

      // Right face
      1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
      0.0, 1.0, -1.0, 1.0, 0.0, 0.0,

      // Left face
      -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 1.0, 1.0,
      0.0, 0.0, -1.0, 1.0, -1.0, 0.0, 0.0,
    ] as number[];

    // prettier-ignore
    const indices = [
      0,  2,  1,      0,  3,  2,    // front
      4,  6,  5,      4,  7,  6,    // back
      8,  10,  9,     8,  11, 10,   // top
      12, 14, 13,     12, 15, 14,   // bottom
      16, 18, 17,     16, 19, 18,   // right
      20, 22, 21,     20, 23, 22,   // left
    ];
    this.vertices = positions;
    this.indices = indices;
  }

  addPivot() {
    const positions = [
      0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0,
    ];
    const indices = [0, 1, 2, 3, 4, 5];
    this.vertices.push(...positions);
    this.indices.push(...indices);
  }

  addPlane(quads: number, width: number, height: number) {
    this.vertices = [];
    this.indices = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Vertices
    for (let z = 0; z <= quads; z++) {
      const v = z / quads;
      const posZ = v * height - halfHeight;

      for (let x = 0; x <= quads; x++) {
        const u = x / quads;
        const posX = u * width - halfWidth;

        // Position (x, y, z) + UV (u, v) + Normals (x, y, z)
        this.vertices.push(posX, 0, posZ); // y = 0 (flat plane)
        this.vertices.push(u, v); // UV
        this.vertices.push(0, 0, 0); // Normals
      }
    }

    // Indices (anti clockwise winding order)
    for (let z = 0; z < quads; z++) {
      for (let x = 0; x < quads; x++) {
        const i = z * (quads + 1) + x;
        this.indices.push(i, i + 1, i + quads + 1);
        this.indices.push(i + 1, i + quads + 2, i + quads + 1);
      }
    }
    // // Indices (clockwise winding order)
    // for (let z = 0; z < quads; z++) {
    //   for (let x = 0; x < quads; x++) {
    //     const i = z * (quads + 1) + x;
    //     this.indices.push(i, i + quads + 1, i + 1);
    //     this.indices.push(i + 1, i + quads + 1, i + quads + 2);
    //   }
    // }
  }
}
