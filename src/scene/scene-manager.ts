import { Light } from 'src/components/light';
import { Surface } from 'src/components/surface';
import { Name } from 'src/components/name';
import { Splatmap } from 'src/components/splatmap';
import { Terrain } from 'src/components/terrain';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';
import { MeshRenderer } from 'src/components/mesh-renderer';
import { VertexArray } from 'src/renderer/vertex-array';

type Scene = {
  entities: [];
};

export class SceneManager {
  static async loadScene(json: any): Promise<Ecs> {
    const ecs = new Ecs();
    for (const entityData of json.entities) {
      const entity = ecs.createEntity();
      for (const [type, data] of Object.entries(entityData.components)) {
        console.log(type, data);
        if (type === 'Splatmap') {
          const newData = data as Splatmap;
          const splatmap = new Splatmap(newData.size, newData.slot);
          await splatmap.deserialize(splatmap, newData);
          ecs.addComponent<Splatmap>(entity, splatmap);
        } else if (type === 'Terrain') {
          const newData = data as Terrain;
          const terrain = new Terrain(500, 500, 500, 128);
          terrain.deserialize(terrain, newData);
          ecs.addComponent<Terrain>(entity, terrain);
        } else if (type === 'Name') {
          const newData = data as any;
          const name = new Name(newData.value);
          ecs.addComponent<Name>(entity, name);
        } else if (type === 'Material') {
          const newData = data as Surface;
          const surface = new Surface();
          ecs.addComponent<Surface>(entity, surface);
        } else if (type === 'Transform3D') {
          const newData = data as Transform3D;
          const transform = new Transform3D(0, 0, 0);
          ecs.addComponent<Transform3D>(entity, transform);
        } else if (type === 'Light') {
          const newData = data as Light;
          const light = new Light();
          ecs.addComponent<Light>(entity, light);
        }
      }
    }
    return ecs;
  }

  static saveScene(ecs: Ecs) {
    const scene: any[] = [];

    for (const entity of ecs.getEntities()) {
      const entityData: Record<string, any> = {};
      const components = ecs.getComponents(entity) as any[];

      for (const component of components) {
        if (typeof component.serialize === 'function') {
          entityData[component.type] = component.serialize();
        }
      }

      scene.push(entityData);
    }

    return scene;
  }

  static convertCoordsToImage(size: number, coords: Uint8ClampedArray) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < coords.length; i += 4) {
      imgData.data[i + 0] = coords[i + 0];
      imgData.data[i + 1] = coords[i + 1];
      imgData.data[i + 2] = coords[i + 2];
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const url = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = url;
    return img;
  }

  static convertImageToCoords(path: string): Promise<Uint8ClampedArray> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const coords = new Uint8ClampedArray(imgData.data.length);
        for (let i = 0; i < coords.length; i += 4) {
          coords[i + 0] = imgData.data[i + 0];
          coords[i + 1] = imgData.data[i + 1];
          coords[i + 2] = imgData.data[i + 2];
          coords[i + 3] = imgData.data[i + 3];
        }
        console.log(coords);
        resolve(coords);
      };
      //Really important
      img.src = path;
    });
  }

  static saveMesh(vertexArray: VertexArray) {
    const vertexBuffer = vertexArray.vertexBuffer.vertices;
    const indexBuffer = vertexArray.indexBuffer.indices;

    // Calculate total size and create buffer
    const totalSize = vertexBuffer.byteLength + indexBuffer.byteLength + 8; // 8 bytes for headers (lengths)
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Write header: lengths of each array
    view.setUint32(0, vertexBuffer.byteLength, true);
    view.setUint32(4, indexBuffer.byteLength, true);

    // Copy data into buffer
    new Float32Array(buffer, 8, vertexBuffer.length).set(vertexBuffer);
    new Uint16Array(
      buffer,
      8 + vertexBuffer.byteLength,
      indexBuffer.length,
    ).set(indexBuffer);

    // Create Blob and download link
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mesh.bin';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async loadMesh(file: File): Promise<[Float32Array, Uint16Array]> {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    // Read header
    const vertexByteLength = view.getUint32(0, true);
    const indexByteLength = view.getUint32(4, true);

    // Read vertex data
    const vertexData = new Float32Array(
      buffer,
      8,
      vertexByteLength / Float32Array.BYTES_PER_ELEMENT,
    );

    // Read index data
    const indexData = new Uint16Array(
      buffer,
      8 + vertexByteLength,
      indexByteLength / Uint16Array.BYTES_PER_ELEMENT,
    );

    // If you want independent arrays instead of views into the file buffer
    const vertices = new Float32Array(vertexData);
    const indices = new Uint16Array(indexData);

    return [vertices, indices];
  }
}
