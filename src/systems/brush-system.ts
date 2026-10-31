import { mat4, vec4 } from 'gl-matrix';
import {
  Brush,
  Colors,
  Mouse,
  TerrainBrushes,
} from 'src/app/map-editor/map-editor.component';
import {
  GrassBrush,
  GrassBrushCommand,
} from 'src/commands/grass-brush-command';
import { HeightBrushCommand } from 'src/commands/height-brush-command';
import {
  SplatBrush,
  SplatBrushCommand,
} from 'src/commands/splat-brush-command';
import { BrushImage } from 'src/components/brush-image';
import { Flower } from 'src/components/flower';
import { Grass } from 'src/components/grass';
import { MeshRenderer } from 'src/components/mesh-renderer';
import { Splatmap } from 'src/components/splatmap';
import { Terrain } from 'src/components/terrain';
import { Transform3D } from 'src/components/transform3D';
import { Tree } from 'src/components/tree';
import { Ecs } from 'src/core/ecs';
import { Renderer } from 'src/renderer/renderer';
import { ArrayManager } from 'src/resource-manager/array-manager';
import { CommandManager } from 'src/resource-manager/command-manager';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';

export class BrushSystem {
  update(meshBrush: Brush, ecs: Ecs, mouse: Mouse) {
    const meshRenderer = ecs.getComponent<MeshRenderer>(
      meshBrush.entity,
      'MeshRenderer',
    );
    if (!meshRenderer) return;
    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D',
    );
    if (!transform3D) return;
    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, transform3D.position);
    mat4.rotateX(modelMatrix, modelMatrix, transform3D.rotation[0]);
    mat4.rotateY(modelMatrix, modelMatrix, transform3D.rotation[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, transform3D.rotation[2]);
    mat4.scale(modelMatrix, modelMatrix, transform3D.scale);
    const texture = TextureManager.getTexture('framebuffer');
    const x = Math.floor(mouse.x);
    const y = 1080 - 1 - Math.floor(mouse.y);
    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);

    // Rendera samma mesh med picking-shadern
    const frame = Renderer.drawToFrameBuffer(x, y, mesh, texture, modelMatrix);

    if (frame === null) {
      const brushImage = ecs.getComponent<BrushImage>(
        meshBrush.entity,
        'BrushImage',
      );
      if (brushImage) {
        brushImage.UV[0] = -1;
        brushImage.UV[1] = -1;
        brushImage.size = meshBrush.radius / 2;
      }
      return;
    }
    const brushImage = ecs.getComponent<BrushImage>(
      meshBrush.entity,
      'BrushImage',
    );
    if (brushImage) {
      brushImage.UV[0] = frame.uv.x;
      brushImage.UV[1] = frame.uv.y;
      brushImage.size = meshBrush.radius / 2;
    }

    switch (meshBrush.type) {
      case TerrainBrushes.Height:
        this.heightBrush(meshBrush, frame.position, ecs);
        //this.heightBrushWithoutImage(meshBrush, position, ecs);
        break;
      case TerrainBrushes.Grass:
        this.addGrass(ecs, meshBrush, frame.position);
        break;
      case TerrainBrushes.Splat:
        const splatmap = ecs.getComponent<Splatmap>(
          meshBrush.entity,
          'Splatmap',
        );
        if (!splatmap) return;
        const coords = ArrayManager.getCoords(splatmap.splatmapId);
        this.paintImage(
          splatmap.size,
          coords,
          meshBrush,
          frame.uv.x,
          frame.uv.y,
        );
        splatmap.dirty = true;
        break;
      case TerrainBrushes.Flower:
        this.addFlower(ecs, meshBrush, frame.position, 0);
        break;
      case TerrainBrushes.Tree:
        this.addTree(ecs, meshBrush, frame.position, 0);
        break;
      case TerrainBrushes.Erosion:
        //this.erosionBrush(ecs, vertices, vertex.index, meshBrush);
        break;
      case TerrainBrushes.Flattening:
        this.flatteningBrush(meshBrush, frame.position, ecs);
        break;
    }
  }

  private erosionBrush(
    ecs: Ecs,
    vertices: Float32Array,
    index: number,
    meshBrush: Brush,
  ) {
    const vertexStride = 8;

    const commandList: Map<number, number> = new Map();

    // hur många vertices per rad
    const width = 101;

    // vertex index i grid
    const vertexIndex = index / vertexStride;

    const gridX = vertexIndex % width;
    const gridZ = Math.floor(vertexIndex / width);

    const radius = Math.ceil(meshBrush.radius);

    const strength = 0.025;
    const talus = 1.0;

    for (let z = -radius; z <= radius; z++) {
      for (let x = -radius; x <= radius; x++) {
        const nx = gridX + x;
        const nz = gridZ + z;

        if (nx < 0 || nx >= width || nz < 0) continue;

        const distance = Math.sqrt(x * x + z * z);

        if (distance > meshBrush.radius) continue;

        const neighborIndex = (nz * width + nx) * vertexStride;

        const neighborHeight = vertices[neighborIndex + 1];
        const currentHeight = vertices[index + 1];

        const diff = currentHeight - neighborHeight;

        if (diff > talus) {
          const amount =
            (diff - talus) * strength * (1 - distance / meshBrush.radius);
          commandList.set(neighborIndex + 1, -amount);
        }
      }
    }
    CommandManager.add(
      new HeightBrushCommand(meshBrush.entity, ecs, commandList),
    );
  }

  private calculateBrushImageUV(
    image: HTMLImageElement,
    radius: number,
    uv0: number,
    uv1: number,
    splatmapSize: number,
  ) {
    const texX = Math.floor(uv0 * splatmapSize) - Math.floor(image.width / 2);
    const texZ = Math.floor(uv1 * splatmapSize) - Math.floor(image.height / 2);
  }

  // private grassBrush(meshBrush: Brush, position: vec4, ecs: Ecs) {
  //   const transform3D = ecs.getComponent<Transform3D>(
  //     meshBrush.entity,
  //     'Transform3D',
  //   );
  //   const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
  //   const terrain = ecs.getComponent<Terrain>(meshBrush.entity, 'Terrain');
  //   const grass = ecs.getComponent<Grass>(meshBrush.entity, 'Grass');
  //   if (!transform3D || !mesh || !terrain || !grass) return;
  //   const vertexArray = MeshManager.getMesh(mesh.meshId);
  //   if (!vertexArray) return;
  //   for (
  //     let i = 0;
  //     i < vertexArray.vertexBuffer.vertices.length;
  //     i += vertexArray.bufferLayout.stride / 4
  //   ) {
  //     const vertices = vertexArray.vertexBuffer.vertices;
  //     const x = vertices[i];
  //     const y = vertices[i + 1];
  //     const z = vertices[i + 2];

  //     const u = vertices[i + 3];
  //     const v = vertices[i + 4];

  //     const px = Math.floor(u * (grass.size - 1));
  //     const pz = Math.floor(v * (grass.size - 1));

  //     const pixelIndex = (pz * grass.size + px) * 4;

  //     const green = grass.coords[pixelIndex + 1];

  //     if (green === 255) {
  //       grass.positions[grass.index] = position[0] * Math.random();
  //       grass.positions[grass.index + 1] = y;
  //       grass.positions[grass.index + 2] = position[2] * Math.random();

  //       grass.index += 3;
  //       grass.amount++;
  //     }
  //   }
  // }

  private grassBrushWithImage(
    ecs: Ecs,
    meshBrush: Brush,
    vx: number,
    vy: number,
    vz: number,
  ) {
    const image = this.getImageData(meshBrush.image, meshBrush.radius * 0.01);
    if (!image) return;
    const grass = ecs.getComponent<Grass>(meshBrush.entity, 'Grass');
    if (grass) {
      const grassList: GrassBrush[] = [];
      for (let z = 0; z < image.height; z++) {
        for (let x = 0; x < image.width; x++) {
          const index = (z * image.width + x) * 4;
          const r = image.data[index];
          if (r === 0) {
            const posX = vx - x;
            const posZ = vz - z;
            if (grass.amount >= grass.maxAmount) {
              CommandManager.add(
                new GrassBrushCommand(meshBrush.entity, ecs, grassList),
              );
              return;
            }
            grassList.push({ index: grass.index, x: posX, y: vy, z: posZ });
            grass.index += 3;
            grass.amount++;
          }
        }
      }
      CommandManager.add(
        new GrassBrushCommand(meshBrush.entity, ecs, grassList),
      );
    }
  }

  private addFlower(
    ecs: Ecs,
    meshBrush: Brush,
    position: { x: number; y: number; z: number },
    slot: number,
  ) {
    const flower = ecs.getComponent<Flower>(meshBrush.entity, 'Flower');
    if (!flower) return;
    flower.positions[flower.amount] = position.x;
    flower.positions[flower.amount + 1] = position.y;
    flower.positions[flower.amount + 2] = position.z;
    flower.amount++;
  }

  private addGrass(
    ecs: Ecs,
    meshBrush: Brush,
    position: { x: number; y: number; z: number },
  ) {
    const grass = ecs.getComponent<Grass>(meshBrush.entity, 'Grass');
    if (!grass) return;
    const positions = ArrayManager.getPositions(grass.grassId);
    positions[grass.amount] = position.x;
    positions[grass.amount + 1] = position.y;
    positions[grass.amount + 2] = position.z;
    grass.amount += 3;
  }

  private addTree(
    ecs: Ecs,
    meshBrush: Brush,
    position: { x: number; y: number; z: number },
    slot: number,
  ) {
    const tree = ecs.getComponent<Tree>(meshBrush.entity, 'Tree');
    if (!tree) return;
    tree.positions[tree.index] = position.x;
    tree.positions[tree.index + 1] = position.y + 0.5;
    tree.positions[tree.index + 2] = position.z;
    tree.positions[tree.index + 3] = slot;
    tree.positions[tree.index + 4] = 1; // scale
    tree.index += 5;
    tree.amount++;
  }

  private createFoliage(vertices: Float32Array, ecs: Ecs, meshBrush: Brush) {
    const grass = ecs.getComponent<Grass>(meshBrush.entity, 'Grass');
    const terrain = ecs.getComponent<Terrain>(meshBrush.entity, 'Terrain');
    if (!grass || !terrain) return;
    grass.amount = 0;
    const grassPositions = new Array();
    const stride = 8;

    for (let i = 0; i < vertices.length; i += stride) {
      const x = vertices[i + 0];
      const y = vertices[i + 1];
      const z = vertices[i + 2];

      const u = vertices[i + 3];
      const v = vertices[i + 4];

      const nx = vertices[i + 5];
      const ny = vertices[i + 6];
      const nz = vertices[i + 7];
    }
    //grass.positions.set(grassPositions);
  }

  private paintImage(
    size: number,
    coords: Uint8ClampedArray,
    meshBrush: Brush,
    uv0: number,
    uv1: number,
  ) {
    const radius = meshBrush.radius * 0.01;
    const splatColor = meshBrush.color;
    const image = this.getImageData(meshBrush.image, radius);
    if (!image) return;
    const texX = Math.floor(uv0 * size) - Math.floor(image.width / 2);
    const texZ = Math.floor(uv1 * size) - Math.floor(image.height / 2);
    const splatmapList: SplatBrush[] = [];
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const dx = texX + x;
        const dz = texZ + y;
        const splatmapIndex = (dz * size + dx) * 4;
        const imageIndex = (y * image.width + x) * 4;
        const red = image.data[imageIndex];
        const color = red; // 0-255 Om vandla svart till färg. 255 om svart
        if (splatColor === Colors.Red) {
          const r = coords[splatmapIndex + 0];
          const g = coords[splatmapIndex + 1];
          const b = coords[splatmapIndex + 2];
          const a = coords[splatmapIndex + 3];
          // öka r
          let nr = Math.min(r + color, 255);

          // hur mycket som "saknas"
          const delta = nr - r;

          // fördela bort från andra kanaler
          const sumOthers = g + b + a || 1;

          const ng = Math.max(g - delta * (g / sumOthers), 0);
          const nb = Math.max(b - delta * (b / sumOthers), 0);
          const na = Math.max(a - delta * (a / sumOthers), 0);
          splatmapList.push({
            index: splatmapIndex,
            colorR: nr,
            colorG: ng,
            colorB: nb,
            colorA: na,
          });
        } else if (splatColor === Colors.Green) {
          const r = coords[splatmapIndex + 0];
          const g = coords[splatmapIndex + 1];
          const b = coords[splatmapIndex + 2];
          const a = coords[splatmapIndex + 3];

          // öka r
          let ng = Math.min(g + color, 255);

          // hur mycket som "saknas"
          const delta = ng - g;

          // fördela bort från andra kanaler
          const sumOthers = r + b + a || 1;

          const nr = Math.max(r - delta * (r / sumOthers), 0);
          const nb = Math.max(b - delta * (b / sumOthers), 0);
          const na = Math.max(a - delta * (a / sumOthers), 0);
          splatmapList.push({
            index: splatmapIndex,
            colorR: nr,
            colorG: ng,
            colorB: nb,
            colorA: na,
          });
        } else if (splatColor === Colors.Blue) {
          const r = coords[splatmapIndex + 0];
          const g = coords[splatmapIndex + 1];
          const b = coords[splatmapIndex + 2];
          const a = coords[splatmapIndex + 3];

          // öka r
          let nb = Math.min(b + color, 255);

          // hur mycket som "saknas"
          const delta = nb - b;

          // fördela bort från andra kanaler
          const sumOthers = r + g + a || 1;

          const nr = Math.max(r - delta * (r / sumOthers), 0);
          const ng = Math.max(g - delta * (g / sumOthers), 0);
          const na = Math.max(a - delta * (a / sumOthers), 0);
          splatmapList.push({
            index: splatmapIndex,
            colorR: nr,
            colorG: ng,
            colorB: nb,
            colorA: na,
          });
        } else if (splatColor === Colors.Alpha) {
          const r = coords[splatmapIndex + 0];
          const g = coords[splatmapIndex + 1];
          const b = coords[splatmapIndex + 2];
          const a = coords[splatmapIndex + 3];

          // öka r
          let na = Math.min(a + color, 255);

          // hur mycket som "saknas"
          const delta = na - a;

          // fördela bort från andra kanaler
          const sumOthers = r + g + b || 1;

          const nr = Math.max(r - delta * (r / sumOthers), 0);
          const ng = Math.max(g - delta * (g / sumOthers), 0);
          const nb = Math.max(b - delta * (b / sumOthers), 0);
          splatmapList.push({
            index: splatmapIndex,
            colorR: nr,
            colorG: ng,
            colorB: nb,
            colorA: na,
          });
        }
      }
    }
    //Fix generic drawable instead of splashmap?
    CommandManager.add(new SplatBrushCommand(coords, splatmapList));
  }

  private heightBrush(
    meshBrush: Brush,
    position: { x: number; y: number; z: number },
    ecs: Ecs,
  ) {
    const brushRadius = meshBrush.radius;
    const brushStrength = meshBrush.strength;
    const imageData = this.getImageData(meshBrush.image, 1);
    if (!imageData) throw new Error('Could not get image data!');
    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D',
    );
    const meshRenderer = ecs.getComponent<MeshRenderer>(
      meshBrush.entity,
      'MeshRenderer',
    );
    const terrain = ecs.getComponent<Terrain>(meshBrush.entity, 'Terrain');
    if (!transform3D || !meshRenderer || !terrain) return;
    //LOVE THIS SOLUTION!
    const commandList: Map<number, number> = new Map();
    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);
    const vertices = mesh.vertexBuffer.vertices;
    for (let i = 0; i < vertices.length; i += mesh.bufferLayout.amount) {
      const x = vertices[i];
      const z = vertices[i + 2];
      const dx = x - position.x;
      const dz = z - position.z;
      // Mappa från world-space till penselns bildkoordinater
      const fx = (dx + brushRadius) / (brushRadius * 2); // 0 till 1
      const fz = (dz + brushRadius) / (brushRadius * 2);
      const px = Math.floor(fx * imageData.width);
      const pz = Math.floor(fz * imageData.height);
      if (px > 0 && px < imageData.width && pz > 0 && pz < imageData.height) {
        const pixelIndex = (pz * imageData.width + px) * 4;
        let red = imageData.data[pixelIndex];
        if (meshBrush.fallOff === 0 && red > 0) {
          red = 255;
        }
        const influence = (red / 255.0) * brushStrength;
        commandList.set(i + 1, influence);
      }
    }
    CommandManager.add(
      new HeightBrushCommand(meshBrush.entity, ecs, commandList),
    );
  }

  private flatteningBrush(
    meshBrush: Brush,
    position: { x: number; y: number; z: number },
    ecs: Ecs,
  ) {
    const brushRadius = meshBrush.radius;

    const meshRenderer = ecs.getComponent<MeshRenderer>(
      meshBrush.entity,
      'MeshRenderer',
    );

    const terrain = ecs.getComponent<Terrain>(meshBrush.entity, 'Terrain');

    if (!meshRenderer || !terrain) return;

    const commandList: Map<number, number> = new Map();

    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);
    const vertices = mesh.vertexBuffer.vertices;

    for (let i = 0; i < vertices.length; i += mesh.bufferLayout.amount) {
      const x = vertices[i];
      const z = vertices[i + 2];

      const dx = x - position.x;
      const dz = z - position.z;

      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance <= brushRadius) {
        const currentHeight = vertices[i + 1];

        const delta = meshBrush.strength - currentHeight;

        commandList.set(i + 1, delta);
      }
    }

    CommandManager.add(
      new HeightBrushCommand(meshBrush.entity, ecs, commandList),
    );
  }

  private heightBrushWithoutImage(
    meshBrush: Brush,
    position: { x: number; y: number; z: number },
    ecs: Ecs,
  ) {
    const brushRadius = meshBrush.radius;
    const brushStrength = meshBrush.strength;
    const meshRenderer = ecs.getComponent<MeshRenderer>(
      meshBrush.entity,
      'MeshRenderer',
    );
    if (!meshRenderer) return;
    const commandList: Map<number, number> = new Map();
    const mesh = MeshManager.getMesh(meshRenderer.meshId);
    if (!mesh) throw new Error('Could not get mesh' + meshRenderer.meshId);

    const vertices = mesh.vertexBuffer.vertices;
    const indices = mesh.indexBuffer.indices;
    const stride = mesh.bufferLayout.amount;

    for (let i = 0; i < vertices.length; i += stride) {
      const x = vertices[i];
      const z = vertices[i + 2];

      const dx = x - position.x;
      const dz = z - position.z;

      const distance = Math.sqrt(dx * dx + dz * dz);
      const t = distance / brushRadius;

      if (t <= 1.0) {
        const falloff = Math.pow(1.0 - t, meshBrush.fallOff);
        const influence = falloff * brushStrength;
        commandList.set(i + 1, influence);
      }
    }

    CommandManager.add(
      new HeightBrushCommand(meshBrush.entity, ecs, commandList),
    );
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

  // private pickVertex(
  //   ecs: Ecs,
  //   meshBrush: Brush,
  //   mouse: Mouse,
  //   perspectiveCamera: PerspectiveCamera,
  // ) {
  //   const epsilon = 10;
  //   const maxDistance = 1000;
  //   const step = 1;

  //   const viewMatrix = perspectiveCamera.getViewMatrix();
  //   const invertedView = mat4.create();
  //   mat4.invert(invertedView, viewMatrix);

  //   const rayOrigin = vec3.fromValues(
  //     invertedView[12],
  //     invertedView[13],
  //     invertedView[14],
  //   );

  //   const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
  //   const transform3D = ecs.getComponent<Transform3D>(
  //     meshBrush.entity,
  //     'Transform3D',
  //   );

  //   if (!mesh || !transform3D) return;
  //   for (let i = 0; i < maxDistance; i += step) {
  //     const pos = vec3.create();
  //     vec3.scaleAndAdd(pos, rayOrigin, mouse.dir, i); // pos = origin + dir * i
  //     //8 Stride change later to make it get from the mesh stride, offset etc
  //     for (let j = 0; j < mesh.vertices.length; j += 8) {
  //       const vx =
  //         mesh.vertices[j] * transform3D.scale[0] + transform3D.translate[0];
  //       const vy =
  //         mesh.vertices[j + 1] * transform3D.scale[1] +
  //         transform3D.translate[1];
  //       const vz =
  //         mesh.vertices[j + 2] * transform3D.scale[2] +
  //         transform3D.translate[2];
  //       // Calculate distance between vertex positions and raycaster's position.
  //       const dx = vx - pos[0];
  //       const dy = vy - pos[1];
  //       const dz = vz - pos[2];
  //       //Bad calculate distance formula... again... USE SOME FINISHED LIKE IN ANY LIBRARY
  //       const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  //       if (dist < epsilon) {
  //         if (meshBrush.type === ToolBrush.Height) {
  //         } else if (meshBrush.type === ToolBrush.Grass) {
  //         } else if (meshBrush.type === ToolBrush.Trees) {
  //         } else if (meshBrush.type === ToolBrush.Splat) {
  //         }
  //         return;
  //       }
  //     }
  //   }
  // }
}
