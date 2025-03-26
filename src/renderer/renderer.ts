import { Shader } from './shader';
import { Camera } from './camera';

export class Renderer {
  angle = 0;
  gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  public clear() {}

  public render(shader: Shader, camera: Camera) {

  }

  createMesh() {
    // ---- Skapa 3D-mesh ----
    const gridSize = 50;
    const spacing = 0.2;
    const vertices = [];
    const indices = [];
    const texCoords = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        let z = Math.sin(x * 0.5) * Math.cos(y * 0.5); // Höjddata (ändra för egna berg)
        vertices.push(x * spacing, y * spacing, z);
        texCoords.push(x / (gridSize - 1), y / (gridSize - 1));
      }
    }

    // Skapa trianglar
    for (let y = 0; y < gridSize - 1; y++) {
      for (let x = 0; x < gridSize - 1; x++) {
        let i = y * gridSize + x;
        indices.push(i, i + gridSize, i + 1);
        indices.push(i + 1, i + gridSize, i + gridSize + 1);
      }
    }
    return { vertices, indices, texCoords };
  }
}
