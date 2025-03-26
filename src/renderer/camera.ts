import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  cameraPosition = vec3.fromValues(0, 0, 5); // Startposition
  cameraTarget = vec3.fromValues(0, 0, 0); // Blickpunkt
  upVector = vec3.fromValues(0, 1, 0); // "Up"-riktning
  viewMatrix = mat4.create();
}
