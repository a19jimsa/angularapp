import { HitBox } from 'src/components/hit-box';
import { Bone } from '../components/bone';
import { Vec } from '../app/vec';
import { HurtBox } from 'src/components/hurt-box';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Transform3D } from 'src/components/transform3D';
import { VertexArray } from 'src/renderer/vertex-array';
import { Mouse } from 'src/app/map-editor/map-editor.component';
import { Renderer } from 'src/renderer/renderer';
import { PerspectiveCamera } from 'src/renderer/perspective-camera';

export class MathUtils {
  static interpolateKeyframe(
    startValue: number,
    endValue: number,
    progress: number,
  ): number {
    return startValue + (endValue - startValue) * progress;
  }

  static degreesToRadians(degrees: number) {
    const rotationRadians = (degrees * Math.PI) / 180;
    return rotationRadians;
  }

  static radiansToDegrees(radians: number) {
    const rotationDegrees = radians * (Math.PI / 180);
    return rotationDegrees;
  }

  static findBoneById(bones: Bone[], parentId: string) {
    return bones.find((e) => e.id === parentId);
  }

  static calculateParentPosition(
    position: Vec,
    length: number,
    rotation: number,
  ) {
    const x = position.x + length * Math.cos(this.degreesToRadians(rotation));
    const y = position.y + length * Math.sin(this.degreesToRadians(rotation));
    return new Vec(x, y);
  }

  static calculateGlobalRotation(bones: Bone[], bone: Bone): number {
    if (bone.parentId !== null) {
      const parent = this.findBoneById(bones, bone.parentId);
      if (parent) {
        // Rekursivt addera förälderns globala rotation
        return this.calculateGlobalRotation(bones, parent) + bone.rotation;
      }
    }
    // Om det inte finns någon förälder (root), returnera bara benets egen rotation
    return bone.rotation;
  }

  static isColliding(hitBox: HitBox, hurtBox: HurtBox): boolean {
    return (
      hitBox.position.x + hitBox.width > hurtBox.position.x &&
      hitBox.position.x < hurtBox.position.x + hurtBox.width &&
      hitBox.position.y + hitBox.height > hurtBox.position.y &&
      hitBox.position.y < hurtBox.position.y + hurtBox.height
    );
  }

  static random(min: number, max: number) {
    const value = min + Math.random() * (max - min);
    return value;
  }

  static pickVertexNew(
    transform3D: Transform3D,
    mesh: VertexArray,
    mouse: Mouse,
  ) {
    const camera = Renderer.getCamera();
    const vertices = mesh.vertexBuffer.vertices;
    for (
      let i = vertices.length - mesh.bufferLayout.amount;
      i >= 0;
      i -= mesh.bufferLayout.amount
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
      const dz = mouse.y - sy;

      const d = dx * dx + dz * dz;
      if (d < 300) {
        const index = i;

        return {
          index: index,
          x: vertices[index],
          y: vertices[index + 1],
          z: vertices[index + 2],
        };
      }
    }
    return null;
  }

  //Calculate RayCast from mousePosition of canvas
  //Return mouseRay vector 3
  static calculateRayCast(
    mouse: Mouse,
    canvas: HTMLCanvasElement,
    camera: PerspectiveCamera,
  ) {
    const rect = canvas.getBoundingClientRect();
    const x = mouse.x;
    const y = mouse.y;
    //Between local space -1 - +1
    const clipX = (x / rect.width) * 2 - 1;
    const clipY = (y / rect.height) * -2 + 1;
    const normalizedPos = vec2.fromValues(clipX, clipY);
    const clipCoords = vec4.fromValues(
      normalizedPos[0],
      normalizedPos[1],
      -1,
      1,
    );
    const invertedProjectionMatrix = mat4.create();
    mat4.invert(invertedProjectionMatrix, camera.getProjectionMatrix());
    const eyeCoords = vec4.fromValues(0, 0, 0, 0);
    vec4.transformMat4(eyeCoords, clipCoords, invertedProjectionMatrix);
    const toEyeCoords = vec4.fromValues(eyeCoords[0], eyeCoords[1], -1, 0);
    const invertedView = mat4.create();
    mat4.invert(invertedView, camera.getViewMatrix());
    const rayWorld = vec4.fromValues(0, 0, 0, 0);
    vec4.transformMat4(rayWorld, toEyeCoords, invertedView);
    const mouseRay = vec3.fromValues(rayWorld[0], rayWorld[1], rayWorld[2]);
    vec3.normalize(mouseRay, mouseRay);
    return mouseRay;
  }
}
