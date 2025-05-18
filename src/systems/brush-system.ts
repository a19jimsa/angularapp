import { mat4, vec3 } from 'gl-matrix';
import { MeshBrush, ToolBrush } from 'src/app/map-editor/map-editor.component';
import { Grass } from 'src/components/grass';
import { Mesh } from 'src/components/mesh';
import { Ecs } from 'src/core/ecs';
import { Model } from 'src/renderer/model';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

export class BrushSystem {
  update(
    meshBrush: MeshBrush,
    ecs: Ecs,
    mousePos: vec3,
    perspectiveCamera: PerspectiveCamera
  ) {
    for (const entity of ecs.getEntities()) {
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      if (mesh) {
        this.pickVertex(ecs, meshBrush, mesh, mousePos, perspectiveCamera);
      }
    }
  }

  private pickVertex(
    ecs: Ecs,
    meshBrush: MeshBrush,
    mesh: Mesh,
    mousePos: vec3,
    perspectiveCamera: PerspectiveCamera
  ) {
    const epsilon = 1;
    const maxDistance = 100;
    const step = 1;

    const viewMatrix = perspectiveCamera.getViewMatrix();
    const invertedView = mat4.create();
    mat4.invert(invertedView, viewMatrix);

    const rayOrigin = vec3.fromValues(
      invertedView[12],
      invertedView[13],
      invertedView[14]
    );

    for (let t = 0; t < maxDistance; t += step) {
      const pos = vec3.create();
      vec3.scaleAndAdd(pos, rayOrigin, mousePos, t); // pos = origin + dir * t
      for (let i = 0; i < mesh.vertices.length; i += 8) {
        const vx = mesh.vertices[i];
        const vy = mesh.vertices[i + 1];
        const vz = mesh.vertices[i + 2];
        // Beräkna distans från rayens aktuella punkt till vertexen
        const dx = vx - pos[0];
        const dy = vy - pos[1];
        const dz = vz - pos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < epsilon) {
          if (meshBrush.type === ToolBrush.Height) {
            this.meshBrush(meshBrush, mesh.vertices, vx, vy, vz);
            this.updateNormals(mesh);
          } else if (meshBrush.type === ToolBrush.Grass) {
            this.grassBrush(ecs, mesh, vx, vy, vz);
          }
          return;
        }
      }
    }
    return null;
  }

  private grassBrush(ecs: Ecs, terrain: Mesh, x: number, y: number, z: number) {
    for (const entity of ecs.getEntities()) {
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      if (grass && mesh) {
        for (let i = 0; i < terrain.vertices.length; i += 32) {
          const vx = terrain.vertices[i];
          const vz = terrain.vertices[i + 2];

          grass.positions.push(vx - x, 0, vz - z);
          console.log(vx);
        }
      }
    }
  }

  private meshBrush(
    meshBrush: MeshBrush,
    vertices: Float32Array,
    x: number,
    y: number,
    z: number
  ) {
    const imageData = this.getImageData(meshBrush.image);
    if (!imageData) return;
    const brushRadius = meshBrush.radius;
    const brushStrength = meshBrush.strength;
    for (let i = 0; i < vertices.length; i += 8) {
      const vx = vertices[i];
      const vz = vertices[i + 2];
      // Beräkna distans från rayens aktuella punkt till vertexen
      const dx = vx - x;
      const dz = vz - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > brushRadius) continue;
      // Mappa från world-space till penselns bildkoordinater
      const fx = (dx + brushRadius) / (brushRadius * 2); // 0 till 1
      const fz = (dz + brushRadius) / (brushRadius * 2);
      const px = Math.floor(fx * imageData.width);
      const py = Math.floor(fz * imageData.height);
      if (px >= 0 && px < imageData.width && py >= 0 && py < imageData.height) {
        const pixelIndex = (py * imageData.width + px) * 4;
        const red = imageData.data[pixelIndex];
        if (red !== 255) {
          const influence = (1 - dist / brushRadius) * brushStrength;
          vertices[i + 1] += influence;
        }
      }
    }
  }

  private getImageData(image: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    //Get all imagedata of image on canvas
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  public updateNormals(mesh: Mesh): void {
    // Steg 1: Initiera alla normals till 0
    for (let i = 0; i < mesh.vertices.length / 8; i++) {
      mesh.vertices[i * 8 + 5] = 0;
      mesh.vertices[i * 8 + 6] = 0;
      mesh.vertices[i * 8 + 7] = 0;
    }
    //Stride 8 xyzuvnormals(3)
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];

      const v0 = mesh.vertices[i0 * 8];
      const v1 = mesh.vertices[i0 * 8 + 1];
      const v2 = mesh.vertices[i0 * 8 + 2];

      const v3 = mesh.vertices[i1 * 8];
      const v4 = mesh.vertices[i1 * 8 + 1];
      const v5 = mesh.vertices[i1 * 8 + 2];

      const v6 = mesh.vertices[i2 * 8];
      const v7 = mesh.vertices[i2 * 8 + 1];
      const v8 = mesh.vertices[i2 * 8 + 2];

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
        mesh.vertices[idx * 8 + 5] += normal[0];
        mesh.vertices[idx * 8 + 6] += normal[1];
        mesh.vertices[idx * 8 + 7] += normal[2];
      }
    }
    // Steg 3: Normalisera normals för varje vertex
    for (let i = 0; i < mesh.vertices.length / 8; i++) {
      const nx = mesh.vertices[i * 8 + 5];
      const ny = mesh.vertices[i * 8 + 6];
      const nz = mesh.vertices[i * 8 + 7];

      const normal = vec3.fromValues(nx, ny, nz);
      vec3.normalize(normal, normal);

      mesh.vertices[i * 8 + 5] = normal[0];
      mesh.vertices[i * 8 + 6] = normal[1];
      mesh.vertices[i * 8 + 7] = normal[2];
    }
  }
}
