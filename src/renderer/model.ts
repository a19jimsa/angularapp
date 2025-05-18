import { vec3 } from 'gl-matrix';
import { Vec } from 'src/app/vec';

export class Model {
  vertices: number[] = new Array();
  indices: number[] = new Array();
  normals: number[] = new Array();
  constructor() {}

  addSkybox() {
    const skyboxVertices = [
      // positions
      -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
      1.0, -1.0, -1.0, 1.0, -1.0,

      -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0,
      1.0, 1.0, -1.0, -1.0, 1.0,

      1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      -1.0, 1.0, -1.0, -1.0,

      -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
      1.0, -1.0, -1.0, 1.0,

      -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
      1.0, -1.0, 1.0, -1.0,

      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0,
      -1.0, 1.0, 1.0, -1.0, 1.0,
    ];
    this.vertices = [-1, -1, 0, 1, -1, 0, 0, 1, 0];
    this.vertices = skyboxVertices;
  }

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
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
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

  addGrass() {
    const width = 2; // 1 quad i bredd
    const height = 5; // 5 quads i höjd
    const sizeX = 2; // bredd på hela strået
    const sizeY = 5; // höjd på hela strået

    for (let y = 0; y <= height; y++) {
      const v = y / height;
      const posY = v * sizeY;
      for (let x = 0; x <= width; x++) {
        const u = x / width;
        const posX = u * sizeX;

        this.vertices.push(posX, posY, 0); // position
        this.vertices.push(u, v); // UV
        this.vertices.push(0, 0, 1); // normal uppåt
      }
    }

    for (let y = 0; y < height; y++) {
      const i = y * (width + 1); // varje rad har (width + 1) punkter

      const topLeft = i;
      const bottomLeft = i + (width + 1);
      const topRight = i + 1;
      const bottomRight = i + (width + 1) + 1;

      // två trianglar per quad
      this.indices.push(topRight, bottomRight, topLeft);
      this.indices.push(bottomRight, bottomLeft, topLeft);
    }
  }

  addTree() {
    const position = [
      10, 10, 0, 0, 0, 0, 0, 0, 20, 10, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0,
      0, 10, 0, 0, 0, 0, 0, 0, 0,
    ];
    const indices = [0, 3, 1, 1, 3, 2];
    this.vertices = position;
    this.indices = indices;
  }

  addPlane(
    quads: number,
    xPos: number,
    yPos: number,
    width: number,
    height: number
  ) {
    this.vertices = [];
    this.indices = [];

    // Vertices
    for (let z = 0; z <= quads; z++) {
      const v = z / quads;
      const posZ = v * height;
      for (let x = 0; x <= quads; x++) {
        const u = x / quads;
        const posX = u * width;

        // Position (x, y, z) + UV (u, v) + Normals (x, y, z)
        this.vertices.push(posX + xPos, yPos, posZ); // y = 0 (flat plane)
        this.vertices.push(u, v); // UV
        this.vertices.push(0, 1, 0); // Normals
      }
    }

    // Indices (anti clockwise winding order)
    for (let z = 0; z < quads; z++) {
      for (let x = 0; x < quads; x++) {
        const i = z * (quads + 1) + x;
        this.indices.push(i, i + quads + 1, i + 1);
        this.indices.push(i + 1, i + quads + 1, i + quads + 2);
      }
    }
  }
}
