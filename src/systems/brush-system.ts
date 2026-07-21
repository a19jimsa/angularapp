import { mat4, vec3, vec4 } from 'gl-matrix';
import {
  Brush,
  Mouse,
  ToolBrush,
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
import { Grass } from 'src/components/grass';
import { Mesh } from 'src/components/mesh';
import { Splatmap } from 'src/components/splatmap';
import { Terrain } from 'src/components/terrain';
import { Transform3D } from 'src/components/transform3D';
import { Tree } from 'src/components/tree';
import { Ecs } from 'src/core/ecs';
import { Renderer } from 'src/renderer/renderer';
import { CommandManager } from 'src/resource-manager/command-manager';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { MathUtils } from 'src/Utils/MathUtils';

export type Height = {
  index: number;
  y: number;
};

export class BrushSystem {
  update(meshBrush: Brush, ecs: Ecs, mouse: Mouse) {
    const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
    if (!mesh) return;
    const vertexArray = MeshManager.getMesh(mesh.meshId);
    if (!vertexArray) return;
    const vertices = vertexArray.vertexBuffer.vertices;
    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D',
    );
    if (!mesh || !transform3D) return;
    const index = this.pickVertexNew(transform3D, mesh.meshId, mouse);
    if (index === -1) return;
    const brushImage = ecs.getComponent<BrushImage>(
      meshBrush.entity,
      'BrushImage',
    );
    if (brushImage) {
      brushImage.UV[0] = vertexArray.vertexBuffer.vertices[index + 3];
      brushImage.UV[1] = vertexArray.vertexBuffer.vertices[index + 4];
    }

    if (mouse.dragging || mouse.clicked) {
      // const pivot = ecs.getComponent<Pivot>(meshBrush.entity, 'Pivot');
      // if (pivot) {
      //   const pivotIndex = this.pickVertexNew(transform3D, 'pivot', mouse);
      //   this.movePivot(transform3D, mouse, pivotIndex);
      // }
      if (meshBrush.type === ToolBrush.Height) {
        if (brushImage) {
          brushImage.size = meshBrush.radius;
        }
        this.heightBrush(
          meshBrush,
          vec4.fromValues(
            vertices[index],
            vertices[index + 1],
            vertices[index + 2],
            1,
          ),
          ecs,
        );
      } else if (meshBrush.type === ToolBrush.Trees) {
        this.treeBrush(
          ecs,
          meshBrush,
          vertices[index],
          vertices[index + 1],
          vertices[index + 2],
        );
      } else if (meshBrush.type === ToolBrush.Splat) {
        const splatmap = ecs.getComponent<Splatmap>(
          meshBrush.entity,
          'Splatmap',
        );
        if (!splatmap) return;
        if (brushImage) {
          brushImage.size = meshBrush.radius;
        }
        this.paintImage(
          ecs,
          splatmap.size,
          splatmap.coords,
          meshBrush,
          vertices[index + 3],
          vertices[index + 4],
        );
      } else if (meshBrush.type === ToolBrush.Grass) {
        const grass = ecs.getComponent<Grass>(meshBrush.entity, 'Grass');
        if (!grass) return;
        this.paintImage(
          ecs,
          grass.size,
          grass.coords,
          meshBrush,
          vertices[index + 3],
          vertices[index + 4],
        );
        this.drawGrass(vertices, ecs, meshBrush);
      }
    }
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
    console.log(uv0, uv1);
  }

  private pickVertexNew(
    transform3D: Transform3D,
    meshId: string,
    mouse: Mouse,
  ) {
    const camera = Renderer.getCamera();
    const vertexArray = MeshManager.getMesh(meshId);
    if (!vertexArray) return -1;
    const vertices = vertexArray.vertexBuffer.vertices;
    for (
      let i = vertices.length - vertexArray.bufferLayout.stride / 4;
      i >= 0;
      i -= vertexArray.bufferLayout.stride / 4
    ) {
      const model = mat4.create();

      // translation
      mat4.translate(model, model, transform3D.position);

      // rotation (ordning är viktig – välj en och håll den konsekvent)
      mat4.rotateX(model, model, transform3D.rotation[0]);
      mat4.rotateY(model, model, transform3D.rotation[1]);
      mat4.rotateZ(model, model, transform3D.rotation[2]);

      // scale
      mat4.scale(model, model, transform3D.scale);

      const mvp = mat4.create();
      mat4.multiply(mvp, camera.getViewProjectionMatrix(), model);

      const pos = vec4.fromValues(
        vertices[i],
        vertices[i + 1],
        vertices[i + 2],
        1.0,
      );

      const clip = vec4.create();
      vec4.transformMat4(clip, pos, mvp);

      if (clip[3] <= 0) continue; // bakom kameran

      const ndcX = clip[0] / clip[3];
      const ndcY = clip[1] / clip[3];
      const ndcZ = clip[2] / clip[3];

      if (
        ndcX < -1 ||
        ndcX > 1 ||
        ndcY < -1 ||
        ndcY > 1 ||
        ndcZ < -1 ||
        ndcZ > 1
      )
        continue;

      const sx = (ndcX * 0.5 + 0.5) * Renderer.getWidth();
      const sy = (1 - (ndcY * 0.5 + 0.5)) * Renderer.getHeight();

      const dx = mouse.x - sx;
      const dy = mouse.y - sy;

      const d = dx * dx + dy * dy;
      if (d < 300) {
        return i;
      }
    }
    return -1;
  }

  private movePivot(transform3D: Transform3D, mouse: Mouse, index: number) {
    const vertexArray = MeshManager.getMesh('pivot');
    if (!vertexArray) return;

    if (mouse.isSelected.select && mouse.isSelected.element === 6) {
      transform3D.position[0] -= mouse.deltaX;
      return;
    } else if (mouse.isSelected.select && mouse.isSelected.element === 18) {
      transform3D.position[1] += mouse.deltaY;
      return;
    } else if (mouse.isSelected.select && mouse.isSelected.element === 30) {
      transform3D.position[2] -= mouse.deltaY;
      return;
    }
    if (index === 6) {
      mouse.isSelected = { select: true, element: 6 };
    } else if (index === 18) {
      mouse.isSelected = { select: true, element: 18 };
    } else if (index === 30) {
      mouse.isSelected = { select: true, element: 30 };
    }
  }

  private grassBrush(meshBrush: Brush, position: vec4, ecs: Ecs) {
    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D',
    );
    const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
    const terrain = ecs.getComponent<Terrain>(meshBrush.entity, 'Terrain');
    const grass = ecs.getComponent<Grass>(meshBrush.entity, 'Grass');
    if (!transform3D || !mesh || !terrain || !grass) return;
    const vertexArray = MeshManager.getMesh(mesh.meshId);
    if (!vertexArray) return;
    for (
      let i = 0;
      i < vertexArray.vertexBuffer.vertices.length;
      i += vertexArray.bufferLayout.stride / 4
    ) {
      const vertices = vertexArray.vertexBuffer.vertices;
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];

      const u = vertices[i + 3];
      const v = vertices[i + 4];

      const px = Math.floor(u * (grass.size - 1));
      const pz = Math.floor(v * (grass.size - 1));

      const pixelIndex = (pz * grass.size + px) * 4;

      const green = grass.coords[pixelIndex + 1];

      if (green === 255) {
        grass.positions[grass.index] = position[0] * Math.random();
        grass.positions[grass.index + 1] = y;
        grass.positions[grass.index + 2] = position[2] * Math.random();

        grass.index += 3;
        grass.amount++;
      }
    }
  }

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

  private treeBrush(
    ecs: Ecs,
    meshBrush: Brush,
    x: number,
    y: number,
    z: number,
  ) {
    const splatmap = ecs.getComponent<Splatmap>(meshBrush.entity, 'Splatmap');
    const tree = ecs.getComponent<Tree>(meshBrush.entity, 'Tree');
    if (!splatmap || !tree) return;
  }

  private findVertex(u: number, v: number) {}

  private drawGrass(vertices: Float32Array, ecs: Ecs, meshBrush: Brush) {
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

      const px = Math.floor(u * (grass.size - 1));
      const pz = Math.floor(v * (grass.size - 1));

      const pixelIndex = (pz * grass.size + px) * 4;

      const green = grass.coords[pixelIndex + 1];

      if (green === 255) {
        for (let j = 0; j < 100; j++) {
          const offset = 0.05;

          const dx = x + MathUtils.random(0, 10);
          const dz = z + MathUtils.random(0, 10);

          const grassX = dx + nx * offset;
          const grassY = y + ny * offset;
          const grassZ = dz + nz * offset;

          grassPositions.push(grassX, grassY, grassZ);

          grass.amount++;

          if (grass.amount >= grass.maxAmount) return;
        }
      }
    }
    grass.positions.set(grassPositions);
  }

  private paintImage(
    ecs: Ecs,
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
        if (splatColor === 'red') {
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
        } else if (splatColor === 'green') {
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
        } else if (splatColor === 'blue') {
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
        } else if (splatColor === 'alpha') {
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

  private heightBrush(meshBrush: Brush, position: vec4, ecs: Ecs) {
    const brushRadius = meshBrush.radius * 2;
    const brushStrength = meshBrush.strength;
    const imageData = this.getImageData(meshBrush.image, 0.5);
    if (!imageData) throw new Error('Could not get image data!');

    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D',
    );
    const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
    const terrain = ecs.getComponent<Terrain>(meshBrush.entity, 'Terrain');
    if (!transform3D || !mesh || !terrain) return;
    //LOVE THIS SOLUTION!
    const commandList: Map<number, number> = new Map();
    const vertexArray = MeshManager.getMesh(mesh.meshId);
    if (!vertexArray) return;
    for (
      let i = 0;
      i < vertexArray.vertexBuffer.vertices.length;
      i += vertexArray.bufferLayout.stride / 4
    ) {
      const pos = vec4.fromValues(
        vertexArray.vertexBuffer.vertices[i],
        vertexArray.vertexBuffer.vertices[i + 1],
        vertexArray.vertexBuffer.vertices[i + 2],
        1,
      );
      const dx = pos[0] - position[0];
      const dz = pos[2] - position[2];
      // Mappa från world-space till penselns bildkoordinater
      const fx = (dx + brushRadius) / (brushRadius * 2); // 0 till 1
      const fz = (dz + brushRadius) / (brushRadius * 2);
      const px = Math.floor(fx * imageData.width);
      const pz = Math.floor(fz * imageData.height);
      if (px > 0 && px < imageData.width && pz > 0 && pz < imageData.height) {
        const pixelIndex = (pz * imageData.width + px) * 4;
        const red = imageData.data[pixelIndex];
        const influence = (red / 255.0) * brushStrength;
        //Now we have commands instead!
        //Just save all affected vertices in an array and send it to commands.
        //It saves index ys position and send it to the height or just take it - stride so it fits terrains heights index?
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
  //           //this.heightBrush(meshBrush, mesh.vertices, vx, vy, vz, ecs);
  //         } else if (meshBrush.type === ToolBrush.Grass) {
  //           //this.grassBrush(ecs, vx, vy, vz, mesh, meshBrush);
  //           this.grassBrushWithImage(ecs, meshBrush, vx, vy, vz);
  //         } else if (meshBrush.type === ToolBrush.Trees) {
  //           this.treeBrush(ecs, vx, vy, vz);
  //         } else if (meshBrush.type === ToolBrush.Splat) {
  //           this.paintImage(
  //             ecs,
  //             meshBrush,
  //             mesh.vertices[j + 3],
  //             mesh.vertices[j + 4],
  //           );
  //         }
  //         return;
  //       }
  //     }
  //   }
  // }
}
