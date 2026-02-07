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
import { BatchRenderable } from 'src/components/batch-renderable';
import { Grass } from 'src/components/grass';
import { Mesh } from 'src/components/mesh';
import { Pivot } from 'src/components/pivot';
import { Splatmap } from 'src/components/splatmap';
import { Terrain } from 'src/components/terrain';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { Renderer } from 'src/renderer/renderer';
import { CommandManager } from 'src/resource-manager/command-manager';
import { MeshManager } from 'src/resource-manager/mesh-manager';

export type Height = {
  index: number;
  y: number;
};

export class BrushSystem {
  update(meshBrush: Brush, ecs: Ecs, mouse: Mouse) {
    const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D',
    );
    if (!mesh || !transform3D) return;
    const index = this.pickVertexNew(transform3D, mesh.meshId, mouse);
    if (meshBrush.type === ToolBrush.Height) {
      this.heightBrush(
        meshBrush,
        vec4.fromValues(
          mesh.vertices[index],
          mesh.vertices[index + 1],
          mesh.vertices[index + 2],
          1,
        ),
        ecs,
      );
    } else if (meshBrush.type === ToolBrush.Grass) {
      //this.grassBrush(ecs, vx, vy, vz, mesh, meshBrush);
      this.grassBrushWithImage(
        ecs,
        meshBrush,
        mesh.vertices[index],
        mesh.vertices[index + 1],
        mesh.vertices[index + 2],
      );
    } else if (meshBrush.type === ToolBrush.Trees) {
      this.treeBrush(
        ecs,
        mesh.vertices[index],
        mesh.vertices[index + 1],
        mesh.vertices[index + 2],
      );
    } else if (meshBrush.type === ToolBrush.Splat) {
      this.paintImage(
        ecs,
        meshBrush,
        mesh.vertices[index + 3],
        mesh.vertices[index + 4],
      );
    }
    const pivot = ecs.getComponent<Pivot>(meshBrush.entity, 'Pivot');
    if (!pivot) return;
    const pivotIndex = this.pickVertexNew(transform3D, 'pivot', mouse);
    console.log(pivotIndex);
    this.movePivot(transform3D, mouse, pivotIndex);
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
      let i = 0;
      i < vertices.length;
      i += vertexArray.bufferLayout.stride / 4
    ) {
      const model = mat4.create();

      // translation
      mat4.translate(model, model, transform3D.translate);

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
      if (d < 200) {
        return i;
      }
    }
    return -1;
  }

  private movePivot(transform3D: Transform3D, mouse: Mouse, index: number) {
    const vertexArray = MeshManager.getMesh('pivot');
    if (!vertexArray) return;

    if (mouse.isSelected.select && mouse.isSelected.element === 6) {
      transform3D.translate[0] -= mouse.deltaX;
      return;
    } else if (mouse.isSelected.select && mouse.isSelected.element === 18) {
      transform3D.translate[1] += mouse.deltaY;
      return;
    } else if (mouse.isSelected.select && mouse.isSelected.element === 30) {
      transform3D.translate[2] -= mouse.deltaY;
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
              CommandManager.execute(
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
      CommandManager.execute(
        new GrassBrushCommand(meshBrush.entity, ecs, grassList),
      );
    }
  }

  private grassBrush(
    ecs: Ecs,
    x: number,
    y: number,
    z: number,
    mesh: Mesh,
    meshBrush: Brush,
  ) {
    for (const entity of ecs.getEntities()) {
      const grass = ecs.getComponent<Grass>(entity, 'Grass');
      if (grass) {
        const radius = meshBrush.radius;
        for (let j = -radius; j < meshBrush.radius; j++) {
          for (let i = -radius; i < meshBrush.radius; i++) {
            if (j * j + i * i <= radius * radius) {
              if (grass.positions.length > grass.maxAmount) return;
              //grass.positions.push(x * 2 + j * 0.5, y, z * 2 + i * 0.5);
            }
          }
        }
      }
    }
  }

  private treeBrush(ecs: Ecs, x: number, y: number, z: number) {
    const tree = ecs.createEntity();
    ecs.addComponent<Transform3D>(tree, new Transform3D(x, y, z));
    ecs.addComponent<BatchRenderable>(tree, new BatchRenderable('tree'));
  }

  private paintImage(ecs: Ecs, meshBrush: Brush, uv0: number, uv1: number) {
    //const alpha = meshBrush.alpha;
    const radius = meshBrush.radius * 0.01;
    const splatColor = meshBrush.color;
    const splatmap = ecs.getComponent<Splatmap>(meshBrush.entity, 'Splatmap');
    if (splatmap) {
      const image = this.getImageData(meshBrush.image, radius);
      if (!image) return;
      const texX =
        Math.floor(uv0 * splatmap.width) - Math.floor(image.width / 2);
      const texZ =
        Math.floor(uv1 * splatmap.height) - Math.floor(image.height / 2);
      const splatmapList: SplatBrush[] = [];
      for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
          const dx = texX + x;
          const dz = texZ + y;
          const splatmapIndex = (dz * splatmap.width + dx) * 4;
          const imageIndex = (y * image.width + x) * 4;
          const red = image.data[imageIndex];
          const color = 255 - red; // 0-255 Om vandla svart till färg. 255 om svart
          if (splatColor === 'red') {
            const r = splatmap.coords[splatmapIndex + 0];
            const g = splatmap.coords[splatmapIndex + 1];
            const b = splatmap.coords[splatmapIndex + 2];
            const a = splatmap.coords[splatmapIndex + 3];
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
            const r = splatmap.coords[splatmapIndex + 0];
            const g = splatmap.coords[splatmapIndex + 1];
            const b = splatmap.coords[splatmapIndex + 2];
            const a = splatmap.coords[splatmapIndex + 3];

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
            const r = splatmap.coords[splatmapIndex + 0];
            const g = splatmap.coords[splatmapIndex + 1];
            const b = splatmap.coords[splatmapIndex + 2];
            const a = splatmap.coords[splatmapIndex + 3];

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
            const r = splatmap.coords[splatmapIndex + 0];
            const g = splatmap.coords[splatmapIndex + 1];
            const b = splatmap.coords[splatmapIndex + 2];
            const a = splatmap.coords[splatmapIndex + 3];

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
      CommandManager.execute(
        new SplatBrushCommand(meshBrush.entity, ecs, splatmapList),
      );
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
                255,
              );
              //Green
              splatmap.coords[idx + 1] = Math.min(
                splatmap.coords[idx + 1] - strength,
                255,
              );
              //Blue
              splatmap.coords[idx + 2] = Math.min(
                splatmap.coords[idx + 2] - strength,
                255,
              );
              //Alpha
              splatmap.coords[idx + 3] = Math.min(
                splatmap.coords[idx + 3] - strength,
                255,
              );
            } else if (splatColor === 'green') {
              //Red
              splatmap.coords[idx + 0] = Math.min(
                splatmap.coords[idx + 0] - strength,
                255,
              );
              //Green
              splatmap.coords[idx + 1] = Math.min(
                splatmap.coords[idx + 1] + strength,
                255,
              );
              //Blue
              splatmap.coords[idx + 2] = Math.min(
                splatmap.coords[idx + 2] - strength,
                255,
              );
              //Alpha
              splatmap.coords[idx + 3] = Math.min(
                splatmap.coords[idx + 3] - strength,
                255,
              );
            } else if (splatColor === 'blue') {
              //Red
              splatmap.coords[idx + 0] = Math.min(
                splatmap.coords[idx + 0] - strength,
                255,
              );
              //Green
              splatmap.coords[idx + 1] = Math.min(
                splatmap.coords[idx + 1] - strength,
                255,
              );
              //Blue
              splatmap.coords[idx + 2] = Math.min(
                splatmap.coords[idx + 2] + strength,
                255,
              );
              //Alpha
              splatmap.coords[idx + 3] = Math.min(
                splatmap.coords[idx + 3] - strength,
                255,
              );
            } else if (splatColor === 'alpha') {
              //Red
              splatmap.coords[idx + 0] = Math.min(
                splatmap.coords[idx + 0] - strength,
                255,
              );
              //Green
              splatmap.coords[idx + 1] = Math.min(
                splatmap.coords[idx + 1] - strength,
                255,
              );
              //Blue
              splatmap.coords[idx + 2] = Math.min(
                splatmap.coords[idx + 2] - strength,
                255,
              );
              //Alpha
              splatmap.coords[idx + 3] = Math.min(
                splatmap.coords[idx + 3] + strength,
                255,
              );
            }
          }
        }
      }
    }
  }

  private heightBrush(meshBrush: Brush, position: vec4, ecs: Ecs) {
    const imageData = this.getImageData(meshBrush.image, 1);
    if (!imageData) throw new Error('Could not get image data!');
    const brushRadius = meshBrush.radius;
    const brushStrength = meshBrush.strength;
    const fallOff = meshBrush.fallOff;
    const transform3D = ecs.getComponent<Transform3D>(
      meshBrush.entity,
      'Transform3D',
    );
    const mesh = ecs.getComponent<Mesh>(meshBrush.entity, 'Mesh');
    const terrain = ecs.getComponent<Terrain>(meshBrush.entity, 'Terrain');
    if (!transform3D || !mesh || !terrain) return;
    const commandList: Height[] = new Array();
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
          //Now we have commands instead!
          //Just save all affected vertices in an array and send it to commands.
          commandList.push({ index: i + 1, y: influence });
        }
      }
    }
    CommandManager.execute(
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
