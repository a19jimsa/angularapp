import { mat4, vec3 } from 'gl-matrix';
import { Entity } from 'src/app/entity';
import { Brush, ToolBrush } from 'src/app/map-editor/map-editor.component';
import { Grass } from 'src/components/grass';
import { Mesh } from 'src/components/mesh';
import { Splatmap } from 'src/components/splatmap';
import { Tree } from 'src/components/tree';
import { Ecs } from 'src/core/ecs';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

export class BrushSystem {
  update(
    meshBrush: Brush,
    ecs: Ecs,
    mousePos: vec3,
    perspectiveCamera: PerspectiveCamera
  ) {
    for (const entity of ecs.getEntities()) {
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      if (mesh) {
        this.pickVertex(
          ecs,
          entity,
          meshBrush,
          mesh,
          mousePos,
          perspectiveCamera
        );
      }
    }
  }

  private pickVertex(
    ecs: Ecs,
    entity: Entity,
    meshBrush: Brush,
    mesh: Mesh,
    mousePos: vec3,
    perspectiveCamera: PerspectiveCamera
  ) {
    const epsilon = 1;
    const maxDistance = 200;
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
      //8 Stride change later to make it get from the mesh stride, offset etc.
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
            this.grassBrush(ecs, vx, vy, vz);
          } else if (meshBrush.type === ToolBrush.Trees) {
            console.log('Trees');
            this.treeBrush(ecs, vx, vy, vz);
          } else if (meshBrush.type === ToolBrush.Splat) {
            this.paintCircle(
              ecs,
              entity,
              meshBrush,
              mesh.vertices[i + 3],
              mesh.vertices[i + 4]
            );
          }
          return;
        }
      }
    }
    return null;
  }

  private grassBrush(ecs: Ecs, x: number, y: number, z: number) {
    for (const entity of ecs.getEntities()) {
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      if (grass && mesh) {
        for (let i = 0; i < 100; i++) {
          if (grass.amountOfGrass >= grass.maxGrassBuffer) return;
          const randomx = -5 + Math.random() * 10;
          const randomz = -5 + Math.random() * 10;
          grass.positions.push((x + randomx) * 2, y * 2, (z + randomz) * 2);
          grass.amountOfGrass++;
        }
      }
    }
  }

  private treeBrush(ecs: Ecs, x: number, y: number, z: number) {
    for (const entity of ecs.getEntities()) {
      const tree = ecs.getComponent<Tree>(entity, 'Tree');
      if (tree) {
        tree.positions.push(x * 1.7, y * 2, z * 2);
        return;
      }
    }
  }

  private paintCircle(
    ecs: Ecs,
    entity: Entity,
    brush: Brush,
    uv0: number,
    uv1: number
  ) {
    const alpha = brush.alpha;
    const radius = brush.radius;
    const splatColor = brush.color;
    const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
    if (splatmap) {
      const texX = Math.floor(uv0 * splatmap.width); // Omvandla u till texel X
      const texY = Math.floor(uv1 * splatmap.height); // Omvandla v till texel Y
      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          const dx = x;
          const dy = y;
          if (dx * dx + dy * dy <= radius * radius) {
            const px = texX + dx;
            const py = texY + dy;
            //To not draw outside of width and height
            if (
              px > 0 &&
              px < splatmap.width &&
              py > 0 &&
              py < splatmap.height
            ) {
              const idx = (py * splatmap.width + px) * 4;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const strength = 255 * alpha * (1 - distance / radius);
              if (splatColor === 'red') {
                //Red
                splatmap.coords[idx + 0] = Math.min(
                  splatmap.coords[idx + 0] + strength,
                  255
                );
                //Green
                splatmap.coords[idx + 1] = Math.min(
                  splatmap.coords[idx + 1] - strength,
                  255
                );
                //Blue
                splatmap.coords[idx + 2] = Math.min(
                  splatmap.coords[idx + 2] - strength,
                  255
                );
                //Alpha
                splatmap.coords[idx + 3] = Math.min(
                  splatmap.coords[idx + 3] - strength,
                  255
                );
              } else if (splatColor === 'green') {
                //Red
                splatmap.coords[idx + 0] = Math.min(
                  splatmap.coords[idx + 0] - strength,
                  255
                );
                //Green
                splatmap.coords[idx + 1] = Math.min(
                  splatmap.coords[idx + 1] + strength,
                  255
                );
                //Blue
                splatmap.coords[idx + 2] = Math.min(
                  splatmap.coords[idx + 2] - strength,
                  255
                );
                //Alpha
                splatmap.coords[idx + 3] = Math.min(
                  splatmap.coords[idx + 3] - strength,
                  255
                );
              } else if (splatColor === 'blue') {
                //Red
                splatmap.coords[idx + 0] = Math.min(
                  splatmap.coords[idx + 0] - strength,
                  255
                );
                //Green
                splatmap.coords[idx + 1] = Math.min(
                  splatmap.coords[idx + 1] - strength,
                  255
                );
                //Blue
                splatmap.coords[idx + 2] = Math.min(
                  splatmap.coords[idx + 2] + strength,
                  255
                );
                //Alpha
                splatmap.coords[idx + 3] = Math.min(
                  splatmap.coords[idx + 3] - strength,
                  255
                );
              } else if (splatColor === 'alpha') {
                //Red
                splatmap.coords[idx + 0] = Math.min(
                  splatmap.coords[idx + 0] - strength,
                  255
                );
                //Green
                splatmap.coords[idx + 1] = Math.min(
                  splatmap.coords[idx + 1] - strength,
                  255
                );
                //Blue
                splatmap.coords[idx + 2] = Math.min(
                  splatmap.coords[idx + 2] - strength,
                  255
                );
                //Alpha
                splatmap.coords[idx + 3] = Math.min(
                  splatmap.coords[idx + 3] + strength,
                  255
                );
              }
            }
          }
        }
      }
    }
  }

  private meshBrush(
    meshBrush: Brush,
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
