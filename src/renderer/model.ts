import { Vec } from 'src/app/vec';
import { BufferLayout } from './buffer';

export class Model {
  vertices: number[] = new Array();
  indices: number[] = new Array();
  bufferLayout: BufferLayout;

  constructor(vbl: BufferLayout) {
    this.bufferLayout = vbl;
  }

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
    dh: number,
    order: number,
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
    const pivotX = dx + pivot.x + sw / 2;
    const pivotY = dy + pivot.y;

    const divider = 10;

    const vertices = [
      // top-left
      ((x0 - pivotX) * cos - (y0 - pivotY) * sin + pivotX) / divider,
      ((x0 - pivotX) * sin + (y0 - pivotY) * cos + pivotY) / divider,
      order,
      u0,
      v0,
      0,
      0,
      0,

      // top-right
      ((x1 - pivotX) * cos - (y0 - pivotY) * sin + pivotX) / divider,
      ((x1 - pivotX) * sin + (y0 - pivotY) * cos + pivotY) / divider,
      order,
      u1,
      v0,
      0,
      0,
      0,

      // bottom-right
      ((x1 - pivotX) * cos - (y1 - pivotY) * sin + pivotX) / divider,
      ((x1 - pivotX) * sin + (y1 - pivotY) * cos + pivotY) / divider,
      order,
      u1,
      v1,
      0,
      0,
      0,

      // bottom-left
      ((x0 - pivotX) * cos - (y1 - pivotY) * sin + pivotX) / divider,
      ((x0 - pivotX) * sin + (y1 - pivotY) * cos + pivotY) / divider,
      order,
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

  addSphere(heightSegments: number, widthSegments: number, radius: number) {
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;
      const theta = v * Math.PI;

      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const phi = u * Math.PI * 2;

        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const px = radius * sinTheta * cosPhi;
        const py = radius * cosTheta;
        const pz = radius * sinTheta * sinPhi;

        vertices.push(px, py, pz);
        vertices.push(u, v);
      }
    }

