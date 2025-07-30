import { mat4, vec3 } from 'gl-matrix';
import { Entity } from 'src/app/entity';
import { Brush, ToolBrush } from 'src/app/map-editor/map-editor.component';
import { Grass } from 'src/components/grass';
import { Mesh } from 'src/components/mesh';
import { Splatmap } from 'src/components/splatmap';
import { Transform3D } from 'src/components/transform3D';
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
    this.pickVertex(ecs, meshBrush, mousePos, perspectiveCamera);
  }

  private pickVertex(
    ecs: Ecs,
    meshBrush: Brush,
    mousePos: vec3,
    perspectiveCamera: PerspectiveCamera
  ) {
    const epsilon = 10;
    const maxDistance = 1000;
    const step = 1;

    const viewMatrix = perspectiveCamera.getViewMatrix();
    const invertedView = mat4.create();
    mat4.invert(invertedView, viewMatrix);

    const rayOrigin = vec3.fromValues(
      invertedView[12],
      invertedView[13],
      invertedView[14]
    );

    const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D'
    );
    if (!mesh || !transform3D) return;
    const pos = vec3.create();
    for (let i = 0; i < maxDistance; i += step) {
      vec3.scaleAndAdd(pos, rayOrigin, mousePos, i); // pos = origin + dir * i
      //8 Stride change later to make it get from the mesh stride, offset etc.
      for (let j = 0; j < mesh.vertices.length; j += 8) {
        const vx =
          mesh.vertices[j] * transform3D.scale[0] + transform3D.translate[0];
        const vy =
          mesh.vertices[j + 1] * transform3D.scale[1] +
          transform3D.translate[1];
        const vz =
          mesh.vertices[j + 2] * transform3D.scale[2] +
          transform3D.translate[2];
        // Calculate distance between vertex positions and raycaster's position.
        const dx = vx - pos[0];
        const dy = vy - pos[1];
        const dz = vz - pos[2];
        //Bad calculate distance formula... again... USE SOME FINISHED LIKE IN ANY LIBRARY
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < epsilon) {
          if (meshBrush.type === ToolBrush.Height) {
            this.heightBrush(meshBrush, mesh.vertices, vx, vy, vz, transform3D);
            this.updateNormals(mesh);
          } else if (meshBrush.type === ToolBrush.Grass) {
            //this.grassBrush(ecs, vx, vy, vz, mesh, meshBrush);
            this.grassBrushWithImage(ecs, meshBrush, vx, vy, vz);
          } else if (meshBrush.type === ToolBrush.Trees) {
            this.treeBrush(ecs, mesh.vertices[j + 3], mesh.vertices[j + 4]);
          } else if (meshBrush.type === ToolBrush.Splat) {
            this.paintImage(
              ecs,
              meshBrush,
              mesh.vertices[j + 3],
              mesh.vertices[j + 4]
            );
          }
          return;
        }
      }
    }
  }

  private grassBrushWithImage(
    ecs: Ecs,
    meshBrush: Brush,
    vx: number,
    vy: number,
    vz: number
  ) {
    const image = this.getImageData(meshBrush.image, meshBrush.radius * 0.01);
    if (!image) return;
    for (const entity of ecs.getEntities()) {
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      if (grass) {
        for (let z = 0; z < image.height; z++) {
          for (let x = 0; x < image.width; x++) {
            const index = (z * image.width + x) * 4;
            const r = image.data[index];
            if (r < 200) {
              const posX = vx - x;
              const posZ = vz - z;
              if (grass.amountOfGrass >= grass.maxGrassBuffer) return;
              grass.positions.push(
                posX * 2 + image.width,
                vy,
                posZ * 2 + image.height
              );
              grass.amountOfGrass++;
            }
          }
        }
        return;
      }
    }
  }

  private grassBrush(
    ecs: Ecs,
    x: number,
    y: number,
    z: number,
    mesh: Mesh,
    meshBrush: Brush
  ) {
    for (const entity of ecs.getEntities()) {
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      if (grass) {
        const radius = meshBrush.radius;
        for (let j = -radius; j < meshBrush.radius; j++) {
          for (let i = -radius; i < meshBrush.radius; i++) {
            if (j * j + i * i <= radius * radius) {
              if (grass.positions.length > grass.maxGrassBuffer) return;
              grass.positions.push(x * 2 + j * 0.5, y, z * 2 + i * 0.5);
            }
          }
        }
      }
    }
  }

  private treeBrush(ecs: Ecs, u: number, v: number) {
    for (const entity of ecs.getEntities()) {
      const tree = ecs.getComponent<Tree>(entity, 'Tree');
      if (tree) {
        tree.positions.push(u * 2, 0, v * 2);
        return;
      }
    }
  }

  private paintImage(ecs: Ecs, meshBrush: Brush, uv0: number, uv1: number) {
    //const alpha = meshBrush.alpha;
    const radius = meshBrush.radius;
    const splatColor = meshBrush.color;
    const splatmap = ecs.getComponent<Splatmap>(meshBrush.entity, 'Splatmap');
    if (splatmap) {
      const image = this.getImageData(meshBrush.image, radius * 0.01);
      if (!image) return;
      const texX =
        Math.floor(uv0 * splatmap.width) - Math.floor(image.width / 2);
      const texZ =
        Math.floor(uv1 * splatmap.height) - Math.floor(image.height / 2);
      for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
          const dx = texX + x;
          const dz = texZ + y;
          const splatmapIndex = (dz * splatmap.width + dx) * 4;
          const imageIndex = (y * image.width + x) * 4;
          const red = image.data[imageIndex];
          const color = 255 - red; // 0-255 Om vandla svart till färg. 255 om svart
          if (splatColor === 'red') {
            //Red
            splatmap.coords[splatmapIndex + 0] = Math.min(
              splatmap.coords[splatmapIndex + 0] + color,
              255
            );
            //Green
            splatmap.coords[splatmapIndex + 1] = Math.min(
              splatmap.coords[splatmapIndex + 1] - color,
              255
            );
            //Blue
            splatmap.coords[splatmapIndex + 2] = Math.min(
              splatmap.coords[splatmapIndex + 2] - color,
              255
            );
            //Alpha
            splatmap.coords[splatmapIndex + 3] = Math.min(
              splatmap.coords[splatmapIndex + 3] - color,
              255
            );
          } else if (splatColor === 'green') {
            //Red
            splatmap.coords[splatmapIndex + 0] = Math.min(
              splatmap.coords[splatmapIndex + 0] - color,
              255
            );
            //Green
            splatmap.coords[splatmapIndex + 1] = Math.min(
              splatmap.coords[splatmapIndex + 1] + color,
              255
            );
            //Blue
            splatmap.coords[splatmapIndex + 2] = Math.min(
              splatmap.coords[splatmapIndex + 2] - color,
              255
            );
            //Alpha
            splatmap.coords[splatmapIndex + 3] = Math.min(
              splatmap.coords[splatmapIndex + 3] - color,
              255
            );
          } else if (splatColor === 'blue') {
            //Red
            splatmap.coords[splatmapIndex + 0] = Math.min(
              splatmap.coords[splatmapIndex + 0] - color,
              255
            );
            //Green
            splatmap.coords[splatmapIndex + 1] = Math.min(
              splatmap.coords[splatmapIndex + 1] - color,
              255
            );
            //Blue
            splatmap.coords[splatmapIndex + 2] = Math.min(
              splatmap.coords[splatmapIndex + 2] + color,
              255
            );
            //Alpha
            splatmap.coords[splatmapIndex + 3] = Math.min(
              splatmap.coords[splatmapIndex + 3] - color,
              255
            );
          } else if (splatColor === 'alpha') {
            //Red
            splatmap.coords[splatmapIndex + 0] = Math.min(
              splatmap.coords[splatmapIndex + 0] - color,
              255
            );
            //Green
            splatmap.coords[splatmapIndex + 1] = Math.min(
              splatmap.coords[splatmapIndex + 1] - color,
              255
            );
            //Blue
            splatmap.coords[splatmapIndex + 2] = Math.min(
              splatmap.coords[splatmapIndex + 2] - color,
              255
            );
            //Alpha
            splatmap.coords[splatmapIndex + 3] = Math.min(
              splatmap.coords[splatmapIndex + 3] + color,
              255
            );
          }
        }
      }
      return;
    }
  }

  private paintCircle(ecs: Ecs, meshBrush: Brush, uv0: number, uv1: number) {
    const alpha = meshBrush.alpha;
    const radius = meshBrush.radius;
    const splatColor = meshBrush.color;
    const splatmap = ecs.getComponent<Splatmap>(meshBrush.entity, 'Splatmap');
    if (splatmap) {
      const texX = Math.floor(uv0 * splatmap.width); // Omvandla u till texel X
      const texZ = Math.floor(uv1 * splatmap.height); // Omvandla v till texel Y
      for (let z = -radius; z <= radius; z++) {
        for (let x = -radius; x <= radius; x++) {
          const dx = x;
          const dz = z;
          if (dx * dx + dz * dz <= radius * radius) {
            const px = texX + dx;
            const pz = texZ + dz;
            //To not draw outside of width and height

            const idx = (pz * splatmap.width + px) * 4;
            const distance = Math.sqrt(dx * dx + dz * dz);
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

  private heightBrush(
    meshBrush: Brush,
    vertices: Float32Array,
    x: number,
    y: number,
    z: number,
    transform3D: Transform3D
  ) {
    const imageData = this.getImageData(meshBrush.image, 1);
    if (!imageData) return;
    const brushRadius = meshBrush.radius;
    const brushStrength = meshBrush.strength;
    const fallOff = meshBrush.fallOff;
    for (let i = 0; i < vertices.length; i += 8) {
      const vx = vertices[i] * transform3D.scale[0] + transform3D.translate[0];
      const vz =
        vertices[i + 2] * transform3D.scale[2] + transform3D.translate[2];
      // Calculate distance again between vertices and raycasting...
      const dx = vx - x;
      const dz = vz - z;
      //Same formula again for some reasong... need a function!
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > brushRadius) continue;
      // Mappa från world-space till penselns bildkoordinater
      const fx = (dx + brushRadius) / (brushRadius * 2); // 0 till 1
      const fz = (dz + brushRadius) / (brushRadius * 2);
      const px = Math.floor(fx * imageData.width);
      const pz = Math.floor(fz * imageData.height);
      if (px > 0 && px < imageData.width && pz > 0 && pz < imageData.height) {
        const pixelIndex = (pz * imageData.width + px) * 4;
        const red = imageData.data[pixelIndex];
        if (red < 255) {
          const influence =
            (1 - (dist / brushRadius) * fallOff) * brushStrength;
          if (fallOff === 0) {
            vertices[i + 1] += brushStrength;
            continue;
          }
          vertices[i + 1] += influence;
        }
      }
    }
  }

  private getImageData(image: HTMLImageElement, scale: number) {
    if (scale <= 0) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0);
    //Get all imagedata of image on canvas
    return ctx.getImageData(0, 0, image.width * scale, image.height * scale);
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
