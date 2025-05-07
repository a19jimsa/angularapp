import { mat4, vec3 } from 'gl-matrix';
import { SplatBrush } from 'src/app/map-editor/map-editor.component';
import { Mesh } from 'src/components/mesh';
import { Splatmap } from 'src/components/splatmap';
import { Ecs } from 'src/core/ecs';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';
import { MathUtils } from 'src/Utils/MathUtils';

export class SplatmapSystem {
  update(
    splatBrush: SplatBrush,
    ecs: Ecs,
    mousePos: vec3,
    perspectiveCamera: PerspectiveCamera
  ) {
    for (const entity of ecs.getEntities()) {
      const mesh = ecs.getComponent<Mesh>(entity, 'Mesh');
      const splatmap = ecs.getComponent<Splatmap>(entity, 'Splatmap');
      if (mesh && splatmap) {
        this.pickVertex(
          splatBrush,
          splatmap,
          mesh.vertices,
          mousePos,
          perspectiveCamera
        );
      }
    }
  }

  private pickVertex(
    splatBrush: SplatBrush,
    splatmap: Splatmap,
    vertices: Float32Array,
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
      for (let i = 0; i < vertices.length; i += 8) {
        const vx = vertices[i];
        const vy = vertices[i + 1];
        const vz = vertices[i + 2];
        // Beräkna distans från rayens aktuella punkt till vertexen
        const dx = vx - pos[0];
        const dy = vy - pos[1];
        const dz = vz - pos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Om vi är nära nog en vertex (dist < threshold), skriv ut träffen
        if (dist < epsilon) {
          this.splatmapBrush(
            splatBrush,
            splatmap,
            vertices[i + 3],
            vertices[i + 4]
          );
          return; // Om du vill stoppa när du hittar första träffen
        }
      }
    }
    return null;
  }

  splatmapBrush(
    splatBrush: SplatBrush,
    splatmap: Splatmap,
    uv0: number,
    uv1: number
  ) {
    const texX = Math.floor(uv0 * splatmap.width); // Omvandla u till texel X
    const texY = Math.floor(uv1 * splatmap.height); // Omvandla v till texel Y
    this.paintCircle(splatBrush, splatmap, texX, texY);
  }

  paintRect(
    splatmap: Uint8ClampedArray,
    width: number,
    height: number,
    cx: number,
    cy: number,
    size: number
  ) {
    const half = Math.floor(size / 2);
    for (let y = -half; y <= half; y++) {
      for (let x = -half; x <= half; x++) {
        const px = cx + x;
        const py = cy + y;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const idx = (py * width + px) * 4;
          splatmap[idx + 0] = 0; // R
          splatmap[idx + 1] = 255; // G
          splatmap[idx + 2] = 0; // B
          splatmap[idx + 3] = 0; // A
        }
      }
    }
  }

  paintCircle(
    splatBrush: SplatBrush,
    splatmap: Splatmap,
    cx: number,
    cy: number
  ) {
    const alpha = splatBrush.alpha;
    const radius = splatBrush.radius;
    const splatColor = splatBrush.color;
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const dx = x;
        const dy = y;
        if (dx * dx + dy * dy <= radius * radius) {
          const px = cx + dx;
          const py = cy + dy;
          //To not draw outside of width and height
          if (px > 0 && px < splatmap.width && py > 0 && py < splatmap.height) {
            const idx = (py * splatmap.width + px) * 4;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const strength = 255 * (1 - distance / radius) * alpha;
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
