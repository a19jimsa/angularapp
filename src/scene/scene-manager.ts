import { Entity } from 'src/app/entity';
import { Component } from 'src/components/component';
import { Ecs } from 'src/core/ecs';
import { ArrayManager } from 'src/resource-manager/array-manager';
import { MeshManager } from 'src/resource-manager/mesh-manager';
import { TextureManager } from 'src/resource-manager/texture-manager';

interface SavedScene {
  entities: SavedEntity[];
  files: any[];
}

interface SavedEntity {
  id: Entity;
  components: any[];
}

export class SceneManager {
  static async loadScene(json: any): Promise<Ecs> {
    const ecs = new Ecs();
    for (const entityData of json.entities) {
      const entity = ecs.createEntity();
      for (const [type, data] of Object.entries(entityData.components)) {
        console.log(type, data);
      }
    }
    return ecs;
  }

  static saveScene(ecs: Ecs): SavedScene {
    const scene: SavedScene = {
      entities: [],
      files: [],
    };
    for (const entity of ecs.getEntities()) {
      const components = ecs.getComponents(entity);
      const savedEntity: SavedEntity = {
        id: entity,
        components: [],
      };
      for (const component of components) {
        const savedComponent = this.saveComponent(component);
        savedEntity.components.push(savedComponent);
        const files = this.saveFiles(component);
        if (files.length > 0) {
          scene.files.push(files);
        }
      }
      scene.entities.push(savedEntity);
    }
    return scene;
  }

  static saveBinary(value: string) {
    const coords = ArrayManager.get(value);
    if (coords instanceof Float32Array) {
      const binary = this.savePositions(value);
      if (!binary) return null;
      return binary;
    }
    const meshCoords = MeshManager.getMesh(value);
    if (meshCoords) {
      const binary = this.saveMesh(value);
      return binary;
    }
    return null;
  }

  static saveImage(value: string) {
    const images: HTMLImageElement[] = new Array();
    const texture = TextureManager.getTexture(value);
    if (!texture) return null;
    const coords = texture.ImageData;
    if (coords instanceof Uint8ClampedArray) {
      const image = this.convertCoordsToImage(texture.Paths[0], coords);
      images.push(image);
    } else if (coords instanceof HTMLImageElement) {
      images.push(coords);
    } else if (coords instanceof Array) {
      images.push(...coords);
    }
    return images;
  }

  static saveComponent(component: Component) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(component)) {
      // Spara vanliga värden
      if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        result[key] = value;
      }
    }
    return result;
  }

  static saveFiles(component: Component) {
    const files = Array();
    for (const [key, value] of Object.entries(component)) {
      // Spara vanliga filer
      const images = this.saveImage(value);
      if (images) files.push(images);
      const meshes = this.saveMesh(value);
      if (meshes) files.push(meshes);
      const positions = this.saveBinary(value);
      if (positions) files.push(positions);
    }
    return files;
  }

  static convertCoordsToImage(path: string, coords: Uint8ClampedArray) {
    const canvas = document.createElement('canvas');
    const size = Math.sqrt(coords.length / 4);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < coords.length; i += 4) {
      imgData.data[i + 0] = coords[i + 0];
      imgData.data[i + 1] = coords[i + 1];
      imgData.data[i + 2] = coords[i + 2];
      imgData.data[i + 3] = coords[i + 3];
    }
    ctx.putImageData(imgData, 0, 0);
    const url = canvas.toDataURL(path + 'image/png');
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

  static saveMesh(meshId: string) {
    const mesh = MeshManager.getMesh(meshId);
    if (!mesh) return null;
    const headers = 8;
    const vertexBuffer = mesh.vertexBuffer.vertices;
    const indexBuffer = mesh.indexBuffer.indices;

    // Calculate total size and create buffer
    const totalSize =
      vertexBuffer.byteLength + indexBuffer.byteLength + headers; // 8 bytes for headers (lengths)
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Write header: lengths of each array
    view.setUint32(0, vertexBuffer.byteLength, true);
    view.setUint32(4, indexBuffer.byteLength, true);

    // Copy data into buffer
    new Float32Array(buffer, headers, vertexBuffer.length).set(vertexBuffer);
    new Uint16Array(
      buffer,
      headers + vertexBuffer.byteLength,
      indexBuffer.length,
    ).set(indexBuffer);

    const blob = new Blob([buffer], { type: 'application/octet-stream' });

    return { path: meshId, blob: blob };

    // // Create Blob and download link
    // const blob = new Blob([buffer], { type: 'application/octet-stream' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = 'mesh.bin';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // URL.revokeObjectURL(url);
  }

  static savePositions(id: string) {
    const positions = ArrayManager.getPositions(id);
    if (!positions) return null;

    const buffer = new ArrayBuffer(positions.byteLength);

    new Float32Array(buffer).set(positions);

    const blob = new Blob([buffer], {
      type: 'application/octet-stream',
    });

    return {
      path: id,
      blob,
    };
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

  static async loadObj(file: File) {
    const text = await file.text();
    const lines = text.split('\n');
    const positions: number[][] = [];
    const uvs: number[][] = [];
    const normals: number[][] = [];
    const faces: number[][] = [];
    const vertices: number[] = [];
    const indices: number[] = [];
    for (const line of lines) {
      if (line.startsWith('v ')) {
        const value = line.split(' ');
        const x = Number.parseFloat(value[1]);
        const y = Number.parseFloat(value[2]);
        const z = Number.parseFloat(value[3]);
        positions.push([x, y, z]);
      }
      if (line.startsWith('vt')) {
        const value = line.split(' ');
        const x = Number.parseFloat(value[1]);
        const y = Number.parseFloat(value[2]);
        uvs.push([x, y]);
      }
      if (line.startsWith('vn')) {
        const value = line.split(' ');
        const x = Number.parseFloat(value[1]);
        const y = Number.parseFloat(value[2]);
        const z = Number.parseFloat(value[3]);
        normals.push([x, y, z]);
      }
      if (line.startsWith('f ')) {
        const values = line.split(' ');
        for (const value of values) {
          const indexes = value.split('/');
          console.log(indexes);
          if (indexes.length < 3) continue;
          const x = Number.parseFloat(indexes[0]);
          const y = Number.parseFloat(indexes[1]);
          const z = Number.parseFloat(indexes[2]);
          faces.push([x, y, z]);
        }
      }
    }
    console.log(positions);
    console.log(uvs);
    console.log(normals);
    console.log(faces);
    const indexMap = new Map<string, number>();
    const faceIndices: number[] = [];
    let i = 0;

    for (const [x, y, z] of faces) {
      const key = `${x}/${y}/${z}`;

      const index = indexMap.get(key);

      if (index === undefined) {
        vertices.push(...positions[x - 1], ...uvs[y - 1], ...normals[z - 1]);
        indexMap.set(key, i);
        indices.push(i);
        i++;
      } else {
        indices.push(index);
      }
    }
    console.log(vertices);
    console.log(indices);
    return { vertices, indices };
  }

  static saveJson(data: unknown, filename: string = 'scene.json') {
    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  private static saveToBinary() {}
}