    // indices
    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        const a = y * (widthSegments + 1) + x;
        const b = a + widthSegments + 1;

        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    this.vertices = vertices;
    this.indices = indices;
  }

  addFlatCircle(segments: number, radius: number) {
    const vertices: number[] = [];
    const indices: number[] = [];

    // center vertex
    vertices.push(0, 0, 0);
    vertices.push(0.5, 0.5);

    // outer ring
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;

      const x = Math.cos(t) * radius;
      const z = Math.sin(t) * radius;

      vertices.push(x, 0, z);

      // uv
      const dx = x;
      const dz = z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const uv = dist / radius;

      vertices.push(uv, uv);
    }

    // triangle fan
    for (let i = 1; i <= segments; i++) {
      indices.push(i + 1);
      indices.push(i);
      indices.push(0);
    }

    this.vertices = vertices;
    this.indices = indices;
  }

  addCube(width: number, height: number, depth: number) {
    const hw = width / 2;
    const hh = height / 2;
    const hd = depth / 2;

    this.vertices = [
      // Front
      -hw,
      -hh,
      hd,
      hw,
      -hh,
      hd,
      hw,
      hh,
      hd,
      -hw,
      hh,
      hd,

      // Back
      -hw,
      -hh,
      -hd,
      -hw,
      hh,
      -hd,
      hw,
      hh,
      -hd,
      hw,
      -hh,
      -hd,

      // Top
      -hw,
      hh,
      -hd,
      -hw,
      hh,
      hd,
      hw,
      hh,
      hd,
      hw,
      hh,
      -hd,

      // Bottom
      -hw,
      -hh,
      -hd,
      hw,
      -hh,
      -hd,
      hw,
      -hh,
      hd,
      -hw,
      -hh,
      hd,

      // Right
      hw,
      -hh,
      -hd,
      hw,
      hh,
      -hd,
      hw,
      hh,
      hd,
      hw,
      -hh,
      hd,

      // Left
      -hw,
      -hh,
      -hd,
      -hw,
      -hh,
      hd,
      -hw,
      hh,
      hd,
      -hw,
      hh,
      -hd,
    ];

    // 2 triangles per face
    this.indices = [
      0,
      1,
      2,
      0,
      2,
      3, // Front
      4,
      5,
      6,
      4,
      6,
      7, // Back
      8,
      9,
      10,
      8,
      10,
      11, // Top
      12,
      13,
      14,
      12,
      14,
      15, // Bottom
      16,
      17,
      18,
      16,
      18,
      19, // Right
      20,
      21,
      22,
      20,
      22,
      23, // Left
    ];
  }

  addPivot() {
    const vertices = [
      // X-axis, color 1
      0, 0, 0, 1, 0, 0, 30, 0, 0, 1, 0, 0,
      // Y-axis, color 2
      0, 0, 0, 0, 1, 0, 0, 30, 0, 0, 1, 0,
      // Z-axis, color 3
      0, 0, 0, 0, 0, 1, 0, 0, 30, 0, 0, 1,
    ];

    //indiices
    const indices = [0, 1, 2, 3, 4, 5];
    this.vertices = vertices;
    this.indices = indices;
  }

  addGrass() {
    const width = 1; // 1 quad i bredd
    const height = 5; // 5 quads i höjd
    const sizeX = 1; // bredd på hela strået
    const sizeY = 3; // höjd på hela strået
    let index = 0;
    for (let y = 0; y <= height; y++) {
      const v = y / height;
      const posY = v * sizeY;
      const rowWidth = sizeX * (1.0 - v); // 100% till 0%
      for (let x = 0; x <= width; x++) {
        const u = x / width;
        const posX = (u - 0.5) * rowWidth;
        this.vertices.push(posX, posY, 0); // position
        this.vertices.push(u, v); // UV
        this.vertices.push(0, 0, 1); // normal framåt
        index++;
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

  addPlane(quads: number, x: number, z: number) {
    const width = z;
    const length = x;
    this.vertices = [];
    this.indices = [];

    // Vertices
    for (let z = 0; z <= quads; z++) {
      const v = z / quads;
      const posZ = v * length;
      for (let x = 0; x <= quads; x++) {
        const u = x / quads;
        const posX = u * width;

        // Position (x, y, z) + UV (u, v) + Normals (x, y, z)
        this.vertices.push(posX, 1, posZ); // y = 0 (flat plane)
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

  addCylinder() {
    this.vertices = [];
    this.indices = [];

    const height = 10;
    const segments = 30;
    const radius = 10;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const u = i / segments;
      //Top
      this.vertices.push(x, height, z);
      this.vertices.push(u, 1);
      //Bottom
      this.vertices.push(x, -height, z);
      this.vertices.push(u, 0);
    }

    for (let i = 0; i < segments; i++) {
      const top0 = i * 2 + 1;
      const bottom0 = i * 2;
      const top1 = (i + 1) * 2 + 1;
      const bottom1 = (i + 1) * 2;

      // Triangel 1
      this.indices.push(top0, bottom0, top1);
      // Triangel 2
      this.indices.push(top1, bottom0, bottom1);
    }
  }

  addLightning(width: number, height: number, segments: number) {
    const indices: number[] = [];

    // x, y, z, u, v

    const vertices = [
      // 0
      -5, 0, 0, 0, 0.0,

      // 1
      5, 0, 0, 1, 0.0,

      // 2
      -10, 18, 0, 0, 0.2,

      // 3
      10, 18, 0, 1, 0.2,

      // 4
      -10, 35, 0, 0, 0.4,

      // 5
      0, 35, 0, 1, 0.4,

      // 6
      -5, 52, 0, 0, 0.6,

      // 7
      5, 52, 0, 1, 0.6,

      // 8
      -20, 72, 0, 0, 0.8,

      // 9
      0, 72, 0, 1, 0.8,

      // 10
      -8, 92, 0, 0, 1.0,

      // 11
      8, 92, 0, 1, 1.0,
    ];

    for (let i = 0; i <= 6; i++) {
      // skapa trianglar
      if (i < segments) {
        const index = i * 2;

        indices.push(
          index,
          index + 1,
          index + 2,

          index + 1,
          index + 3,
          index + 2,
        );
      }
    }

    this.vertices = vertices;
    this.indices = indices;
  }
}
